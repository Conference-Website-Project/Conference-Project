"use client";

import React, { useState, useEffect } from "react";
import { DatabaseImportantDate } from "@/types/database";
import { fetchImportantDates, createImportantDate, updateImportantDate, deleteImportantDate } from "@/lib/cms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { Plus, Edit2, Trash2, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

export function ImportantDatesCMS() {
  const [dates, setDates] = useState<DatabaseImportantDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<DatabaseImportantDate | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date_value: "",
    highlight: false,
    display_order: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadDates();
  }, []);

  async function loadDates() {
    setLoading(true);
    const data = await fetchImportantDates();
    setDates(data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingDate(null);
    setFormData({
      title: "",
      date_value: "",
      highlight: false,
      display_order: dates.length + 1,
    });
    setStatusAlert(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: DatabaseImportantDate) => {
    setEditingDate(item);
    setFormData({
      title: item.title,
      date_value: item.date_value,
      highlight: Boolean(item.highlight),
      display_order: item.display_order || 1,
    });
    setStatusAlert(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusAlert(null);

    if (editingDate) {
      const { error } = await updateImportantDate(editingDate.id, {
        title: formData.title,
        date_value: formData.date_value,
        highlight: formData.highlight,
        display_order: Number(formData.display_order),
      });

      if (error) {
        setStatusAlert({ type: "error", message: error });
      } else {
        setStatusAlert({ type: "success", message: "Important date updated successfully!" });
        await loadDates();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } else {
      const { error } = await createImportantDate({
        conference_id: "conf-2027-001",
        title: formData.title,
        date_value: formData.date_value,
        highlight: formData.highlight,
        display_order: Number(formData.display_order),
      });

      if (error) {
        setStatusAlert({ type: "error", message: error });
      } else {
        setStatusAlert({ type: "success", message: "Important date created successfully!" });
        await loadDates();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (item: DatabaseImportantDate) => {
    if (!confirm(`Are you sure you want to delete deadline "${item.title}"?`)) return;

    const { success, error } = await deleteImportantDate(item.id);
    if (!success) {
      window.alert(`Failed to delete deadline: ${error}`);
    } else {
      await loadDates();
    }
  };

  if (loading) {
    return <LoadingState message="Loading Important Dates CMS registry..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">CMS MODULE</Badge>
            <span className="text-xs text-slate-500 font-mono">important_dates</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-academic-navy mt-1">
            Important Dates & Deadlines Management
          </h2>
          <p className="text-xs text-slate-600">
            Add, update, or remove key conference deadlines and submission dates.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Important Date
        </Button>
      </div>

      {/* Dates Table */}
      {dates.length === 0 ? (
        <Card bordered className="text-center py-12">
          <CardContent className="space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-serif font-bold text-academic-navy">No Important Dates Logged</h3>
            <p className="text-xs text-slate-500">
              Click "Add Important Date" to register milestone deadlines.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-serif font-semibold">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Event / Milestone</th>
                <th className="py-3 px-4">Deadline Date Value</th>
                <th className="py-3 px-4">Priority Highlight</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dates.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">
                    #{item.display_order}
                  </td>
                  <td className="py-3 px-4 font-serif font-bold text-academic-navy">
                    {item.title}
                  </td>
                  <td className="py-3 px-4 font-mono text-academic-blue font-semibold">
                    {item.date_value}
                  </td>
                  <td className="py-3 px-4">
                    {item.highlight ? (
                      <Badge variant="gold">Highlighted</Badge>
                    ) : (
                      <Badge variant="slate">Standard</Badge>
                    )}
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

      {/* Add / Edit Date Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDate ? "Edit Deadline Date" : "Add Important Date"}
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

          <Input
            label="Event / Milestone Title *"
            placeholder="e.g. Full Paper Submission Deadline"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Input
            label="Date Text / Display Value *"
            placeholder="e.g. December 15, 2026 or 2026-12-15"
            required
            value={formData.date_value}
            onChange={(e) => setFormData({ ...formData, date_value: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              label="Display Order *"
              type="number"
              min={1}
              required
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            />

            <div className="flex items-center space-x-2 pt-5">
              <input
                type="checkbox"
                id="highlightCheckbox"
                className="w-4 h-4 text-academic-gold rounded focus:ring-academic-gold border-slate-300"
                checked={formData.highlight}
                onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
              />
              <label htmlFor="highlightCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Highlight Priority Deadline
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {editingDate ? "Save Changes" : "Create Deadline"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
