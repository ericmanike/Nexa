"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, Search, ChevronDown, User } from "lucide-react";

interface Bundle {
  id: string;
  size: string;
  price: string;
  expiry: string;
}

export default function BuyPage() {
  const [activeCarrier, setActiveCarrier] = useState<"mtn" | "telecel" | "airteltigo">("mtn");
  const [showTracker, setShowTracker] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingResult, setTrackingResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Replicating the 13 MTN bundles from the screenshot
  const mtnBundles: Bundle[] = [
    { id: "m1", size: "1GB", price: "¢4.20", expiry: "No Expiry" },
    { id: "m2", size: "2GB", price: "¢9.00", expiry: "No Expiry" },
    { id: "m3", size: "3GB", price: "¢13.50", expiry: "No Expiry" },
    { id: "m4", size: "4GB", price: "¢19.00", expiry: "No Expiry" },
    { id: "m5", size: "5GB", price: "¢23.00", expiry: "No Expiry" },
    { id: "m6", size: "6GB", price: "¢27.00", expiry: "No Expiry" },
    { id: "m7", size: "8GB", price: "¢36.00", expiry: "No Expiry" },
    { id: "m8", size: "10GB", price: "¢43.00", expiry: "No Expiry" },
    { id: "m9", size: "15GB", price: "¢62.00", expiry: "No Expiry" },
    { id: "m10", size: "20GB", price: "¢82.00", expiry: "No Expiry" },
    { id: "m11", size: "25GB", price: "¢103.00", expiry: "No Expiry" },
    { id: "m12", size: "30GB", price: "¢125.00", expiry: "No Expiry" },
    { id: "m13", size: "50GB", price: "¢201.00", expiry: "No Expiry" },
  ];

  // Customized, matched Telecel bundles in Telecel Red style
  const telecelBundles: Bundle[] = [
    { id: "t1", size: "1.5GB", price: "¢6.00", expiry: "No Expiry" },
    { id: "t2", size: "3GB", price: "¢11.00", expiry: "No Expiry" },
    { id: "t3", size: "5GB", price: "¢18.50", expiry: "No Expiry" },
    { id: "t4", size: "10GB", price: "¢35.00", expiry: "No Expiry" },
    { id: "t5", size: "25GB", price: "¢85.00", expiry: "No Expiry" },
  ];

  // Customized, matched AirtelTigo bundles in AirtelTigo Purple style
  const airtelTigoBundles: Bundle[] = [
    { id: "a1", size: "1.2GB", price: "¢5.00", expiry: "No Expiry" },
    { id: "a2", size: "3.5GB", price: "¢12.00", expiry: "No Expiry" },
    { id: "a3", size: "8GB", price: "¢25.00", expiry: "No Expiry" },
    { id: "a4", size: "15GB", price: "¢45.00", expiry: "No Expiry" },
    { id: "a5", size: "35GB", price: "¢98.00", expiry: "No Expiry" },
  ];

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setIsSearching(true);
    setTrackingResult(null);

    setTimeout(() => {
      setIsSearching(false);
      if (trackingCode.trim() === "1841445" || trackingCode.trim() === "#1841445") {
        setTrackingResult("Order #1841445: Delivered successfully on May 27 at 09:50 PM. Thank you for your purchase!");
      } else {
        setTrackingResult(`Status for Reference "${trackingCode}": Processing. Our gateway is steady, estimated completion is within 15 minutes.`);
      }
    }, 1000);
  };

  const getActiveBundles = () => {
    switch (activeCarrier) {
      case "telecel":
        return telecelBundles;
      case "airteltigo":
        return airtelTigoBundles;
      case "mtn":
      default:
        return mtnBundles;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans antialiased pb-20">
      
      {/* 1. Global Brand Header */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-4 border-b border-slate-100 shadow-sm sm:px-6 md:px-10 lg:px-16">
        <Link href="/" className="inline-flex items-center gap-1.5 group">
          <ChevronLeft className="h-4.5 w-4.5 text-slate-600 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
          <span className="text-[17px] font-black tracking-widest flex items-baseline gap-1 group-hover:opacity-90 transition-opacity">
            <span className="text-[#1e3a8a]">Nexa</span>
            <span className="text-[#fb923c]">Bundles</span> 
            <span className="text-slate-500 text-[10px] font-semibold">GH</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Mock Dark mode Toggle icon */}
          
          <Link
            href="/auth/signUp"
            className="rounded-lg bg-[#fbcb08] hover:bg-[#eab308] px-4 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition-all active:scale-[0.98]"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Wrapper */}
      <main className="mx-auto w-full max-w-[840px] px-4 pt-8 sm:px-6 md:pt-10">
        
        {/* 2. Hero Titles */}
        <div className="mb-6 space-y-1.5 text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Buy Data Bundles
          </h1>
          <p className="text-[13px] font-semibold text-slate-500 flex flex-wrap items-center gap-1.5">
            <span>No account needed</span>
            <span className="text-slate-300">•</span>
            <span>Pay via MoMo</span>
            <span className="text-slate-300">•</span>
            <span>24/7 Service</span>
          </p>
        </div>

        {/* 3. Status Panels Stack */}
        <div className="space-y-3.5 mb-6">
          
          {/* Orange Banner: Duplicate Warning */}
          <div className="flex gap-3.5 rounded-2xl border border-amber-200 bg-[#fffbeb] p-4 text-[13px] leading-relaxed text-amber-900 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.8} />
            <div className="space-y-0.5">
              <span className="font-bold block text-amber-900">
                Important: No duplicate orders
              </span>
              <span className="text-amber-800">
                Placing more than one order for the <span className="font-extrabold text-amber-950 underline underline-offset-2">same phone number within 6 minutes</span> will cause one of them to be <span className="font-bold">rejected</span>. <span className="font-bold">No refund</span> will be issued for rejected duplicates.
              </span>
            </div>
          </div>

          {/* Purple Banner: Interactive Toggleable Track Order Card */}
          <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-600 text-white shadow-md">
            <button
              onClick={() => setShowTracker(!showTracker)}
              className="flex w-full items-center justify-between p-4 text-left cursor-pointer transition-colors hover:bg-indigo-700"
            >
              <div className="flex gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Search className="h-5.5 w-5.5" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[14px] font-bold block">
                    Track Your Order
                  </span>
                  <span className="text-xs text-indigo-100 font-medium">
                    Check delivery status by phone or reference
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`h-4.5 w-4.5 text-indigo-200 transition-transform duration-250 ${
                  showTracker ? "rotate-180" : ""
                }`}
                strokeWidth={2.5}
              />
            </button>

            {/* Expanded tracking console */}
            {showTracker && (
              <div className="border-t border-indigo-500 bg-indigo-700 p-5 space-y-4 animate-in slide-in-from-top duration-200">
                <form onSubmit={handleTrackSearch} className="flex gap-2.5">
                  <input
                    type="text"
                    required
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Enter phone number or order tracking reference (#1841445)"
                    className="block flex-1 rounded-xl border border-indigo-400 bg-indigo-800/40 px-4 py-3 text-sm text-white placeholder-indigo-300 outline-none focus:border-white focus:ring-1 focus:ring-white"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="rounded-xl bg-white px-5 py-3 text-xs font-bold text-indigo-900 shadow hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {isSearching ? "Searching..." : "Track"}
                  </button>
                </form>

                {/* Tracker outputs */}
                {trackingResult && (
                  <div className="rounded-xl bg-indigo-900/40 p-4 border border-indigo-500/30 text-xs font-medium leading-relaxed animate-in fade-in duration-300">
                    {trackingResult}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Provider Selection Tabs */}
        <div className="mb-6 flex flex-wrap gap-2.5">
          {/* MTN tab */}
          <button
            onClick={() => setActiveCarrier("mtn")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeCarrier === "mtn"
                ? "bg-[#fbcb08] text-slate-900 shadow-sm border border-[#eab308]"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-[#fbcb08] border border-amber-500" />
            MTN
          </button>
          
          {/* Telecel tab */}
          <button
            onClick={() => setActiveCarrier("telecel")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeCarrier === "telecel"
                ? "bg-rose-600 text-white shadow-sm border border-rose-700"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-rose-600" />
            Telecel
          </button>

          {/* AirtelTigo tab */}
          <button
            onClick={() => setActiveCarrier("airteltigo")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeCarrier === "airteltigo"
                ? "bg-violet-600 text-white shadow-sm border border-violet-700"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-violet-600" />
            AirtelTigo
          </button>
        </div>

        {/* 5. Sub Info line */}
        <div className="mb-6 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 py-2.5 px-4 text-center">
          <p className="text-[11px] font-bold text-indigo-600 tracking-wide uppercase">
            No account needed • Pay with MoMo • Track order above
          </p>
        </div>

       
        {/* 7. Grid of Pricing Cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {getActiveBundles().map((bundle) => (
            <div
              key={bundle.id}
              className={`group relative rounded-[20px] p-5 shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200 flex flex-col justify-between ${
                activeCarrier === "mtn"
                  ? "bg-[#fbcb08] text-slate-900 border border-[#eab308]"
                  : activeCarrier === "telecel"
                  ? "bg-rose-600 text-white border border-rose-700"
                  : "bg-violet-600 text-white border border-violet-700"
              }`}
            >
              {/* Card Header (Brand outline & small down arrow) */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm shrink-0">
                  <span className={`text-[8.5px] font-black ${
                    activeCarrier === "mtn" ? "text-slate-900" : "text-slate-800"
                  }`}>
                    {activeCarrier === "mtn"
                      ? "MTN"
                      : activeCarrier === "telecel"
                      ? "TEL"
                      : "A&T"}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-75 transition-opacity" strokeWidth={2.5} />
              </div>

              {/* Card Body */}
              <div className="space-y-0.5">
                <h3 className="text-2xl font-black tracking-tight leading-none">
                  {bundle.size}
                </h3>
                <span className="text-[10px] font-bold opacity-60 block uppercase tracking-wide">
                  {activeCarrier === "mtn"
                    ? "MTN Bundle"
                    : activeCarrier === "telecel"
                    ? "Telecel Bundle"
                    : "AirtelTigo Bundle"}
                </span>
              </div>

              {/* Card Footer (Price and Expiry) */}
              <div className="flex items-baseline justify-between mt-5 border-t border-black/5 pt-3">
                <span className="text-lg font-black tracking-tight">
                  {bundle.price}
                </span>
                <span className="text-[9.5px] font-bold opacity-60 tracking-wide uppercase">
                  {bundle.expiry}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 8. Footer CTA Card */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-7 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-9">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-100 text-[#fbcb08]">
            <User className="h-6 w-6" strokeWidth={2} />
          </div>
          
          <h4 className="text-[17px] font-bold text-slate-900 mb-1">
            Want more features?
          </h4>
          <p className="text-[13px] font-medium text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Create a free account for order history and exclusive deals
          </p>

          <div className="flex justify-center gap-3.5">
            <Link
              href="/auth/signIn"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors active:scale-[0.98]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signUp"
              className="rounded-xl bg-[#fbcb08] hover:bg-[#eab308] px-5 py-3 text-xs font-bold text-slate-900 shadow-sm transition-colors active:scale-[0.98]"
            >
              Sign Up Free
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
