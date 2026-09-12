"use client";

import React, { useState, useEffect } from "react";
import { DatabaseCommitteeMember } from "@/types/database";
import { fetchCommitteeMembers, createCommitteeMember, updateCommitteeMember, deleteCommitteeMember } from "@/lib/cms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { Plus, Edit2, Trash2, Award, AlertCircle, CheckCircle2 } from "lucide-react";

export function CommitteeCMS() {
  const [members, setMembers] = useState<DatabaseCommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DatabaseCommitteeMember | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    affiliation: string;
    category: 'patron' | 'chair' | 'organizing' | 'technical';
    display_order: number;
  }>({
    name: "",
    role: "",
    affiliation: "",
    category: "organizing",
    display_order: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadCommittee();
  }, []);

  async function loadCommittee() {
    setLoading(true);
    const data = await fetchCommitteeMembers();
    setMembers(data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      affiliation: "",
      category: "organizing",
      display_order: members.length + 1,
    });
    setAlert(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: DatabaseCommitteeMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      affiliation: member.affiliation,
      category: member.category,
      display_order: member.display_order || 1,
    });
    setAlert(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    if (editingMember) {
      const { error } = await updateCommitteeMember(editingMember.id, {
        name: formData.name,
        role: formData.role,
        affiliation: formData.affiliation,
        category: formData.category,
        display_order: Number(formData.display_order),
      });

      if (error) {
        setAlert({ type: "error", message: error });
      } else {
        setAlert({ type: "success", message: "Committee member updated successfully!" });
        await loadCommittee();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } else {
      const { error } = await createCommitteeMember({
        conference_id: "conf-2027-001",
        name: formData.name,
        role: formData.role,
        affiliation: formData.affiliation,
        category: formData.category,
        display_order: Number(formData.display_order),
      });

      if (error) {
        setAlert({ type: "error", message: error });
      } else {
        setAlert({ type: "success", message: "Committee member added successfully!" });
        await loadCommittee();
        setTimeout(() => setIsModalOpen(false), 800);
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (member: DatabaseCommitteeMember) => {
    if (!confirm(`Are you sure you want to delete committee member "${member.name}"?`)) return;

    const { success, error } = await deleteCommitteeMember(member.id);
    if (!success) {
      alert(`Failed to delete member: ${error}`);
    } else {
      await loadCommittee();
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "patron":
        return <Badge variant="gold">Patron</Badge>;
      case "chair":
        return <Badge variant="navy">Chair</Badge>;
      case "technical":
        return <Badge variant="crimson">Technical Committee</Badge>;
      default:
        return <Badge variant="slate">Organizing</Badge>;
    }
  };

  if (loading) {
    return <LoadingState message="Loading Committee Members CMS registry..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">CMS MODULE</Badge>
            <span className="text-xs text-slate-500 font-mono">committee_members</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-academic-navy mt-1">
            Committee & Governance Management
          </h2>
          <p className="text-xs text-slate-600">
            Manage patrons, general chairs, organizing secretaries, and technical committee members.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Committee Member
        </Button>
      </div>

      {/* Table */}
      {members.length === 0 ? (
        <Card bordered className="text-center py-12">
          <CardContent className="space-y-3">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-serif font-bold text-academic-navy">No Committee Members Logged</h3>
            <p className="text-xs text-slate-500">
              Click "Add Committee Member" to add governance leadership.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-serif font-semibold">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Designated Role</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Affiliation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">
                    #{member.display_order}
                  </td>
                  <td className="py-3 px-4 font-serif font-bold text-academic-navy">
                    {member.name}
                  </td>
                  <td className="py-3 px-4 text-academic-blue font-semibold">
                    {member.role}
                  </td>
                  <td className="py-3 px-4">
                    {getCategoryBadge(member.category)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {member.affiliation}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(member)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(member)}
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
        title={editingMember ? "Edit Committee Member" : "Add Committee Member"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {alert && (
            <div
              className={`p-3 rounded text-xs flex items-center gap-2 ${
                alert.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          <Input
            label="Member Full Name *"
            placeholder="e.g. Prof. Meera Deshmukh"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assigned Role *"
              placeholder="e.g. General Conference Chair"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <Select
              label="Committee Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              options={[
                { value: "patron", label: "Patron" },
                { value: "chair", label: "General Chair" },
                { value: "organizing", label: "Organizing Committee" },
                { value: "technical", label: "Technical Program Committee" },
              ]}
            />
          </div>

          <Input
            label="Affiliation / Department *"
            placeholder="e.g. Head of Computer Science, University"
            required
            value={formData.affiliation}
            onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
          />

          <Input
            label="Display Sequence Order *"
            type="number"
            min={1}
            required
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              {editingMember ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
