"use client";

import React, { useState, useEffect } from "react";
import { DatabaseSpeaker } from "@/types/database";
import { fetchSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } from "@/lib/cms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { Plus, Edit2, Trash2, Search, Mic, AlertCircle, CheckCircle2 } from "lucide-react";

export function SpeakersCMS() {
  const [speakers, setSpeakers] = useState<DatabaseSpeaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<DatabaseSpeaker | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    affiliation: "",
    topic: "",
    bio: "",
    image_url: "",
    display_order: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadSpeakers();
  }, []);

  async function loadSpeakers() {
    setLoading(true);
    const data = await fetchSpeakers();
    setSpeakers(data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingSpeaker(null);
    setFormData({
      name: "",
      title: "",
      affiliation: "",
      topic: "",
      bio: "",
      image_url: "",
      display_order: speakers.length + 1,
    });
    setStatusAlert(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (speaker: DatabaseSpeaker) => {
    setEditingSpeaker(speaker);
    setFormData({
      name: speaker.name,
      title: speaker.title,
      affiliation: speaker.affiliation,
      topic: speaker.topic,
      bio: speaker.bio || "",
      image_url: speaker.image_url || "",
      display_order: speaker.display_order || 1,
    });
    setStatusAlert(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusAlert(null);

    if (editingSpeaker) {
      const { error } = await updateSpeaker(editingSpeaker.id, {
        name: formData.name,
        title: formData.title,
        affiliation: formData.affiliation,
        topic: formData.topic,
        bio: formData.bio,
        image_url: formData.image_url || undefined,
        display_order: Number(formData.display_order),
      });

      if (error) {
        setStatusAlert({ type: "error", message: error });
      } else {
        setStatusAlert({ type: "success", message: "Speaker updated successfully!" });
        await loadSpeakers();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } else {
      const { error } = await createSpeaker({
        conference_id: "conf-2027-001",
        name: formData.name,
        title: formData.title,
        affiliation: formData.affiliation,
        topic: formData.topic,
        bio: formData.bio,
        image_url: formData.image_url || undefined,
        display_order: Number(formData.display_order),
      });

      if (error) {
        setStatusAlert({ type: "error", message: error });
      } else {
        setStatusAlert({ type: "success", message: "Speaker created successfully!" });
        await loadSpeakers();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (speaker: DatabaseSpeaker) => {
    if (!confirm(`Are you sure you want to delete speaker "${speaker.name}"?`)) return;

    const { success, error } = await deleteSpeaker(speaker.id);
    if (!success) {
      window.alert(`Failed to delete speaker: ${error}`);
    } else {
      await loadSpeakers();
    }
  };

  const filteredSpeakers = speakers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.affiliation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingState message="Loading Keynote Speakers CMS registry..." />;
  }

  return (
    <div className="space-y-6">
      {/* CMS Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">CMS MODULE</Badge>
            <span className="text-xs text-slate-500 font-mono">speakers</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-academic-navy mt-1">
            Keynote & Invited Speakers Management
          </h2>
          <p className="text-xs text-slate-600">
            Add, update, or remove conference keynote addressers and invited domain experts.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Speaker
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter speakers by name, topic, or affiliation..."
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-academic-blue bg-white outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Speakers Table */}
      {filteredSpeakers.length === 0 ? (
        <Card bordered className="text-center py-12">
          <CardContent className="space-y-3">
            <Mic className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-serif font-bold text-academic-navy">No Speakers Found</h3>
            <p className="text-xs text-slate-500">
              No keynote speakers logged. Click "Add New Speaker" to record a speaker profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-serif font-semibold">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Speaker Info</th>
                  <th className="py-3 px-4">Keynote Topic</th>
                  <th className="py-3 px-4">Affiliation & Designation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSpeakers.map((speaker) => (
                  <tr key={speaker.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #{speaker.display_order}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {speaker.image_url ? (
                          <img
                            src={speaker.image_url}
                            alt={speaker.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-300"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-serif font-bold text-xs flex items-center justify-center border border-amber-400">
                            {speaker.name.split(" ").slice(-1)[0][0]}
                          </div>
                        )}
                        <div>
                          <span className="font-serif font-bold text-academic-navy block">
                            {speaker.name}
                          </span>
                          <span className="text-[11px] text-slate-500">{speaker.title}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-semibold text-academic-navy italic">"{speaker.topic}"</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      <div className="truncate">{speaker.affiliation}</div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(speaker)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(speaker)}
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
        </div>
      )}

      {/* Add / Edit Speaker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpeaker ? "Edit Speaker Profile" : "Add Keynote Speaker"}
        size="lg"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Speaker Full Name *"
              placeholder="e.g. Prof. Eleanor Vance"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Designation / Academic Title *"
              placeholder="e.g. Professor of Computer Science & AI Ethics"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Institution / Organization *"
              placeholder="e.g. Institute for Advanced Studies, UK"
              required
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
            />
            <Input
              label="Keynote Session Topic *"
              placeholder="e.g. Responsible AI Architecture in Next-Gen Systems"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Photo URL (Optional)"
              placeholder="https://example.com/photo.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            <Input
              label="Display Sequence Order *"
              type="number"
              min={1}
              required
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Biography & Research Background"
            placeholder="Brief profile summary of the speaker..."
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {editingSpeaker ? "Save Changes" : "Create Speaker"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
