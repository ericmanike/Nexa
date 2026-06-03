"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Clock, Wallet, User as UserIcon, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import clsx from "clsx";

interface Withdrawal {
    _id: string;
    agent: {
        _id: string;
        name: string;
        email: string;
    };
    amount: number;
    phoneNumber: string;
    momoName: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch('/api/admin/withdrawals');
            if (res.ok) {
                const data = await res.json();
                setWithdrawals(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this withdrawal request?`)) return;

        setProcessingId(id);
        try {
            const res = await fetch('/api/admin/withdrawals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });

            if (res.ok) {
                setWithdrawals(prev => prev.map(w => w._id === id ? { ...w, status } : w));
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-zinc-500" size={32} />
            </div>
        );
    }

    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Pending Requests</p>
                        <h3 className="text-2xl font-black">{pendingCount}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Agent</th>
                                <th className="px-6 py-4">Payment Details</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-zinc-400 italic font-medium">
                                        No withdrawal requests found.
                                    </td>
                                </tr>
                            ) : (
                                withdrawals.map((w) => (
                                    <tr key={w._id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-black text-xs">
                                                    {w.agent.name?.[0] || 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-900 leading-none mb-1">{w.agent.name}</p>
                                                    <p className="text-xs text-zinc-500">{w.agent.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
                                                    <Phone size={14} className="text-zinc-400" />
                                                    {w.phoneNumber}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase font-bold tracking-tighter">
                                                    <UserIcon size={12} className="text-zinc-400" />
                                                    {w.momoName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-base font-black text-green-600">
                                                {formatCurrency(w.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-zinc-500 font-medium">
                                            {new Date(w.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-zinc-500 whitespace-nowrap">
                                            <span className={clsx(
                                                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                w.status === 'pending' && "bg-yellow-50 text-yellow-600 border-yellow-100",
                                                w.status === 'approved' && "bg-green-50 text-green-600 border-green-100",
                                                w.status === 'rejected' && "bg-red-50 text-red-600 border-red-100",
                                            )}>
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {w.status === 'pending' ? (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleStatusUpdate(w._id, 'approved')}
                                                        disabled={processingId === w._id}
                                                        className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        {processingId === w._id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(w._id, 'rejected')}
                                                        disabled={processingId === w._id}
                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        {processingId === w._id ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-300 italic text-xs">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
