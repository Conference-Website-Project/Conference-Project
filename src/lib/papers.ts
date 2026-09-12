import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { ensurePublicUserExists } from "@/lib/auth";
import { 
  Paper, 
  PaperAuthor, 
  PaperWithDetails, 
  ConferenceTrack, 
  PaperStatus,
  CreatePaperInput, 
  UpdatePaperInput 
} from "@/types/database";

const DEFAULT_CONFERENCE_ID = process.env.NEXT_PUBLIC_CONFERENCE_ID || "conf-2027-001";
const BUCKET_NAME = "paper-manuscripts";

/**
 * Fetch available conference tracks for paper submission
 */
export async function fetchConferenceTracks(
  conferenceId: string = DEFAULT_CONFERENCE_ID
): Promise<{ tracks: ConferenceTrack[]; error: string | null }> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("conference_tracks")
    .select("*")
    .eq("conference_id", conferenceId)
    .order("code", { ascending: true });

  if (error) {
    console.error("Error fetching conference tracks from Supabase:", error.message);
    return { tracks: [], error: error.message };
  }

  return { tracks: (data || []) as ConferenceTrack[], error: null };
}

/**
 * Fetch all paper submissions for the currently authenticated participant
 */
export async function fetchUserPapers(userId: string): Promise<PaperWithDetails[]> {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase
    .from("papers")
    .select(`
      *,
      track:conference_tracks(*)
    `)
    .eq("author_user_id", userId)
    .order("submission_date", { ascending: false });

  if (error) {
    console.error("Error fetching user papers:", error.message);
    return [];
  }

  return (data || []) as PaperWithDetails[];
}

/**
 * Fetch a single paper by primary UUID or human-readable paper_id
 */
export async function fetchPaperById(idOrPaperId: string): Promise<PaperWithDetails | null> {
  const supabase = createBrowserClient();

  // Try querying by UUID or human readable paper_id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPaperId);
  const query = supabase
    .from("papers")
    .select(`
      *,
      track:conference_tracks(*)
    `);

  if (isUuid) {
    query.eq("id", idOrPaperId);
  } else {
    query.eq("paper_id", idOrPaperId);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    console.error("Error fetching paper by ID:", error?.message);
    return null;
  }

  // Fetch submitter profile
  let submitterProfile = undefined;
  if (data.author_user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, institution, country")
      .eq("id", data.author_user_id)
      .single();
    if (profile) submitterProfile = profile;
  }

  // Fetch author records for this paper
  const { data: authors } = await supabase
    .from("paper_authors")
    .select("*")
    .eq("paper_id", data.id)
    .order("display_order", { ascending: true });

  return {
    ...data,
    submitter_profile: submitterProfile,
    authors: (authors || []) as PaperAuthor[],
  } as PaperWithDetails;
}

/**
 * Fetch all submitted papers for Admin review
 */
export async function fetchAllPapersAdmin(conferenceId: string = DEFAULT_CONFERENCE_ID): Promise<PaperWithDetails[]> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("papers")
    .select(`
      *,
      track:conference_tracks(*)
    `)
    .eq("conference_id", conferenceId)
    .order("submission_date", { ascending: false });

  if (error) {
    console.error("Error fetching admin papers:", error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Fetch submitter profiles
  const submitterIds = Array.from(new Set(data.map(p => p.author_user_id).filter(Boolean)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, institution, country")
    .in("id", submitterIds);

  const profileMap = new Map((profiles || []).map(p => [p.id, p]));

  return data.map(paper => ({
    ...paper,
    submitter_profile: profileMap.get(paper.author_user_id),
  })) as PaperWithDetails[];
}

/**
 * Helper to log and format complete Supabase Storage errors (message, name, statusCode)
 */
function formatStorageError(error: any): string {
  if (!error) return "Unknown storage error";
  const message = error.message || "Unknown error";
  const name = error.name || "StorageError";
  const statusCode = error.statusCode || error.status || "N/A";

  console.error("Supabase Storage Error Details:", {
    message,
    name,
    statusCode,
    rawError: error,
  });

  return `${message} (Error: ${name}, Status: ${statusCode})`;
}

/**
 * Submit a new research paper with manuscript PDF upload
 */
export async function submitPaper(
  userId: string, 
  input: CreatePaperInput
): Promise<{ paper: PaperWithDetails | null; error: string | null }> {
  const supabase = createBrowserClient();
  const conferenceId = input.conference_id || DEFAULT_CONFERENCE_ID;

  // 1. Strict File Validation (PDF Format Only)
  if (!input.file) {
    return { paper: null, error: "Please select a manuscript PDF file to upload." };
  }

  const isPdf = input.file.type === "application/pdf" || input.file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return { paper: null, error: "Invalid file format. Only PDF (.pdf) documents are accepted." };
  }

  // Generate deterministic unique paper UUID
  const paperUuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `paper-${Date.now()}`;
  const manuscriptPath = `${conferenceId}/${userId}/${paperUuid}/manuscript.pdf`;

  // 2. Upload PDF Manuscript to Private Supabase Storage Bucket
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(manuscriptPath, input.file, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    const errorDetail = formatStorageError(uploadError);
    return { 
      paper: null, 
      error: `Manuscript upload failed: ${errorDetail}.` 
    };
  }

  // 3. Ensure row exists in public.users to satisfy FK papers_author_user_id_fkey -> public.users.id
  await ensurePublicUserExists(userId);

  // 4. Create Paper Record in PostgreSQL matching actual schema
  const newPaperRecord = {
    id: paperUuid,
    conference_id: conferenceId,
    track_id: input.track_id,
    author_user_id: userId,
    title: input.title.trim(),
    abstract: input.abstract.trim(),
    keywords: input.keywords,
    file_url: manuscriptPath,
    manuscript_path: manuscriptPath,
    status: "SUBMITTED" as PaperStatus,
    submission_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: createdPaper, error: paperDbError } = await supabase
    .from("papers")
    .insert([newPaperRecord])
    .select()
    .single();

  if (paperDbError) {
    console.error("Database paper creation error:", paperDbError.message);
    // Cleanup uploaded storage manuscript on DB failure
    await supabase.storage.from(BUCKET_NAME).remove([manuscriptPath]);
    return { paper: null, error: `Database submission failed: ${paperDbError.message}` };
  }

  // 4. Create Paper Authors Records
  const authorRecords = input.authors.map((author, index) => ({
    paper_id: createdPaper.id,
    author_name: author.author_name.trim(),
    author_email: author.author_email.trim(),
    affiliation: author.affiliation.trim(),
    designation: author.designation?.trim() || "",
    is_corresponding: Boolean(author.is_corresponding),
    display_order: index + 1,
  }));

  const { data: createdAuthors, error: authorsDbError } = await supabase
    .from("paper_authors")
    .insert(authorRecords)
    .select();

  if (authorsDbError) {
    console.error("Database authors creation error:", authorsDbError.message);
    // Cleanup paper and storage on author creation failure
    await supabase.from("papers").delete().eq("id", createdPaper.id);
    await supabase.storage.from(BUCKET_NAME).remove([manuscriptPath]);
    return { paper: null, error: `Author records failed to save: ${authorsDbError.message}` };
  }

  return {
    paper: {
      ...createdPaper,
      authors: (createdAuthors || []) as PaperAuthor[],
    } as PaperWithDetails,
    error: null,
  };
}

/**
 * Update an existing paper manuscript or details (allowed only while status === 'SUBMITTED')
 */
export async function updatePaperParticipant(
  paperId: string,
  userId: string,
  input: UpdatePaperInput
): Promise<{ paper: PaperWithDetails | null; error: string | null }> {
  const supabase = createBrowserClient();

  // Verify current paper status
  const existing = await fetchPaperById(paperId);
  if (!existing) {
    return { paper: null, error: "Paper record not found." };
  }

  if (existing.status !== "SUBMITTED") {
    return { paper: null, error: "Submissions that are Under Review or finalized cannot be modified." };
  }

  let manuscriptPath = existing.manuscript_path || existing.file_url || "";

  // If new manuscript PDF file provided, upload replacement
  if (input.file) {
    const isPdf = input.file.type === "application/pdf" || input.file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return { paper: null, error: "Invalid file format. Only PDF (.pdf) documents are accepted." };
    }

    manuscriptPath = `${existing.conference_id}/${userId}/${existing.id}/manuscript.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(manuscriptPath, input.file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      const errorDetail = formatStorageError(uploadError);
      return { paper: null, error: `Failed to upload replacement manuscript: ${errorDetail}` };
    }
  }

  // Update paper fields
  const updates: Partial<Paper> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title) updates.title = input.title.trim();
  if (input.abstract) updates.abstract = input.abstract.trim();
  if (input.keywords) updates.keywords = input.keywords;
  if (input.track_id) updates.track_id = input.track_id;
  if (manuscriptPath) {
    updates.manuscript_path = manuscriptPath;
    updates.file_url = manuscriptPath;
  }

  const { data: updatedPaper, error: updateError } = await supabase
    .from("papers")
    .update(updates)
    .eq("id", existing.id)
    .select()
    .single();

  if (updateError) {
    return { paper: null, error: updateError.message };
  }

  // Update authors list if provided
  if (input.authors && input.authors.length > 0) {
    await supabase.from("paper_authors").delete().eq("paper_id", existing.id);

    const authorRecords = input.authors.map((author, index) => ({
      paper_id: existing.id,
      author_name: author.author_name.trim(),
      author_email: author.author_email.trim(),
      affiliation: author.affiliation.trim(),
      designation: author.designation?.trim() || "",
      is_corresponding: Boolean(author.is_corresponding),
      display_order: index + 1,
    }));

    await supabase.from("paper_authors").insert(authorRecords);
  }

  const refreshed = await fetchPaperById(existing.id);
  return { paper: refreshed, error: null };
}

/**
 * Admin function to update paper status (SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, CAMERA_READY_SUBMITTED)
 */
export async function updatePaperStatusAdmin(
  paperId: string, 
  newStatus: PaperStatus
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from("papers")
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paperId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Generate a short-lived secure signed URL to private PDF manuscript in Supabase Storage
 */
export async function getManuscriptSignedUrl(
  manuscriptPath: string, 
  expiresInSeconds: number = 3600
): Promise<{ url: string | null; error: string | null }> {
  if (!manuscriptPath) {
    return { url: null, error: "No manuscript path associated with this submission." };
  }

  const supabase = createBrowserClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(manuscriptPath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error("Error creating manuscript signed URL:", error?.message);
    return { url: null, error: error?.message || "Failed to generate manuscript preview link." };
  }

  return { url: data.signedUrl, error: null };
}
