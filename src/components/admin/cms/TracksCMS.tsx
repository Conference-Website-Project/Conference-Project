"use client";

import React, { useState, useEffect } from "react";
import { ConferenceTrack } from "@/types/database";
import { fetchConferenceTracks, createConferenceTrack, updateConferenceTrack, deleteConferenceTrack } from "@/lib/cms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { Plus, Edit2, Trash2, Layers, AlertCircle, CheckCircle2 } from "lucide-react";

export function TracksCMS() {
  const [tracks, setTracks] = useState<ConferenceTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<ConferenceTrack | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTracks() {
    setLoading(true);
    const data = await fetchConferenceTracks();
    setTracks(data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingTrack(null);
    setFormData({
      code: `TRK-0${tracks.length + 1}`,
      name: "",
      description: "",
    });
    setStatusAlert(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (track: ConferenceTrack) => {
    setEditingTrack(track);
    setFormData({
      code: track.code,
      name: track.name,
      description: track.description || "",
    });
    setStatusAlert(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusAlert(null);

    if (editingTrack) {
      const { error } = await updateConferenceTrack(editingTrack.id, {
        code: formData.code,
        name: formData.name,
        description: formData.description,
      });

      if (error) {
        setStatusAlert({ type: "error", message: error });
      } else {
        setStatusAlert({ type: "success", message: "Track updated successfully!" });
        await loadTracks();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } else {
      const { error } = await createConferenceTrack({
        conference_id: "conf-2027-001",
        code: formData.code,
        name: formData.name,
        description: formData.description,
      });

      if (error) {
        setStatusAlert({ type: "error", message: error });
      } else {
        setStatusAlert({ type: "success", message: "Conference track created successfully!" });
        await loadTracks();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (track: ConferenceTrack) => {
    if (!confirm(`Are you sure you want to delete track "${track.name}" (${track.code})?`)) return;

    const { success, error } = await deleteConferenceTrack(track.id);
    if (!success) {
      window.alert(`Failed to delete track: ${error}`);
    } else {
      await loadTracks();
    }
  };

  if (loading) {
    return <LoadingState message="Loading Conference Tracks CMS registry..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy">CMS MODULE</Badge>
            <span className="text-xs text-slate-500 font-mono">conference_tracks</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-academic-navy mt-1">
            Research Tracks Management
          </h2>
          <p className="text-xs text-slate-600">
            Define call for paper tracks, track codes, and research topic descriptions.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Track
        </Button>
      </div>

      {/* Table */}
      {tracks.length === 0 ? (
        <Card bordered className="text-center py-12">
          <CardContent className="space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-serif font-bold text-academic-navy">No Tracks Configured</h3>
            <p className="text-xs text-slate-500">
              Click "Add New Track" to define conference research tracks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-serif font-semibold">
              <tr>
                <th className="py-3 px-4">Track Code</th>
                <th className="py-3 px-4">Track Title</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tracks.map((track) => (
                <tr key={track.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <Badge variant="navy">{track.code}</Badge>
                  </td>
                  <td className="py-3 px-4 font-serif font-bold text-academic-navy max-w-xs">
                    {track.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">
                    <p className="line-clamp-2">{track.description}</p>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(track)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(track)}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTrack ? "Edit Track Details" : "Add Conference Track"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {statusAlert && (
            <div
              className={`p-3 rounded text-xs flex items-center gap-2 ${
                statusAlert.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {statusAlert.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusAlert.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Track Code *"
              placeholder="e.g. TRK-01"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Input
                label="Track Name *"
                placeholder="e.g. Artificial Intelligence & Data Science"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <Textarea
            label="Track Description & Sub-Topics"
            placeholder="Detailed description of topics accepted in this track..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {editingTrack ? "Save Track" : "Create Track"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
