"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import {
  Smartphone,
  User,
  CreditCard,
  MapPin,
  AlertCircle,
  Info,
  CheckCircle2,
  Loader2,
  UserPlus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function AFAOrdersPage() {
  const { data, setData, refresh } = useDashboard();

  // Form states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ghanaCard, setGhanaCard] = useState("");
  const [location, setLocation] = useState("");

  const [afaPrice, setAfaPrice] = useState(5.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("/api/afa");
        if (res.ok) {
          const result = await res.json();
          if (result.price !== undefined) {
            setAfaPrice(Number(result.price));
          }
        }
      } catch (err) {
        console.error("Error fetching dynamic AFA price:", err);
      }
    };
    fetchPrice();
  }, []);

  if (!data) return null;

  const user = data.user || { name: "User", email: "guest@dakazina.com", role: "user", walletBalance: 0 };
  const AFA_REGISTRATION_PRICE = afaPrice; // Dynamically loaded price
  const isBalanceInsufficient = user.walletBalance < AFA_REGISTRATION_PRICE;

  // Real-time Validation rules
  const isPhoneValid = /^\d{10}$/.test(phoneNumber);
  // Validates Ghana card format GHA-XXXXXXXXX-X (15 characters)
  const isGhanaCardValid = /^GHA-\d{9}-\d$/i.test(ghanaCard);
  const isNameValid = fullName.trim().length > 0;
  const isLocationValid = location.trim().length >= 3;


  // Auto-format Ghana Card input as user types
  const handleGhanaCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    
    // Auto insert hyphens for GHA-XXXXXXXXX-X
    // Remove all characters except letters, numbers and hyphens
    val = val.replace(/[^A-Z0-9-]/g, "");
    
    // Auto insert hyphen after "GHA"
    if (val.length > 3 && val[3] !== "-") {
      val = val.slice(0, 3) + "-" + val.slice(3);
    }
    // Auto insert hyphen before the last character if length reaches 14/15
    if (val.length > 13 && val[13] !== "-") {
      val = val.slice(0, 13) + "-" + val.slice(13);
    }
    
    // Enforce max length of 15
    if (val.length <= 15) {
      setGhanaCard(val);
    }
  };

  const handleRegisterAFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!isNameValid) {
      setSubmitError("Please enter your Full Name as it appears on your Ghana Card.");
      return;
    }
    if (!isPhoneValid) {
      setSubmitError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!isGhanaCardValid) {
      setSubmitError("Please enter a valid Ghana Card number in the format: GHA-XXXXXXXXX-X.");
      return;
    }
    if (!isLocationValid) {
      setSubmitError("Please enter a detailed location or address (minimum 3 characters).");
      return;
    }
    if (isBalanceInsufficient) {
      setSubmitError(`Insufficient wallet balance. Available balance: ${formatCurrency(user.walletBalance)}. Required: ${formatCurrency(AFA_REGISTRATION_PRICE)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/afa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          ghanaCard,
          location,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to process AFA Registration.");
      }

      setSubmitSuccess(
        `AFA Registration successful for ${fullName} (${phoneNumber}). Wallet debited ${formatCurrency(
          AFA_REGISTRATION_PRICE
        )}.`
      );

      // Trigger context refresh to sync stats, orders, and transactions with DB
      if (refresh) {
        await refresh();
      }

      // Reset form
      setFullName("");
      setPhoneNumber("");
      setGhanaCard("");
      setLocation("");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to process AFA Registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Centered Registration Card (matching image) */}
      <div className="bg-white rounded-[10px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        
        {/* Card Premium Violet/Indigo Header (matching image) */}
        <div className="bg-[#fb923c] py-6 px-6 sm:px-8 text-center text-white flex flex-col items-center justify-center gap-1.5 shadow-inner">
          <div className="bg-white/10 p-2 rounded-2xl flex items-center justify-center shrink-0">
            <Smartphone className="h-6 w-6 text-white shrink-0" />
          </div>
          <h3 className="font-black text-white text-lg tracking-wider uppercase flex items-center gap-1.5 mt-1 select-none">
            AFA Registration
          </h3>
          <p className="text-[11px] font-semibold text-indigo-100/90 leading-relaxed max-w-sm">
            Register for AFA Calltime Package for {formatCurrency(AFA_REGISTRATION_PRICE)} - Stay connected with affordable rates
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <form onSubmit={handleRegisterAFA} className="space-y-5">
            
            {submitSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-100 flex gap-2.5 items-start">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{submitSuccess}</span>
              </div>
            )}
            {submitError && (
              <div className="p-4 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-100 flex gap-2.5 items-start">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* 1. Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-0.5 select-none">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter Full Name"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold pl-1 select-none">
                Name as it appears on Ghana Card
              </p>
            </div>

            {/* 2. Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-0.5 select-none">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Smartphone size={16} className="absolute left-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="0241234567"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold pl-1 select-none">
                Enter 10-digit Ghana number
              </p>
            </div>

            {/* 3. Ghana Card Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-0.5 select-none">
                Ghana Card Number <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <CreditCard size={16} className="absolute left-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={ghanaCard}
                  onChange={handleGhanaCardChange}
                  placeholder="GHA-123456789-1"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold pl-1 select-none">
                Format: GHA-XXXXXXXXX-X (15 characters)
              </p>
            </div>

            {/* 4. Location/Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-0.5 select-none">
                Location/Address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-start">
                <MapPin size={16} className="absolute left-4 top-3.5 text-slate-400 shrink-0" />
                <textarea
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your detailed location or address"
                  rows={3}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold pl-1 select-none">
                Provide your current residential address (minimum 3 characters)
              </p>
            </div>

            {/* Dynamic Balance & Warning Panels Stack (matching image format) */}
            <div className="space-y-2 pt-2">
              
              {/* Available Balance Box */}
              <div className={`p-3.5 rounded-xl border flex gap-3.5 items-center justify-start text-[11px] font-black uppercase tracking-wider select-none ${
                isBalanceInsufficient 
                  ? "bg-red-50 text-red-700 border-red-100" 
                  : "bg-emerald-50 text-emerald-800 border-emerald-100"
              }`}>
                <Info size={16} className={isBalanceInsufficient ? "text-red-500" : "text-emerald-500"} />
                <div className="flex flex-col sm:flex-row justify-between w-full gap-1">
                  <span>Registration Fee: {formatCurrency(AFA_REGISTRATION_PRICE)}</span>
                  <span className="sm:text-right font-medium text-slate-400">Available Balance: {formatCurrency(user.walletBalance)}</span>
                </div>
              </div>

              {/* Insufficient Wallet Warning Box */}
              {isBalanceInsufficient && (
                <div className="p-3.5 bg-red-50 text-red-800 text-[11.5px] font-bold rounded-xl border border-red-100 flex gap-2.5 items-center">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <span>
                    Insufficient balance. Please{" "}
                    <Link href="/dashboard/wallet" className="underline text-red-950 hover:opacity-90 font-extrabold">
                      top up your wallet
                    </Link>
                    .
                  </span>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 select-none shadow-sm cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.99] hover:shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 text-white" /> Registering Package...
                </>
              ) : (
                <>
                  <UserPlus size={15} /> Continue - Pay {formatCurrency(AFA_REGISTRATION_PRICE)}
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
