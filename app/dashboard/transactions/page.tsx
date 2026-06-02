"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function TransactionsPage() {
  const { data } = useDashboard();

  if (!data) return null;

  const transactions = data.transactions || [];

  return (
    <div className="bg-white rounded-[10px] p-4 sm:p-6 shadow-sm animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-slate-900 text-lg tracking-tight">
            Transactions History
          </h3>
        
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 select-none text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
              <th className="py-3 px-4 rounded-l-xl">Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Reference No.</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 rounded-r-xl">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx._id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors font-medium text-slate-700"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span
                      className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                        tx.transactionType === "credit"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {tx.transactionType === "credit" ? (
                        <ArrowDownLeft size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                    </span>
                    <span className="capitalize">{tx.type}</span>
                  </td>
                  <td
                    className={`py-3.5 px-4 font-black ${
                      tx.transactionType === "credit" ? "text-emerald-600" : "text-slate-950"
                    }`}
                  >
                    {tx.transactionType === "credit" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3.5 px-4 max-w-[200px] truncate">{tx.description}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                    {tx.reference}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 select-none">
                    {new Date(tx.createdAt).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        tx.status === "success"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : tx.status === "pending"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
