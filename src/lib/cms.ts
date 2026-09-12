import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth";
import { defaultConferenceConfig } from "@/config/conference";
import {
  Conference,
  DatabaseSpeaker,
  DatabaseImportantDate,
  DatabaseCommitteeMember,
  ConferenceTrack,
  Announcement,
} from "@/types/database";

export const DEFAULT_CONFERENCE_ID = "conf-2027-001";

// ====================================================================
// 1. CONFERENCE DETAILS & VENUE SERVICE
// ====================================================================

export async function fetchConferenceDetails(conferenceId: string = DEFAULT_CONFERENCE_ID): Promise<Conference> {
  const fallbackConfig: Conference = {
    id: defaultConferenceConfig.id,
    name: defaultConferenceConfig.name,
    short_name: defaultConferenceConfig.shortName,
    year: defaultConferenceConfig.year,
    theme: defaultConferenceConfig.theme,
    description: defaultConferenceConfig.institution + " Conference",
    start_date: defaultConferenceConfig.dates.startDate,
    end_date: defaultConferenceConfig.dates.endDate,
    institution: defaultConferenceConfig.institution,
    venue: defaultConferenceConfig.location.venue,
    city: defaultConferenceConfig.location.city,
    state: defaultConferenceConfig.location.state,
    country: defaultConferenceConfig.location.country,
    contact_email: defaultConferenceConfig.contact.email,
    contact_phone: defaultConferenceConfig.contact.phone,
    registration_open: true,
    paper_submission_open: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    return fallbackConfig;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("conferences")
      .select("*")
      .eq("id", conferenceId)
      .maybeSingle();

    if (error) {
      console.warn("Supabase fetchConferenceDetails notice:", error.message);
      return fallbackConfig;
    }

    if (!data) {
      return fallbackConfig;
    }

    return data as Conference;
  } catch (err: any) {
    console.warn("fetchConferenceDetails fallback triggered:", err?.message);
    return fallbackConfig;
  }
}

export async function updateConferenceDetails(
  conferenceId: string,
  updates: Partial<Conference>
): Promise<{ data: Conference | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured in .env.local.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("conferences")
      .update(payload)
      .eq("id", conferenceId)
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { data: data as Conference, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to update conference details.", data: null };
  }
}

// ====================================================================
// 2. SPEAKERS SERVICE (MODULE #1 CRUD)
// ====================================================================

export async function fetchSpeakers(conferenceId: string = DEFAULT_CONFERENCE_ID): Promise<DatabaseSpeaker[]> {
  const fallbackSpeakers: DatabaseSpeaker[] = defaultConferenceConfig.speakers.map((spk, idx) => ({
    id: spk.id,
    conference_id: conferenceId,
    name: spk.name,
    title: spk.title,
    affiliation: spk.affiliation,
    bio: spk.bio,
    topic: spk.topic,
    display_order: idx + 1,
  }));

  if (!isSupabaseConfigured()) {
    return fallbackSpeakers;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("speakers")
      .select("*")
      .eq("conference_id", conferenceId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase fetchSpeakers error:", error.message);
      return fallbackSpeakers;
    }

    if (!data || data.length === 0) {
      return fallbackSpeakers;
    }

    return data as DatabaseSpeaker[];
  } catch (err: any) {
    console.warn("fetchSpeakers error:", err?.message);
    return fallbackSpeakers;
  }
}

export async function createSpeaker(
  speaker: Omit<DatabaseSpeaker, "id">
): Promise<{ data: DatabaseSpeaker | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("speakers")
      .insert([speaker])
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as DatabaseSpeaker, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to create speaker.", data: null };
  }
}

export async function updateSpeaker(
  id: string,
  updates: Partial<DatabaseSpeaker>
): Promise<{ data: DatabaseSpeaker | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("speakers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as DatabaseSpeaker, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to update speaker.", data: null };
  }
}

export async function deleteSpeaker(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", success: false };
  }

  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("speakers").delete().eq("id", id);
    if (error) return { error: error.message, success: false };
    return { success: true, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete speaker.", success: false };
  }
}

// ====================================================================
// 3. IMPORTANT DATES SERVICE
// ====================================================================

export async function fetchImportantDates(conferenceId: string = DEFAULT_CONFERENCE_ID): Promise<DatabaseImportantDate[]> {
  const fallbackDates: DatabaseImportantDate[] = defaultConferenceConfig.importantDates.map((item, idx) => ({
    id: `date-${idx + 1}`,
    conference_id: conferenceId,
    title: item.title,
    date_value: item.date,
    highlight: Boolean(item.highlight),
    display_order: idx + 1,
  }));

  if (!isSupabaseConfigured()) {
    return fallbackDates;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("important_dates")
      .select("*")
      .eq("conference_id", conferenceId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase fetchImportantDates error:", error.message);
      return fallbackDates;
    }

    if (!data || data.length === 0) {
      return fallbackDates;
    }

    return data as DatabaseImportantDate[];
  } catch (err: any) {
    console.warn("fetchImportantDates error:", err?.message);
    return fallbackDates;
  }
}

export async function createImportantDate(
  item: Omit<DatabaseImportantDate, "id">
): Promise<{ data: DatabaseImportantDate | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("important_dates")
      .insert([item])
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as DatabaseImportantDate, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to create important date.", data: null };
  }
}

export async function updateImportantDate(
  id: string,
  updates: Partial<DatabaseImportantDate>
): Promise<{ data: DatabaseImportantDate | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("important_dates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as DatabaseImportantDate, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to update important date.", data: null };
  }
}

export async function deleteImportantDate(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", success: false };
  }

  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("important_dates").delete().eq("id", id);
    if (error) return { error: error.message, success: false };
    return { success: true, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete important date.", success: false };
  }
}

// ====================================================================
// 4. COMMITTEE MEMBERS SERVICE
// ====================================================================

export async function fetchCommitteeMembers(conferenceId: string = DEFAULT_CONFERENCE_ID): Promise<DatabaseCommitteeMember[]> {
  const fallbackCommittee: DatabaseCommitteeMember[] = defaultConferenceConfig.committee.map((item, idx) => ({
    id: `cm-${idx + 1}`,
    conference_id: conferenceId,
    name: item.name,
    role: item.role,
    affiliation: item.affiliation,
    category: item.category,
    display_order: idx + 1,
  }));

  if (!isSupabaseConfigured()) {
    return fallbackCommittee;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("committee_members")
      .select("*")
      .eq("conference_id", conferenceId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase fetchCommitteeMembers error:", error.message);
      return fallbackCommittee;
    }

    if (!data || data.length === 0) {
      return fallbackCommittee;
    }

    return data as DatabaseCommitteeMember[];
  } catch (err: any) {
    console.warn("fetchCommitteeMembers error:", err?.message);
    return fallbackCommittee;
  }
}

export async function createCommitteeMember(
  member: Omit<DatabaseCommitteeMember, "id">
): Promise<{ data: DatabaseCommitteeMember | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("committee_members")
      .insert([member])
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as DatabaseCommitteeMember, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to create committee member.", data: null };
  }
}

export async function updateCommitteeMember(
  id: string,
  updates: Partial<DatabaseCommitteeMember>
): Promise<{ data: DatabaseCommitteeMember | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("committee_members")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as DatabaseCommitteeMember, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to update committee member.", data: null };
  }
}

export async function deleteCommitteeMember(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", success: false };
  }

  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("committee_members").delete().eq("id", id);
    if (error) return { error: error.message, success: false };
    return { success: true, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete committee member.", success: false };
  }
}

// ====================================================================
// 5. CONFERENCE TRACKS SERVICE
// ====================================================================

export async function fetchConferenceTracks(conferenceId: string = DEFAULT_CONFERENCE_ID): Promise<ConferenceTrack[]> {
  const fallbackTracks: ConferenceTrack[] = defaultConferenceConfig.tracks.map((t, idx) => ({
    id: t.id,
    conference_id: conferenceId,
    code: t.code,
    name: t.name,
    description: t.description,
    created_at: new Date().toISOString(),
  }));

  if (!isSupabaseConfigured()) {
    return fallbackTracks;
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("conference_tracks")
      .select("*")
      .eq("conference_id", conferenceId)
      .order("code", { ascending: true });

    if (error) {
      console.warn("Supabase fetchConferenceTracks error:", error.message);
      return fallbackTracks;
    }

    if (!data || data.length === 0) {
      return fallbackTracks;
    }

    return data as ConferenceTrack[];
  } catch (err: any) {
    console.warn("fetchConferenceTracks error:", err?.message);
    return fallbackTracks;
  }
}

export async function createConferenceTrack(
  track: Omit<ConferenceTrack, "id" | "created_at">
): Promise<{ data: ConferenceTrack | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("conference_tracks")
      .insert([track])
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as ConferenceTrack, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to create track.", data: null };
  }
}

export async function updateConferenceTrack(
  id: string,
  updates: Partial<ConferenceTrack>
): Promise<{ data: ConferenceTrack | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("conference_tracks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as ConferenceTrack, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to update track.", data: null };
  }
}

export async function deleteConferenceTrack(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", success: false };
  }

  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("conference_tracks").delete().eq("id", id);
    if (error) return { error: error.message, success: false };
    return { success: true, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete track.", success: false };
  }
}

// ====================================================================
// 6. ANNOUNCEMENTS SERVICE
// ====================================================================

export async function fetchAnnouncements(
  conferenceId: string = DEFAULT_CONFERENCE_ID,
  includeUnpublished: boolean = false
): Promise<Announcement[]> {
  const fallbackAnnouncements: Announcement[] = [
    {
      id: "ann-1",
      conference_id: conferenceId,
      title: "Call for Papers Now Open for ICARET 2027",
      content: "We are excited to announce that paper submissions are officially open across all technical tracks.",
      is_published: true,
      published_at: new Date().toISOString(),
    },
  ];

  if (!isSupabaseConfigured()) {
    return fallbackAnnouncements;
  }

  try {
    const supabase = createBrowserClient();
    let query = supabase
      .from("announcements")
      .select("*")
      .eq("conference_id", conferenceId)
      .order("published_at", { ascending: false });

    if (!includeUnpublished) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase fetchAnnouncements error:", error.message);
      return fallbackAnnouncements;
    }

    if (!data || data.length === 0) {
      return fallbackAnnouncements;
    }

    return data as Announcement[];
  } catch (err: any) {
    console.warn("fetchAnnouncements error:", err?.message);
    return fallbackAnnouncements;
  }
}

export async function createAnnouncement(
  announcement: Omit<Announcement, "id" | "published_at"> & { published_at?: string }
): Promise<{ data: Announcement | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const payload = {
      ...announcement,
      published_at: announcement.published_at || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("announcements")
      .insert([payload])
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as Announcement, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to create announcement.", data: null };
  }
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<Announcement>
): Promise<{ data: Announcement | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", data: null };
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { data: data as Announcement, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to update announcement.", data: null };
  }
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase connection is not configured.", success: false };
  }

  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return { error: error.message, success: false };
    return { success: true, error: null };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete announcement.", success: false };
  }
}
