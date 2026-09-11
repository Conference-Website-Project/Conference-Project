"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchConferenceTracks, submitPaper } from "@/lib/papers";
import { ConferenceTrack, PaperAuthor } from "@/types/database";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  FileText, 
  Users, 
  BookOpen, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Plus, 
  Trash2, 
  FileCheck,
  Tag
} from "lucide-react";

export default function SubmitNewPaperPage() {
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [tracks, setTracks] = useState<ConferenceTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/dashboard/papers/new");
      } else if (profile && !profile.onboarding_completed && profile.role !== "ADMIN") {
        router.push("/onboarding");
      }
    }
  }, [authLoading, isAuthenticated, profile, router]);

  // Form Fields
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState("");

  // Authors List (Defaults to logged-in user as Author #1)
  const [authors, setAuthors] = useState<Omit<PaperAuthor, "id" | "paper_id">[]>([]);

  // Manuscript PDF File
  const [file, setFile] = useState<File | null>(null);

  // Status & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [trackLoadError, setTrackLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTracks() {
      setLoadingTracks(true);
      setTrackLoadError(null);
      const { tracks: loadedTracks, error } = await fetchConferenceTracks();
      if (error) {
        setTrackLoadError(error);
        setTracks([]);
      } else {
        setTracks(loadedTracks);
        if (loadedTracks.length > 0) {
          setSelectedTrackId(loadedTracks[0].id);
        }
      }
      setLoadingTracks(false);
    }
    loadTracks();
  }, []);

  // Pre-fill Author #1 with profile info once loaded
  useEffect(() => {
    if (profile && authors.length === 0) {
      setAuthors([
        {
          author_name: profile.full_name || "",
          author_email: profile.email || "",
          affiliation: profile.institution || "",
          designation: profile.designation || "",
          is_corresponding: true,
          display_order: 1,
        },
      ]);
    }
  }, [profile]);

  if (authLoading || loadingTracks) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingState message="Loading conference submission portal..." />
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: "Details", icon: FileText },
    { num: 2, label: "Authors", icon: Users },
    { num: 3, label: "Track", icon: BookOpen },
    { num: 4, label: "Manuscript", icon: UploadCloud },
    { num: 5, label: "Review", icon: FileCheck },
  ];

  // Handle Keyword Add / Remove
  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().replace(/,/g, "");
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    setKeywords(keywords.filter((_, idx) => idx !== indexToRemove));
  };

  // Author Management
  const handleAddAuthor = () => {
    setAuthors([
      ...authors,
      {
        author_name: "",
        author_email: "",
        affiliation: "",
        designation: "",
        is_corresponding: false,
        display_order: authors.length + 1,
      },
    ]);
  };

  const handleRemoveAuthor = (index: number) => {
    if (authors.length <= 1) {
      setErrorMessage("At least one author is required for paper submission.");
      return;
    }
    const filtered = authors.filter((_, idx) => idx !== index);
    // Ensure corresponding author exists
    if (!filtered.some((a) => a.is_corresponding) && filtered.length > 0) {
      filtered[0].is_corresponding = true;
    }
    setAuthors(filtered);
  };

  const handleUpdateAuthor = (index: number, field: keyof Omit<PaperAuthor, "id" | "paper_id">, value: any) => {
    const updated = [...authors];
    if (field === "is_corresponding") {
      // Uncheck corresponding for all others
      updated.forEach((a, idx) => {
        a.is_corresponding = idx === index;
      });
    } else {
      (updated[index] as any)[field] = value;
    }
    setAuthors(updated);
  };

  // Step Validation
  const handleNextStep = () => {
    setErrorMessage("");

    if (currentStep === 1) {
      if (!title.trim()) {
        setErrorMessage("Please enter the paper title.");
        return;
      }
      if (!abstract.trim() || abstract.trim().length < 50) {
        setErrorMessage("Please provide a comprehensive abstract (at least 50 characters).");
        return;
      }
      if (keywords.length === 0 && !keywordInput.trim()) {
        setErrorMessage("Please add at least one keyword for indexing.");
        return;
      }
      if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
        setKeywordInput("");
      }
    } else if (currentStep === 2) {
      if (authors.length === 0) {
        setErrorMessage("At least one author must be added.");
        return;
      }
      for (let i = 0; i < authors.length; i++) {
        if (!authors[i].author_name.trim() || !authors[i].author_email.trim() || !authors[i].affiliation.trim()) {
          setErrorMessage(`Please fill out Name, Email, and Institution for Author #${i + 1}.`);
          return;
        }
      }
      if (!authors.some((a) => a.is_corresponding)) {
        setErrorMessage("Please select one corresponding author.");
        return;
      }
    } else if (currentStep === 3) {
      if (!selectedTrackId) {
        setErrorMessage("Please select a conference track.");
        return;
      }
    } else if (currentStep === 4) {
      if (!file) {
        setErrorMessage("Please upload your manuscript PDF file.");
        return;
      }
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setErrorMessage("Invalid file format. Only PDF (.pdf) documents are accepted.");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Submission Handler
  const handleFinalSubmit = async () => {
    if (!user?.id || !file) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { paper, error } = await submitPaper(user.id, {
        title: title.trim(),
        abstract: abstract.trim(),
        keywords,
        track_id: selectedTrackId,
        authors,
        file,
      });

      if (error || !paper) {
        setErrorMessage(error || "Paper submission failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success -> Redirect to Paper details
      router.push(`/dashboard/papers/${paper.id}`);
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <Badge variant="navy">{defaultConferenceConfig.shortName}</Badge>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-academic-navy">
          Submit Research Paper
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Submit your manuscript to {defaultConferenceConfig.name}. PDF format only.
        </p>
      </div>

      {/* Progress Step Bar */}
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-subtle space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
          <span className="text-academic-blue font-mono font-bold">STEP {currentStep} OF 5</span>
          <span className="text-slate-500">{stepsList[currentStep - 1].label} Step</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
          <div
            className="bg-academic-blue h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Step Strip */}
        <div className="grid grid-cols-5 text-[11px] text-center pt-1 text-slate-500">
          {stepsList.map((step) => (
            <span
              key={step.num}
              className={`${
                currentStep === step.num
                  ? "text-academic-blue font-bold border-b-2 border-academic-blue pb-0.5"
                  : currentStep > step.num
                  ? "text-slate-800 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Wizard Content Card */}
      <Card bordered accentBorder="gold" className="shadow-lg">
        <CardContent className="pt-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PAPER DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-academic-navy">Paper Metadata</h3>
                <p className="text-xs text-slate-500">
                  Enter title, abstract, and keywords for indexation and review routing.
                </p>
              </div>

              <Input
                label="Paper Title"
                placeholder="e.g. Deep Neural Architectures for Real-Time Sensor Processing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full min-h-[140px] p-3 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-academic-blue focus:border-transparent outline-none"
                  placeholder="Provide a comprehensive abstract outlining research problem, methodology, findings, and conclusion..."
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                />
                <span className="text-[11px] text-slate-500 block">Minimum 50 characters required.</span>
              </div>

              {/* Keywords Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Keywords <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type keyword and press Add (e.g. Neural Networks)"
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
            </div>
          )}

          {/* STEP 2: AUTHORS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-serif font-bold text-academic-navy">Authors & Affiliations</h3>
                  <p className="text-xs text-slate-500">
                    List all co-authors in correct citation order. Designate one corresponding author.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddAuthor} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Author
                </Button>
              </div>

              <div className="space-y-4">
                {authors.map((author, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3 relative"
                  >
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-serif font-bold text-xs text-academic-navy">
                        Author #{index + 1}
                      </span>
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
                        label="Full Name & Title"
                        placeholder="e.g. Dr. Ramesh Kumar"
                        value={author.author_name}
                        onChange={(e) => handleUpdateAuthor(index, "author_name", e.target.value)}
                        required
                      />

                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="author@university.edu"
                        value={author.author_email}
                        onChange={(e) => handleUpdateAuthor(index, "author_email", e.target.value)}
                        required
                      />

                      <Input
                        label="Institution / University"
                        placeholder="e.g. IIT Delhi"
                        value={author.affiliation}
                        onChange={(e) => handleUpdateAuthor(index, "affiliation", e.target.value)}
                        required
                      />

                      <Input
                        label="Designation (Optional)"
                        placeholder="e.g. Associate Professor"
                        value={author.designation || ""}
                        onChange={(e) => handleUpdateAuthor(index, "designation", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="radio"
                        id={`corresponding-${index}`}
                        name="correspondingAuthor"
                        checked={author.is_corresponding}
                        onChange={() => handleUpdateAuthor(index, "is_corresponding", true)}
                        className="w-4 h-4 text-academic-blue focus:ring-academic-blue"
                      />
                      <label htmlFor={`corresponding-${index}`} className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Mark as Corresponding Author for conference correspondence
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: TRACK SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-academic-navy">Select Conference Track</h3>
                <p className="text-xs text-slate-500">
                  Select the most appropriate technical track for expert peer review.
                </p>
              </div>

              {trackLoadError ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Unable to load conference tracks
                  </div>
                  <p>{trackLoadError}</p>
                </div>
              ) : tracks.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 text-center rounded-md space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="font-serif font-bold text-academic-navy text-sm">No Tracks Configured</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No conference tracks have been configured yet for this conference in the database.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrackId(track.id)}
                      className={`p-4 rounded-md border-2 cursor-pointer transition-all ${
                        selectedTrackId === track.id
                          ? "border-academic-blue bg-blue-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-academic-blue bg-blue-100 px-2 py-0.5 rounded">
                            {track.code}
                          </span>
                          <h4 className="font-serif font-bold text-academic-navy text-sm">{track.name}</h4>
                        </div>
                        {selectedTrackId === track.id && (
                          <CheckCircle2 className="w-5 h-5 text-academic-blue shrink-0" />
                        )}
                      </div>
                      {track.description && (
                        <p className="text-xs text-slate-600 mt-1 pl-1">{track.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: MANUSCRIPT UPLOAD */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-academic-navy">Upload PDF Manuscript</h3>
                <p className="text-xs text-slate-500">
                  Upload your full paper manuscript strictly in PDF format.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-academic-blue rounded-lg p-8 text-center bg-slate-50 hover:bg-blue-50/30 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const selected = e.target.files[0];
                      if (!selected.name.toLowerCase().endsWith(".pdf") && selected.type !== "application/pdf") {
                        setErrorMessage("Invalid file. Only PDF (.pdf) files are allowed.");
                        return;
                      }
                      setErrorMessage("");
                      setFile(selected);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-3 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-academic-blue flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-academic-blue block">
                      Click to choose PDF file or drag and drop here
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      Strictly PDF format (.pdf)
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected File Card */}
              {file && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{file.name}</span>
                      <span className="text-slate-500 text-[11px]">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                      </span>
                    </div>
                  </div>
                  <Badge variant="success">Valid PDF</Badge>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & FINAL SUBMIT */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 text-center">
                <h3 className="text-lg font-serif font-bold text-academic-navy">Review & Confirm Submission</h3>
                <p className="text-xs text-slate-500">
                  Verify all details below before finalizing your submission to {defaultConferenceConfig.shortName}.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold">Title</span>
                  <span className="font-serif font-bold text-sm text-academic-navy">{title}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold">Track</span>
                  <span className="text-slate-800 font-medium">
                    {selectedTrack?.code}: {selectedTrack?.name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold mb-1">Authors</span>
                  <div className="space-y-1">
                    {authors.map((a, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span>
                          {idx + 1}. {a.author_name} ({a.affiliation})
                        </span>
                        {a.is_corresponding && (
                          <Badge variant="navy" className="text-[10px]">
                            Corresponding
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold mb-1">Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    {keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[11px] rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold">Manuscript PDF</span>
                  <span className="font-mono text-slate-800">{file?.name}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-4">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back
            </Button>
          ) : (
            <span />
          )}

          {currentStep < 5 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="gold"
              size="md"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Paper
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
