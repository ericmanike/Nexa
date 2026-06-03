"use client";

import { useState, useEffect } from "react";
import { Search, Copy, Wallet, RefreshCw, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/admin/transactions");
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (e) {
        console.error("Failed to fetch transactions:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) =>
    (tx.reference?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (tx.user?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (tx.user?.phone?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (tx.type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (tx.transactionType?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (tx.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="pt-2">
        <h2 className="text-xl font-bold text-zinc-900">All Transactions</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Overview of all system financial movements</p>
      </div>

      <Card className="border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
          <h3 className="text-base font-semibold text-zinc-900">
            Transactions Log <span className="text-zinc-400 font-normal text-sm">({filteredTransactions.length})</span>
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search by ID, user, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-slate-400 transition-colors w-full placeholder-zinc-400"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-medium whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 border-b">Reference</th>
                <th className="px-6 py-4 border-b">User</th>
                <th className="px-6 py-4 border-b">Type</th>
                <th className="px-6 py-4 border-b">Amount</th>
                <th className="px-6 py-4 border-b">Date</th>
                <th className="px-6 py-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 whitespace-nowrap">
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-500 max-w-[140px] truncate">
                          {tx.reference}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(tx.reference).catch(() => alert("Failed to copy ID"))}
                          className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                          title="Copy reference ID"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <span className="text-xs text-zinc-400 truncate max-w-[200px]" title={tx.description}>{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">{tx.user?.name || "Unknown"}</span> 
                      {tx.user?.phone && (
                         <span className="text-xs text-zinc-500"><Link href={`https://wa.me/233${tx.user.phone}`} target="_blank">{tx.user.phone}</Link></span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        {tx.transactionType === "credit" ? (
                            <span className="p-1 rounded-full bg-green-100 text-green-600"><ArrowDownRight size={14} /></span>
                        ) : (
                            <span className="p-1 rounded-full bg-red-100 text-red-600"><ArrowUpRight size={14} /></span>
                        )}
                        <span className="capitalize font-medium text-zinc-700">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">
                      <span className={tx.transactionType === "credit" ? "text-green-600" : "text-zinc-900"}>
                          {tx.transactionType === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-600">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          weekday: "short", year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${tx.status === "success" ? "bg-green-50 text-green-700 border border-green-200" :
                        tx.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-red-50 text-red-700 border border-red-200"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'success' ? 'bg-green-500' : tx.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                      <span className="capitalize">{tx.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <Wallet size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                    <p>No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4 p-4">
          {filteredTransactions.map((tx) => (
            <div key={tx._id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3 border-b border-zinc-100 pb-3">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-zinc-900">{tx.user?.name || "Unknown"}</span>
                  <span className="text-xs text-zinc-500">{tx.user?.phone}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`font-bold text-sm ${tx.transactionType === "credit" ? "text-green-600" : "text-zinc-900"}`}>
                        {tx.transactionType === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider
                        ${tx.status === "success" ? "bg-green-50 text-green-700" :
                        tx.status === "pending" ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-700"}`}>
                        {tx.status}
                    </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                 <div className="flex items-center gap-1.5 font-medium">
                     {tx.transactionType === "credit" ? (
                         <ArrowDownRight size={14} className="text-green-500"/>
                     ) : (
                         <ArrowUpRight size={14} className="text-red-500"/>
                     )}
                     <span className="capitalize">{tx.type}</span>
                 </div>
                 <span>
                    {new Date(tx.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                 </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 p-2 rounded-lg mt-2 font-mono truncate">
                 {tx.reference}
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              <Wallet size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
              <p>No transactions found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
