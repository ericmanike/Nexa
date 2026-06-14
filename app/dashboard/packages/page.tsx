"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import { Wifi } from "lucide-react";
import BundleCard from "@/components/BundleCard";
import PurchaseBundleModal from "@/components/PurchaseBundleModal";
import Loader from "../loading";

export default function PackagesPage() {
  const { data, setData } = useDashboard();

  const [buyPhoneNumber, setBuyPhoneNumber] = useState("");
  const [buyNetwork, setBuyNetwork] = useState<"MTN" | "AirtelTigo" | "Telecel">("MTN");
  const [buyBundle, setBuyBundle] = useState<any | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [dbBundles, setDbBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/bundles");
        if (res.ok) {
          const fetched = await res.json();
          // Filter to only active bundles matching the user's role (agent vs regular user)
          const targetAudience = data?.user?.role === "agent" ? "agent" : "user";
          setDbBundles(fetched.filter((b: any) => b.isActive && b.audience === targetAudience));
        }
      } catch (err) {
        console.error("Failed to load bundles", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, [data?.user?.role]);

  const getFilteredBundles = () => {
    const targetNetwork = buyNetwork === "MTN" ? "MTN" : buyNetwork === "Telecel" ? "Telecel" : "AirtelTigo";
    return dbBundles.filter((b) => b.network === targetNetwork);
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
      const res = await fetch("/api/buyData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: buyNetwork,
          bundleId: buyBundle._id || buyBundle.id,
          phoneNumber: buyPhoneNumber,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Failed to process data purchase.");
      }

      setPurchaseSuccess(
        `Successfully ordered ${buyBundle.name} for ${buyPhoneNumber}. The bundle will deliver shortly.`
      );

      // Deduct balance locally in the layout state!
      if (data && setData) {
        setData({
          ...data,
          user: {
            ...data.user,
            walletBalance: resData.walletBalance
          },
          stats: {
            ...data.stats,
            totalOrders: data.stats.totalOrders + 1,
            totalSpent: data.stats.totalSpent + buyBundle.price
          },
          orders: [
            resData.order,
            ...data.orders
          ],
          transactions: [
            resData.transaction,
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

  if (loading) {
    return <Loader />;
  }
  if(dbBundles?.length === 0){
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-[10px] p-4 sm:p-6 shadow-sm">
          <h3 className="font-black text-slate-900 text-lg tracking-tight mb-2">
            No Packages Available
          </h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-6 select-none">
            Please check back later for available packages.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[10px] p-4 sm:p-6 shadow-sm">
        <h3 className="font-black text-slate-900 text-lg tracking-tight mb-2">
          Buy Affordable Internet Bundles
        </h3>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-6 select-none">
          Select network provider, choose  bundle and pay instantly from your wallet.
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
        
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
              {  getFilteredBundles().map((bun) => (
                <BundleCard
                  key={bun._id}
                  network={buyNetwork}
                  name={bun.name}
                  price={bun.price}
                  isSelected={buyBundle?._id === bun._id}
                  onClick={() => handleCardClick(bun)}
                  onBuy={() => handleCardClick(bun)}
                />
              ))}
             
            </div>
             {getFilteredBundles().length === 0 && <div className="m-auto w-full h-[50vh] flex flex-col justify-center text-center text-[15px] ">{buyNetwork} Is Currently Out Of Stock,<br/> <span className="text-2xl font-extrabold text-slate-500">Check Back Later!</span></div> }
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
        bundle={buyBundle ? {
          id: buyBundle._id || buyBundle.id,
          name: buyBundle.name,
          price: buyBundle.price,
          size: buyBundle.sizeValue || 0
        } : null}
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
