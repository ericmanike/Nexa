"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";

export default function ProfilePage() {
  const { data } = useDashboard();

  if (!data) return null;

  const { user } = data;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-black text-slate-900 text-lg tracking-tight">
            Account Profile Details
          </h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-0.5 select-none">
            View your profile details and registration credentials.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 select-none">
                Name
              </span>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-800">
                {user.name}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 select-none">
                Email Address
              </span>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-800 truncate">
                {user.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 select-none">
                Phone Number
              </span>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-800">
                {user.phone || "Not set"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 select-none">
                Join Date
              </span>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-800 select-none">
                {new Date(user.createdAt).toLocaleDateString("en-GH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
