"use client";

import React from "react";
import Link from "next/link";
import { useDashboard } from "./DashboardContext";
import { Sparkles } from 'lucide-react';
import {
  Wallet,
  ShoppingCart,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  CheckCircle2,
  Clock,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import TopUpWallet from "@/components/topUpwallet";
import { useRouter } from "next/navigation";

export default function DashboardOverviewPage() {
  const { data, error } = useDashboard();
  const router = useRouter();

  if (!data) return null;

  const { user, stats, orders, transactions } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-900 shadow-sm">
          <AlertCircle size={20} className="shrink-0 text-amber-500" />
          <div>
            <h5 className="font-bold text-sm">Notice / Safe Mode</h5>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Welcome Card */}
      <div className="relative bg-[#1e3a8a] rounded-[28px] p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-28 w-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className=" w-full relative z-10 space-y-2 py-5">
       <div className="flex flex-row justify-between flex-nowrap">
          <h2 className="text-[10px] md:text-3xl font-black tracking-tight leading-tight capitalize">
            Hello, {user.name}! <br/> <span className="text-xs sm:text-sm text-gray-200 font-semibold leading-relaxed "> It is {new Date().toLocaleTimeString()}</span>
          </h2>
          <Sparkles className=" text-[#fcd34d]  shadow-[25px_30px_60px_#ffffff] " size={30}/>
          </div> 
          <p className="text-[9px] sm:text-sm text-gray-200 font-semibold leading-relaxed">
            Purchase data bundles easily, manage orders, and earn profits.
          </p>
           <button onClick={()=> router.push('/dashboard/packages')} className="bg-[#ffffff] mt-3 w-full sm:w-auto rounded-2xl text-slate-700 cursor-pointer px-4 py-2 text-sm md:text-xl">Buy Data</button>
        </div> 
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-3 md:px-0">
        {/* Wallet Balance Widget */}
        <div className="bg-white  rounded-[10px] p-4 sm:p-6 shadow-lg flex flex-col justify-between gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Wallet Balance
              </p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {formatCurrency(user.walletBalance)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>

          <div className="pt-2">
            <TopUpWallet />
          </div>
        </div>

        {/* Orders Overview */}
        <div className="bg-white rounded-[10px] p-4 sm:p-6 shadow-lg flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-[16px] bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200/50 shadow-sm">
                <ShoppingBag size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Orders
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {stats.totalOrders}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={13} /> {stats.deliveredOrders} Delivered
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <RefreshCw size={13} /> {stats.processingOrders} Processing
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/orders"
            className="w-full py-2.5 bg-[#fb923c] hover:bg-[#fb923a] rounded-xl text-slate-900 font-bold text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
          >
            View All Orders <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div className="bg-white  rounded-[10px] p-4 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-[15px] sm:text-[17px] tracking-tight">
            Recent Purchase Orders
          </h3>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            See All
          </Link>
        </div>

        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-6">
              No orders recorded yet.
            </p>
          ) : (
            orders.slice(0, 4).map((ord) => (
              <div
                key={ord._id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      ord.network === "MTN"
                        ? "bg-[#ffcc00] text-slate-900"
                        : ord.network === "AirtelTigo"
                        ? "bg-[#0066b3] text-white"
                        : "bg-[#df0000] text-white"
                    }`}
                  >
                    {ord.network[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {ord.bundleName}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {ord.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-950 block">
                    {formatCurrency(ord.price)}
                  </span>
                  <span
                    className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                      ord.status === "delivered"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : ord.status === "processing" || ord.status === "pending"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
