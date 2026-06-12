"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Wifi } from "lucide-react";
import BundleCard from "@/components/BundleCard";
import PurchaseBundleModal from "@/components/PurchaseBundleModal";

export default function PackagesPage() {
  const { data, setData } = useDashboard();

  const [buyPhoneNumber, setBuyPhoneNumber] = useState("");
  const [buyNetwork, setBuyNetwork] = useState<"MTN" | "AirtelTigo" | "Telecel">("MTN");
  const [buyBundle, setBuyBundle] = useState<any | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  const handleCardClick = (bun: any) => {
    setBuyBundle(bun);
    setPurchaseError(null);
    setPurchaseSuccess(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmPurchase = async () => {
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
          Select network provider, choose your favorite bundle to open the checkout window, enter details, and pay instantly from your wallet.
        </p>

        <div className="space-y-6">
          {/* 1. Network Selector */}
          <div className="space-y-2">
           
            <div className="flex flex-wrap gap-2.5 pt-1">
              {/* MTN */}
              <button
                type="button"
                onClick={() => {
                  setBuyNetwork("MTN");
                  setBuyBundle(null);
                }}
                className={`px-4.5 py-2.5 rounded-xl flex items-center gap-2 border text-xs font-extrabold cursor-pointer transition-all active:scale-[0.97] ${
                  buyNetwork === "MTN"
                    ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-lg"
                    : "bg-slate-50  text-black hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
               
                MTN
              </button>


                {/* Telecel */}
              <button
                type="button"
                onClick={() => {
                  setBuyNetwork("Telecel");
                  setBuyBundle(null);
                }}
                className={`px-4.5 py-2.5 rounded-xl flex items-center gap-2 border text-xs font-extrabold cursor-pointer transition-all active:scale-[0.97] ${
                  buyNetwork === "Telecel"
                    ? "bg-[#df0000] border-[#df0000] text-white shadow-sm"
                    : "bg-slate-50  text-black hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
               
                Telecel
              </button>

              {/* AirtelTigo */}
              <button
                type="button"
                onClick={() => {
                  setBuyNetwork("AirtelTigo");
                  setBuyBundle(null);
                }}
                className={`px-4.5 py-2.5 rounded-xl flex items-center gap-2 border text-xs font-extrabold cursor-pointer transition-all active:scale-[0.97] ${
                  buyNetwork === "AirtelTigo"
                    ? "bg-[#0066b3] border-[#0066b3] text-white shadow-sm"
                    : "bg-slate-50  text-black hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
               
                AirtelTigo
              </button>

            
            </div>
          </div>

          {/* 2. Choose Bundle */}
          <div className="space-y-2">
        
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {packagesList[buyNetwork].map((bun) => (
                <BundleCard
                  key={bun.id}
                  network={buyNetwork}
                  name={bun.name.replace(" Non-Expiry", "")}
                  price={bun.price}
                  isSelected={buyBundle?.id === bun.id}
                  onClick={() => handleCardClick(bun)}
                  onBuy={() => handleCardClick(bun)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <PurchaseBundleModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setBuyBundle(null);
          setPurchaseSuccess(null);
          setPurchaseError(null);
        }}
        bundle={buyBundle}
        network={buyNetwork}
        phoneNumber={buyPhoneNumber}
        setPhoneNumber={setBuyPhoneNumber}
        isPurchasing={isPurchasing}
        onConfirm={handleConfirmPurchase}
        error={purchaseError}
        success={purchaseSuccess}
        walletBalance={data?.user.walletBalance || 0}
      />
    </div>
  );
}
