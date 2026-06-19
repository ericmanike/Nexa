"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function OrdersPage() {
  const { data } = useDashboard();
  const [search, setSearch] = useState("");

  if (!data) return null;

  const orders = data.orders || [];

  const filteredOrders = orders.filter(
    (ord) =>
      ord.phoneNumber.includes(search) ||
      ord.bundleName.toLowerCase().includes(search.toLowerCase()) ||
      ord.transaction_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[10px] p-4 sm:p-6 shadow-sm animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="font-black text-slate-900 text-lg tracking-tight">
          Data Purchase History
          </h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-0.5 select-none">
            Log and tracking details of data bundle purchases.
          </p>
        </div>

        {/* Simple search bar */}
        <div className="relative flex items-center w-full sm:w-auto">
          <Search size={16} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phone, bundle, ref..."
            className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white w-full sm:w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 select-none text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
              <th className="py-3 px-4 rounded-l-xl">Network</th>
              <th className="py-3 px-4">Customer No.</th>
              <th className="py-3 px-4">Bundle Description</th>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 rounded-r-xl">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                  No order records exist matching search details.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr
                  key={ord._id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors font-medium text-slate-700"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span
                      className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                        ord.network === "MTN"
                          ? "bg-[#ffcc00] text-slate-900"
                          : ord.network === "AirtelTigo"
                          ? "bg-[#0066b3]"
                          : "bg-[#df0000]"
                      }`}
                    >
                      {ord.network[0]}
                    </span>
                    {ord.network}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {ord.phoneNumber}
                  </td>
                  <td className="py-3.5 px-4">{ord.bundleName}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                    {ord.transaction_id ? (ord.transaction_id.length > 10 ? ord.transaction_id.slice(0,  10) + "..." : ord.transaction_id) : ""}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-950">
                    {formatCurrency(ord.price)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 select-none">
                    {new Date(ord.createdAt).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ord.status === "delivered"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : ord.status === "processing" || ord.status === "pending"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}
                    >
                      {ord.status}
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
