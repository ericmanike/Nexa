"use client";

import { useState, useEffect } from "react";
import { 
  Megaphone, Trash2, Plus, 
  Eye, EyeOff, Loader2, Calendar 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import Loader from "../../loading";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNotificationsPage() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.warn("Please enter both title and message.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const newNotif = await res.json();
        setNotifications([newNotif, ...notifications]);
        setForm({ title: "", message: "" });
        toast.success("Notification added successfully!");
      } else {
        toast.error("Failed to add notification");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setNotifications(notifications.map(n => n._id === id ? updated : n));
        toast.success(`Notification ${!currentStatus ? "activated" : "deactivated"} successfully!`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this notification?")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications(notifications.filter(n => n._id !== id));
        toast.success("Notification deleted successfully!");
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting notification");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">


      <div>
        <h2 className="text-lg font-bold text-zinc-900">Notifications</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Send broadcasts to user dashboard notifications bell</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <Card className="border-zinc-200 bg-white h-fit">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Megaphone size={18} className="text-purple-600" />
              Add Notification
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. System Maintenance"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm text-zinc-900 placeholder-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Message
                </label>
                <textarea
                  placeholder="Type your notification message here..."
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm text-zinc-900 placeholder-zinc-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Notification
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* List of Notifications */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-200 bg-white overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900">
                Notification Broadcasts <span className="text-zinc-400 font-normal text-sm">({notifications.length})</span>
              </h3>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 text-zinc-500 font-medium whitespace-nowrap border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-4">Broadcast Details</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {notifications.map((notif) => (
                    <tr key={notif._id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 max-w-[280px]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 truncate">{notif.title}</span>
                          <span className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap line-clamp-3">
                            {notif.message}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-medium">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar size={13} className="text-zinc-400" />
                          {new Date(notif.createdAt).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                          ${notif.isActive 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-zinc-150 text-zinc-500 border-zinc-300"}`}
                        >
                          {notif.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(notif._id, notif.isActive)}
                            disabled={processingId === notif._id}
                            className={`p-2 rounded-xl transition-all border
                              ${notif.isActive 
                                ? "text-zinc-500 border-zinc-200 hover:bg-zinc-50" 
                                : "text-purple-600 border-purple-200 hover:bg-purple-50"}`}
                            title={notif.isActive ? "Deactivate Broadcast" : "Activate Broadcast"}
                          >
                            {notif.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(notif._id)}
                            disabled={processingId === notif._id}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Delete permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {notifications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic">
                        <Megaphone size={28} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                        No notifications broadcasts created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
