"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, Search, ChevronDown, User } from "lucide-react";
import BundleCard from "@/components/BundleCard";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import NologinbuyModal from "@/components/NologinbuyModal";

interface Bundle {
  id: string;
  size: string;
  price: string;
  expiry: string;
}

export default function BuyPage() {
  const router = useRouter();

  const [buyPhoneNumber, setBuyPhoneNumber] = useState("");
  const [buyBundle, setBuyBundle] = useState<any | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activeCarrier, setActiveCarrier] = useState<"mtn" | "telecel" | "airteltigo">("mtn");
  const [showTracker, setShowTracker] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingResult, setTrackingResult] = useState<any[] | string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadPaystackScript = () => {
      if ((window as any).PaystackPop) return;
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    };
    loadPaystackScript();
  }, []);

  const handleBuyClick = (bundle: any) => {
    setBuyBundle(bundle);
    setPurchaseError(null);
    setPurchaseSuccess(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmPurchase = async () => {
    setPurchaseError(null);
    setPurchaseSuccess(null);

    const mappedPrice = buyBundle ? parseFloat(buyBundle.price.replace("¢", "")) : 0;

    if (!buyPhoneNumber || buyPhoneNumber.trim().length < 10) {
      setPurchaseError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!buyBundle) {
      setPurchaseError("Please select a data package bundle.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      setPurchaseError("Paystack public key configuration is missing.");
      return;
    }

    if (!(window as any).PaystackPop) {
      setPurchaseError("Payment system is still loading, please try again in a moment.");
      return;
    }

    setIsPurchasing(true);

    try {
      const reference = "BUY-" + Date.now().toString();
      const networkMap: Record<string, string> = {
        mtn: "MTN",
        telecel: "Telecel",
        airteltigo: "AirtelTigo",
      };
      const network = networkMap[activeCarrier] || "MTN";
      const bundleName = buyBundle.size;
      const guestEmail = `guest-${buyPhoneNumber}@datasite.com`;

      // Calculate total price with 2% tax rounded to 2 decimal places, then convert to GHS cents
      const tax = 0.02 * mappedPrice;
      const total = Math.round((mappedPrice + tax) * 100) / 100;
      const amountInCents = Math.round(total * 100);

      const handler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: guestEmail,
        currency: "GHS",
        amount: amountInCents,
        ref: reference,
        onClose: () => {
          setIsPurchasing(false);
        },
        callback: function (response: any) {
          (async () => {
            try {
              const res = await fetch("/api/buyDataNoAccount", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  network,
                  bundleName,
                  price: mappedPrice,
                  phoneNumber: buyPhoneNumber,
                  reference,
                }),
              });

              const data = await res.json();

              if (res.ok) {
                setPurchaseSuccess(
                  `Successfully ordered ${bundleName} for ${buyPhoneNumber}. The bundle will deliver shortly.`
                );
                setBuyPhoneNumber("");
              } else {
                setPurchaseError(data.message || "Payment verification failed.");
              }
            } catch (err: any) {
              setPurchaseError(err.message || "Failed to process data purchase.");
            } finally {
              setIsPurchasing(false);
            }
          })();
        },
      });

      handler.openIframe();
    } catch (err: any) {
      setPurchaseError(err.message || "Failed to initialize payment.");
      setIsPurchasing(false);
    }
  };

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

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = trackingCode.trim();
    if (!phone) return;

    setIsSearching(true);
    setTrackingResult(null);

    try {
      const res = await fetch(`/api?phoneNumber=${encodeURIComponent(phone)}`);
      const data = await res.json();
      
      if (res.ok && data.found) {
        setTrackingResult(data.orders || []);
      } else {
        setTrackingResult(data.error || "No orders found for this phone number.");
      }
    } catch (err) {
      console.error(err);
      setTrackingResult("An error occurred while tracking your order. Please try again.");
    } finally {
      setIsSearching(false);
    }
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
      <ToastContainer />
      
      {/* 1. Global Brand Header */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-4 border-b border-slate-100 shadow-sm sm:px-6 md:px-10 lg:px-16">
        <Link href="/" className="inline-flex items-center gap-1.5 group">
          <ChevronLeft className="h-4.5 w-4.5 text-slate-600 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
          <span className="text-[17px] font-black tracking-widest flex items-baseline gap-1 group-hover:opacity-90 transition-opacity">
            <span className="text-[#1e3a8a]">Back</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Mock Dark mode Toggle icon */}
          
          <Link
            href="/auth/signUp"
            className="rounded-lg bg-[#fbcb08] hover:bg-[#eab308] px-4 py-2 text-xs font-bold text-slate-900 shadow-sm transition-all active:scale-[0.98]"
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
            <span> System Is Active 24/7 </span>
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
                Placing more than one order for the <span className="font-extrabold text-amber-950 underline underline-offset-2">same phone number </span>at the same time will cause one of them to be <span className="font-bold">rejected</span>. 
                <span className="font-bold">No refund</span>  for rejected duplicates.
              </span>
            </div>
          </div>

          {/* Purple Banner: Interactive Toggleable Track Order Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#1e3a8a] text-white shadow-md">
            <button
              onClick={() => setShowTracker(!showTracker)}
              className="flex w-full items-center justify-between p-4 text-left cursor-pointer transition-colors hover:bg-[#2145a8]"
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
                    Check delivery status by phone number 
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
              <div className="border-t border-indigo-500 bg-[#3158c4] p-5 space-y-4 animate-in slide-in-from-top duration-200">
                <form onSubmit={handleTrackSearch} className="flex gap-2.5">
                  <input
                    type="text"
                    required
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Enter phone number"
                    className="block flex-1 rounded-xl border border-[orange] bg-white/30 px-4 py-3 text-1xl text-slate-900 placeholder-slate-900  placeholder-text-1xl outline-none focus:ring-2 focus:ring-[orange] focus:border-[orange]"
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
                  <div className="rounded-xl bg-[#1e3a8a] p-4 border border-slate-700 text-xs font-medium leading-relaxed animate-in fade-in duration-300">
                    {typeof trackingResult === "string" ? (
                      <p className="text-slate-300">{trackingResult}</p>
                    ) : trackingResult.length === 0 ? (
                      <p className="text-slate-300">No orders found for this phone number.</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="font-bold text-slate-200 border-b bg-[#1e3a8a] pb-1.5 mb-2">
                          Recent Orders Found ({trackingResult.length})
                        </p>
                        <div className="divide-y divide-slate-700 max-h-[280px] overflow-y-auto pr-1 space-y-3">
                          {trackingResult.map((order: any, idx: number) => (
                            <div key={order.transaction_id || idx} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-100">{order.network} {order.bundleName}</span>
                                  <span className="text-[10px] font-mono text-slate-400">#{order.transaction_id}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Recipient: {order.phoneNumber} • {new Date(order.createdAt).toLocaleString()}
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3">
                                <span className="font-extrabold text-slate-200">GH₵{order.price?.toFixed(2)}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                                  ${order.status === "delivered" || order.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                    order.status === "failed" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                                    order.status === "processing" ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" :
                                    "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                ? "bg-[#fbcb08] text-black shadow-sm border border-[#eab308]"
                : "bg-white border border-black text-black hover:bg-slate-50"
            }`}
          >
             MTN
          </button>
          
          {/* Telecel tab */}
          <button
            onClick={() => setActiveCarrier("telecel")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeCarrier === "telecel"
                ? "bg-rose-600 text-white shadow-sm border border-rose-700"
                : "bg-white border border-black text-black hover:bg-slate-50"
            }`}
          >
            
            Telecel
          </button>

          {/* AirtelTigo tab */}
          <button
            onClick={() => setActiveCarrier("airteltigo")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeCarrier === "airteltigo"
                ? "bg-violet-600 text-white shadow-sm border border-violet-700"
                : "bg-white border border-black text-black hover:bg-slate-50"
            }`}
          >
            
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
        <div className="mb-10 grid grid-cols-2 md:grid-cols-3 gap-3 ">
          {getActiveBundles().map((bundle) => {
            const networkMap: Record<string, string> = {
              mtn: "MTN",
              telecel: "Telecel",
              airteltigo: "AirtelTigo",
            };
            const network = networkMap[activeCarrier] || "MTN";
            const priceVal = parseFloat(bundle.price.replace("¢", ""));

            return (
              <BundleCard
                key={bundle.id}
                network={network}
                name={bundle.size}
                price={priceVal}
                onBuy={() => handleBuyClick(bundle)}
                onClick={() => handleBuyClick(bundle)}
              />
            );
          })}
        </div>

        {/* 8. Footer CTA Card */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-7 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-9">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-100 text-[#fbcb08]">
            <User className="h-6 w-6" strokeWidth={2} />
          </div>
         
          <p className="text-[13px] font-medium text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Create a free account for order history and exclusive deals and get more features 
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

      <NologinbuyModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setBuyBundle(null);
          setPurchaseSuccess(null);
          setPurchaseError(null);
        }}
        bundle={buyBundle ? {
          id: buyBundle.id,
          name: buyBundle.size,
          price: parseFloat(buyBundle.price.replace("¢", "")),
          size: parseFloat(buyBundle.size.replace("GB", "")) || 0
        } : null}
        network={activeCarrier === "mtn" ? "MTN" : activeCarrier === "telecel" ? "Telecel" : "AirtelTigo"}
        phoneNumber={buyPhoneNumber}
        setPhoneNumber={setBuyPhoneNumber}
        isPurchasing={isPurchasing}
        onConfirm={handleConfirmPurchase}
        error={purchaseError}
        success={purchaseSuccess}
      />
    </div>
  );
}
