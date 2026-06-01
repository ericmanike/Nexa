"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Wifi, Smartphone, ChevronRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PackagesPage() {
  const { data, setData } = useDashboard();

  const [buyPhoneNumber, setBuyPhoneNumber] = useState("");
  const [buyNetwork, setBuyNetwork] = useState<"MTN" | "AirtelTigo" | "Telecel">("MTN");
  const [buyBundle, setBuyBundle] = useState<any | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const packagesList = {
    MTN: [
      { id: "mtn-1", name: "1GB Non-Expiry", price: 10, size: 1024 },
      { id: "mtn-2", name: "2.5GB Non-Expiry", price: 22, size: 2560 },
      { id: "mtn-3", name: "5GB Non-Expiry", price: 40, size: 5120 },
      { id: "mtn-4", name: "10GB Non-Expiry", price: 75, size: 10240 },
      { id: "mtn-5", name: "20GB Non-Expiry", price: 140, size: 20480 }
    ],
    AirtelTigo: [
      { id: "at-1", name: "1.5GB Non-Expiry", price: 8, size: 1536 },
      { id: "at-2", name: "3GB Non-Expiry", price: 15, size: 3072 },
      { id: "at-3", name: "6GB Non-Expiry", price: 28, size: 6144 },
      { id: "at-4", name: "12GB Non-Expiry", price: 50, size: 12288 },
      { id: "at-5", name: "25GB Non-Expiry", price: 95, size: 25600 }
    ],
    Telecel: [
      { id: "tc-1", name: "1GB Non-Expiry", price: 9, size: 1024 },
      { id: "tc-2", name: "2.5GB Non-Expiry", price: 20, size: 2560 },
      { id: "tc-3", name: "5.5GB Non-Expiry", price: 38, size: 5632 },
      { id: "tc-4", name: "12GB Non-Expiry", price: 70, size: 12288 },
      { id: "tc-5", name: "25GB Non-Expiry", price: 130, size: 25600 }
    ]
  };

  const handlePurchaseData = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError(null);
    setPurchaseSuccess(null);

    if (!buyPhoneNumber || buyPhoneNumber.trim().length < 10) {
      setPurchaseError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!buyBundle) {
      setPurchaseError("Please select a data package bundle.");
      return;
    }

    if (data && data.user.walletBalance < buyBundle.price) {
      setPurchaseError("Insufficient wallet balance. Please top up your wallet.");
      return;
    }

    setIsPurchasing(true);
    try {
      // Mock loader for visual animation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPurchaseSuccess(
        `Successfully ordered ${buyBundle.name} for ${buyPhoneNumber}. The bundle will deliver shortly.`
      );

      // Deduct balance locally in the layout state!
      if (data && setData) {
        setData({
          ...data,
          user: {
            ...data.user,
            walletBalance: data.user.walletBalance - buyBundle.price
          },
          stats: {
            ...data.stats,
            totalOrders: data.stats.totalOrders + 1,
            totalSpent: data.stats.totalSpent + buyBundle.price
          },
          orders: [
            {
              _id: `order-new-${Date.now()}`,
              bundleName: buyBundle.name,
              network: buyNetwork,
              price: buyBundle.price,
              phoneNumber: buyPhoneNumber,
              status: "processing",
              transaction_id: `TX-${buyNetwork.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}X`,
              createdAt: new Date().toISOString()
            },
            ...data.orders
          ],
          transactions: [
            {
              _id: `tx-new-${Date.now()}`,
              transactionType: "debit",
              type: "purchase",
              amount: buyBundle.price,
              reference: `TX-${buyNetwork.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}X`,
              description: `Bought ${buyNetwork} ${buyBundle.name} for ${buyPhoneNumber}`,
              status: "success",
              createdAt: new Date().toISOString()
            },
            ...data.transactions
          ]
        });
      }

      setBuyPhoneNumber("");
      setBuyBundle(null);
    } catch (err: any) {
      setPurchaseError(err.message || "Failed to process data purchase.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[10px] p-4 sm:p-6 shadow-sm">
        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-2">
          Buy Affordable Internet Bundles
        </h3>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-6 select-none">
          Select network provider, enter customer momo phone number, and choose your favorite bundle. Funds will be debited from your wallet.
        </p>

        <form onSubmit={handlePurchaseData} className="space-y-6">
          {purchaseSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-100 flex gap-2">
              <Check size={16} className="text-emerald-500 shrink-0" />
              <span>{purchaseSuccess}</span>
            </div>
          )}
          {purchaseError && (
            <div className="p-4 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-100 flex gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{purchaseError}</span>
            </div>
          )}

          {/* 1. Network Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 select-none">
              1. Choose Network Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* MTN */}
              <button
                type="button"
                onClick={() => {
                  setBuyNetwork("MTN");
                  setBuyBundle(null);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-2 border-2 cursor-pointer transition-all ${
                  buyNetwork === "MTN"
                    ? "bg-[#ffcc00]/10 border-[#ffcc00] shadow-md scale-[1.01]"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-[#ffcc00] flex items-center justify-center text-slate-900 shadow-sm shrink-0">
                  <Wifi className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">MTN</span>
              </button>

              {/* AirtelTigo */}
              <button
                type="button"
                onClick={() => {
                  setBuyNetwork("AirtelTigo");
                  setBuyBundle(null);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-2 border-2 cursor-pointer transition-all ${
                  buyNetwork === "AirtelTigo"
                    ? "bg-[#0066b3]/10 border-[#0066b3] shadow-md scale-[1.01]"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-[#0066b3] flex items-center justify-center text-white shadow-sm shrink-0">
                  <Wifi className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">AirtelTigo</span>
              </button>

              {/* Telecel */}
              <button
                type="button"
                onClick={() => {
                  setBuyNetwork("Telecel");
                  setBuyBundle(null);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-2 border-2 cursor-pointer transition-all ${
                  buyNetwork === "Telecel"
                    ? "bg-[#df0000]/10 border-[#df0000] shadow-md scale-[1.01]"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-[#df0000] flex items-center justify-center text-white shadow-sm shrink-0">
                  <Wifi className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Telecel</span>
              </button>
            </div>
          </div>

          {/* 2. Customer Phone Number */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 select-none">
              2. Customer Phone Number
            </label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-4 text-slate-400">
                <Smartphone size={18} />
              </div>
              <input
                type="tel"
                required
                value={buyPhoneNumber}
                onChange={(e) => setBuyPhoneNumber(e.target.value)}
                placeholder="e.g. 0543442518"
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* 3. Choose Bundle */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 select-none">
              3. Select Data Bundle
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packagesList[buyNetwork].map((bun) => (
                <button
                  key={bun.id}
                  type="button"
                  onClick={() => setBuyBundle(bun)}
                  className={`p-4 rounded-2xl border flex items-center justify-between text-left cursor-pointer transition-all ${
                    buyBundle?.id === bun.id
                      ? "bg-[#feb400] text-slate-900 border-[#feb400] shadow-md scale-[1.01]"
                      : "bg-slate-50 border-slate-200/60 text-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm">{bun.name}</h5>
                    <p
                      className={`text-[10px] font-semibold mt-0.5 select-none ${
                        buyBundle?.id === bun.id ? "text-slate-700 font-bold" : "text-slate-400"
                      }`}
                    >
                      Non-Expiry bundle
                    </p>
                  </div>
                  <span className="font-black text-sm sm:text-base shrink-0">
                    {formatCurrency(bun.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Pay button */}
          {buyBundle && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-500">
                Total debited from wallet:
              </span>
              <span className="font-black text-slate-900 text-lg">
                {formatCurrency(buyBundle.price)}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPurchasing || !buyBundle || !buyPhoneNumber}
            className="w-full py-4 rounded-2xl bg-[#feb400] hover:bg-[#e6a200] text-slate-900 font-black tracking-wider uppercase text-xs sm:text-sm shadow-md shadow-amber-400/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" /> Processing Transaction...
              </>
            ) : (
              <>
                Purchase Bundle <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
