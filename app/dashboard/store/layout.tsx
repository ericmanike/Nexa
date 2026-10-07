"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Store, Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";
import { useDashboard } from "../DashboardContext";
import RoleUpgradeModal from "@/components/RoleUpgradeModal";
import Loader from "../loading";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const { data, loading } = useDashboard();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  if (loading && !data) {
    return <Loader />;
  }

  const userRole = data?.user?.role;
  const isAgentOrAdmin = userRole === "agent" || userRole === "admin";

  if (!isAgentOrAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-lg border border-slate-100 text-center space-y-6">
          <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Store size={36} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest">
              <ShieldAlert size={13} /> Agent Access Restricted
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Reseller Storefront is Exclusive to Agents
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-md mx-auto">
              You currently have a standard user account. Upgrade your role to Agent to activate your custom storefront, set package price markups, and withdraw profits.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Agent Store Benefits:
            </h4>
            <ul className="text-xs text-slate-700 space-y-2 font-bold">
              <li className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                Custom Reseller Store URL (e.g. yourstore.nexabundlesgh.com)
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                Set your own pricing markup over wholesale base prices
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                Withdraw commissions directly to Mobile Money
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={18} /> Upgrade to Agent Now
            </button>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={16} /> Return to Dashboard
            </Link>
          </div>
        </div>

        <RoleUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
        />
      </div>
    );
  }

  return <div className="w-full h-full">{children}</div>;
}
