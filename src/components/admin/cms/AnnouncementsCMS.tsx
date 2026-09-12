"use client";

import React, { useState, useEffect } from "react";
import { Announcement } from "@/types/database";
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/cms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { Plus, Edit2, Trash2, Megaphone, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

export function AnnouncementsCMS() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_published: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    // Include unpublished items for admin
    const data = await fetchAnnouncements("conf-2027-001", true);
    setAnnouncements(data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      content: "",
      is_published: true,
    });
    setStatusAlert(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Announcement) => {
    setEditingAnnouncement(item);
    setFormData({
      title: item.title,
      content: item.content,
      is_published: item.is_published,
    });
    setStatusAlert(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusAlert(null);

    if (editingAnnouncement) {
      const { error } = await updateAnnouncement(editingAnnouncement.id, {
        title: formData.title,
        content: formData.content,
        is_published: formData.is_published,
      });

      if (error) {
        setStatusAlert({ type: "error", message: error });
      } else {
        setStatusAlert({ type: "success", message: "Announcement updated successfully!" });
        await loadAnnouncements();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } else {
      const { error } = await createAnnouncement({
        conference_id: "conf-2027-001",
        title: formData.title,
        content: formData.content,
        is_published: formData.is_published,
      });

      if (error) {
        setStatusAlert({ type: "error", message: error });
      } else {
        setStatusAlert({ type: "success", message: "Announcement published successfully!" });
        await loadAnnouncements();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    }

    setSubmitting(false);
  };

  const togglePublishStatus = async (item: Announcement) => {
    const newStatus = !item.is_published;
    const { error } = await updateAnnouncement(item.id, { is_published: newStatus });
    if (error) {
      alert(`Failed to update publication status: ${error}`);
    } else {
      await loadAnnouncements();
    }
  };

  const handleDelete = async (item: Announcement) => {
    if (!confirm(`Are you sure you want to delete announcement "${item.title}"?`)) return;

    const { success, error } = await deleteAnnouncement(item.id);
    if (!success) {
      alert(`Failed to delete announcement: ${error}`);
    } else {
      await loadAnnouncements();
    }
  };

  if (loading) {
    return <LoadingState message="Loading Announcements CMS registry..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">CMS MODULE</Badge>
            <span className="text-xs text-slate-500 font-mono">announcements</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-academic-navy mt-1">
            News & Announcements Management
          </h2>
          <p className="text-xs text-slate-600">
            Publish site-wide announcements, news alerts, and urgent attendee notifications.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Announcement
        </Button>
      </div>

      {/* Table */}
      {announcements.length === 0 ? (
        <Card bordered className="text-center py-12">
          <CardContent className="space-y-3">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-serif font-bold text-academic-navy">No Announcements Logged</h3>
            <p className="text-xs text-slate-500">
              Click "New Announcement" to publish a news update.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-serif font-semibold">
              <tr>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-4">Headline / Title</th>
                <th className="py-3 px-4">Content Preview</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {announcements.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(item.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 font-serif font-bold text-academic-navy max-w-xs">
                    {item.title}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">
                    <p className="line-clamp-2">{item.content}</p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublishStatus(item)}
                      className="cursor-pointer focus:outline-none"
                    >
                      {item.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100">
                          <Eye className="w-3 h-3 text-emerald-600" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100">
                          <EyeOff className="w-3 h-3 text-amber-600" /> Draft
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(item)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item)}
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
        title={editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
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

          <Input
            label="Announcement Title / Headline *"
            placeholder="e.g. Call for Papers Extension Announced"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Textarea
            label="Full Announcement Content *"
            placeholder="Write the full announcement text..."
            rows={5}
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isPublishedCheckbox"
              className="w-4 h-4 text-academic-blue rounded focus:ring-academic-blue border-slate-300"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            />
            <label htmlFor="isPublishedCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Publish immediately on public website
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {editingAnnouncement ? "Save Announcement" : "Publish Announcement"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
