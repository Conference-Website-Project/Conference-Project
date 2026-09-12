"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchPaperById, fetchConferenceTracks, updatePaperParticipant } from "@/lib/papers";
import { PaperWithDetails, ConferenceTrack, PaperAuthor } from "@/types/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  BookOpen, 
  UploadCloud, 
  Plus, 
  Trash2, 
  ShieldAlert,
  Tag
} from "lucide-react";

export default function EditPaperPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const paperId = params.id as string;
  const [paper, setPaper] = useState<PaperWithDetails | null>(null);
  const [tracks, setTracks] = useState<ConferenceTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [authors, setAuthors] = useState<Omit<PaperAuthor, "id" | "paper_id">[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      if (paperId) {
        setLoading(true);
        const [paperData, trackRes] = await Promise.all([
          fetchPaperById(paperId),
          fetchConferenceTracks(),
        ]);

        if (!paperData) {
          setErrorMessage("Paper record not found.");
        } else {
          setPaper(paperData);
          setTitle(paperData.title);
          setAbstract(paperData.abstract);
          setKeywords(paperData.keywords || []);
          setSelectedTrackId(paperData.track_id);
          setAuthors(
            (paperData.authors || []).map((a) => ({
              author_name: a.author_name,
              author_email: a.author_email,
              affiliation: a.affiliation,
              is_corresponding: a.is_corresponding,
              display_order: a.display_order,
            }))
          );
        }
        setTracks(trackRes.tracks || []);
        setLoading(false);
      }
    }
    if (!authLoading) {
      loadData();
    }
  }, [paperId, authLoading]);

  // Keyword Helpers
  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().replace(/,/g, "");
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (idx: number) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  // Author Management
  const handleAddAuthor = () => {
    setAuthors([
      ...authors,
      {
        author_name: "",
        author_email: "",
        affiliation: "",
        is_corresponding: false,
        display_order: authors.length + 1,
      },
    ]);
  };

  const handleRemoveAuthor = (index: number) => {
    if (authors.length <= 1) {
      setErrorMessage("At least one author is required.");
      return;
    }
    const filtered = authors.filter((_, idx) => idx !== index);
    if (!filtered.some((a) => a.is_corresponding) && filtered.length > 0) {
      filtered[0].is_corresponding = true;
    }
    setAuthors(filtered);
  };

  const handleUpdateAuthor = (index: number, field: keyof Omit<PaperAuthor, "id" | "paper_id">, value: any) => {
    const updated = [...authors];
    if (field === "is_corresponding") {
      updated.forEach((a, idx) => {
        a.is_corresponding = idx === index;
      });
    } else {
      (updated[index] as any)[field] = value;
    }
    setAuthors(updated);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !paper) return;

    setIsSubmitting(true);
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Paper title is required.");
      setIsSubmitting(false);
      return;
    }

    if (!abstract.trim() || abstract.trim().length < 50) {
      setErrorMessage("Abstract must be at least 50 characters.");
      setIsSubmitting(false);
      return;
    }

    if (authors.length === 0) {
      setErrorMessage("At least one author is required.");
      setIsSubmitting(false);
      return;
    }

    for (let i = 0; i < authors.length; i++) {
      if (!authors[i].author_name.trim() || !authors[i].author_email.trim() || !authors[i].affiliation.trim()) {
        setErrorMessage(`Author #${i + 1} is missing required fields.`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const { paper: updated, error } = await updatePaperParticipant(paper.id, user.id, {
        title: title.trim(),
        abstract: abstract.trim(),
        keywords,
        track_id: selectedTrackId,
        authors,
        file: file || undefined,
      });

      if (error || !updated) {
        setErrorMessage(error || "Failed to update submission.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/dashboard/papers/${paper.id}`);
    } catch (err: any) {
      setErrorMessage("An error occurred while saving updates.");
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <LoadingState message="Loading manuscript editing portal..." />
      </div>
    );
  }

  if (!paper || paper.status !== "SUBMITTED") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-md text-amber-900 max-w-md mx-auto">
          <ShieldAlert className="w-8 h-8 text-amber-700 mx-auto mb-2" />
          <h3 className="font-serif font-bold text-lg">Editing Locked</h3>
          <p className="text-xs text-amber-800 mt-1">
            Submissions that are Under Review, Accepted, or Finalized cannot be edited.
          </p>
        </div>
        <Link href={`/dashboard/papers/${paperId}`}>
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Paper Details
          </Button>
        </Link>
      </div>
    );
  }

  const displayPaperId = paper.paper_id || `ICARET27-${paper.id.substring(0, 4).toUpperCase()}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link href={`/dashboard/papers/${paper.id}`} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-academic-blue font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Cancel Editing
        </Link>
      </div>

      <Card bordered accentBorder="gold" className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <Badge variant="navy" className="mb-1">
                {displayPaperId}
              </Badge>
              <CardTitle className="text-xl font-serif text-academic-navy">
                Edit Paper Submission
              </CardTitle>
              <CardDescription>
                Update metadata, authors, track selection, or replacement manuscript PDF.
              </CardDescription>
            </div>
            <Badge variant="navy">Submitted Status</Badge>
          </div>
        </CardHeader>

        <form onSubmit={handleSaveChanges}>
          <CardContent className="space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Title */}
            <Input
              label="Paper Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Abstract */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Abstract <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full min-h-[140px] p-3 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-academic-blue outline-none"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                required
              />
            </div>

            {/* Track Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Conference Track <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-2.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-academic-blue bg-white"
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
              >
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.code}: {track.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Keywords</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type keyword and press Add"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="md" onClick={handleAddKeyword}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 text-xs rounded-full"
                  >
                    <Tag className="w-3 h-3 text-slate-500" />
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="text-slate-400 hover:text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Authors */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-serif font-bold text-sm text-academic-navy">Authors</span>
                <Button type="button" variant="outline" size="sm" onClick={handleAddAuthor} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Author
                </Button>
              </div>

              {authors.map((author, index) => (
                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs text-slate-700">Author #{index + 1}</span>
                    {authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(index)}
                        className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Full Name"
                      value={author.author_name}
                      onChange={(e) => handleUpdateAuthor(index, "author_name", e.target.value)}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={author.author_email}
                      onChange={(e) => handleUpdateAuthor(index, "author_email", e.target.value)}
                    />
                    <Input
                      label="Institution"
                      value={author.affiliation}
                      onChange={(e) => handleUpdateAuthor(index, "affiliation", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`edit-corr-${index}`}
                      name="editCorresponding"
                      checked={author.is_corresponding}
                      onChange={() => handleUpdateAuthor(index, "is_corresponding", true)}
                    />
                    <label htmlFor={`edit-corr-${index}`} className="text-xs font-semibold text-slate-700">
                      Corresponding Author
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Replacement PDF Upload */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">
                Replace Manuscript PDF File (Optional)
              </label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const sel = e.target.files[0];
                    if (!sel.name.toLowerCase().endsWith(".pdf") && sel.type !== "application/pdf") {
                      setErrorMessage("Only PDF (.pdf) files are allowed.");
                      return;
                    }
                    setErrorMessage("");
                    setFile(sel);
                  }
                }}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-academic-blue hover:file:bg-blue-100"
              />
              <span className="text-[11px] text-slate-500 block">
                Leave empty to retain existing uploaded manuscript.
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-4">
            <Link href={`/dashboard/papers/${paper.id}`}>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="gold"
              size="md"
              isLoading={isSubmitting}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save Updates
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
