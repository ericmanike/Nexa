"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Gift, Check, Copy } from "lucide-react";

export default function ReferralsPage() {
  const { data } = useDashboard();
  const [copiedText, setCopiedText] = useState(false);

  if (!data) return null;

  const { user } = data;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://nexabundlesgh.com/auth/signUp?ref=${user.id}`);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-black text-slate-900 text-lg tracking-tight flex items-center gap-2">
            Referral & Earn Rewards Program <Gift size={18} className="text-rose-500 animate-bounce" />
          </h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-0.5 select-none">
            Share your unique referral link to earn rewards when they register and buy data bundles.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Referred Friends
            </p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">4</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Rewards Earned Balance
            </p>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">GH₵ 12.50</h4>
          </div>
        </div>

        {/* Referral Link Copy */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 select-none">
            Your Referral Link
          </label>
          <div className="flex bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-1.5 gap-2">
            <input
              type="text"
              readOnly
              value={`https://nexabundlesgh.com/auth/signUp?ref=${user.id}`}
              className="bg-transparent border-none flex-1 outline-none text-xs text-slate-600 px-2 font-mono"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#feb400] hover:bg-[#e6a200] text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-[0.99] cursor-pointer shadow-sm"
            >
              {copiedText ? (
                <>
                  <Check size={14} /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
