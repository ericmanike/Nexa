"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { ArrowUpCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function UpgradePage() {
  const { data, setData } = useDashboard();

  if (!data) return null;

  const { user } = data;

  const handleUpgrade = () => {
    toast.success("Reseller agent account upgrade request sent. You will be upgraded shortly.");
    if (setData) {
      setData({
        ...data,
        user: {
          ...data.user,
          role: "agent"
        }
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[10px] p-6 shadow-sm space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <div className="inline-flex h-12 w-12 rounded-full bg-blue-50 text-blue-600 items-center justify-center shadow-sm">
            <ArrowUpCircle size={28} />
          </div>
          <h3 className="font-black text-slate-900 text-xl tracking-tight mt-3">
            Upgrade to Agent & reseller account
          </h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            Resell internet bundles with wholesale prices, create your personalized online storefront, share catalog, and maximize profits!
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center select-none">
            Agent Benefits & comparison
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase select-none">
                Regular User
              </span>
              <h5 className="font-bold text-slate-900 text-sm">Retail Data Pricing</h5>
              <p className="text-xs text-slate-500">
                Buy data bundles at standard catalog prices without reseller discounts.
              </p>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold text-blue-500 uppercase select-none">
                Agent Account
              </span>
              <h5 className="font-bold text-slate-900 text-sm">Wholesale Reseller Prices</h5>
              <p className="text-xs text-slate-500">
                Save up to **15%** on bundle costs, plus unlock your customizable online store.
              </p>
            </div>
          </div>
        </div>

        {user.role === "agent" ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-center font-bold text-xs rounded-2xl border border-emerald-100">
            🎉 You are already upgraded to an **Agent Reseller** role! Get started in "My Store".
          </div>
        ) : (
          <button
            onClick={handleUpgrade}
            className="w-full py-4 bg-[#feb400] hover:bg-[#e6a200] text-slate-900 font-bold tracking-wider uppercase text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            Upgrade Now for Free
          </button>
        )}
      </div>
    </div>
  );
}
