"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../../DashboardContext";
import { ArrowLeft, Save, Loader2, DollarSign, Percent, Wifi, Layers } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { formatCurrency } from "@/lib/utils";

interface BundleItem {
  id: string;
  network: string;
  name: string;
  basePrice: number;
  customPrice: number;
  isActive: boolean;
}

export default function StorePricesPage() {
  const { data } = useDashboard();
  const router = useRouter();

  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<"MTN" | "Telecel" | "AirtelTigo">("MTN");

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/agent/prices");
        if (res.ok) {
          const payload = await res.json();
          setBundles(payload.bundles || []);
          
          // Populate raw input string values
          const initialInputs: Record<string, string> = {};
          (payload.bundles || []).forEach((b: BundleItem) => {
            initialInputs[b.id] = b.customPrice.toFixed(2);
          });
          setInputValues(initialInputs);
        } else {
          toast.error("Failed to load storefront bundle prices.");
        }
      } catch (err) {
        console.error("Error fetching storefront prices:", err);
        toast.error("An error occurred loading prices.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  if (!data) return null;

  const { user } = data;


  const handlePriceInputChange = (id: string, value: string) => {
    // Basic regex validation to allow numbers and optional decimal points
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setInputValues((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleActiveToggle = (id: string) => {
    setBundles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  const handleSavePrices = async () => {
    // Formulate payload and validate input values
    const updatedPrices = [];
    
    for (const b of bundles) {
      const inputStr = inputValues[b.id];
      if (inputStr === undefined || inputStr.trim() === "") {
        toast.error(`Please enter a valid price for ${b.network} ${b.name}`);
        return;
      }
      
      const customPrice = parseFloat(inputStr);
      if (isNaN(customPrice) || customPrice <= 0) {
        toast.error(`Invalid price for ${b.network} ${b.name}`);
        return;
      }

      if (customPrice < b.basePrice) {
        toast.error(
          `Price for ${b.network} ${b.name} cannot be lower than the cost price of GH₵ ${b.basePrice.toFixed(2)}.`
        );
        return;
      }

      updatedPrices.push({
        bundleId: b.id,
        customPrice,
        isActive: b.isActive,
      });
    }

    setSaving(true);
    try {
      const res = await fetch("/api/agent/prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prices: updatedPrices }),
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(resData.message || "Storefront pricing saved successfully.");
        router.push("/dashboard/store");
      } else {
        toast.error(resData.error || "Failed to save storefront pricing.");
      }
    } catch (err) {
      console.error("Error saving storefront pricing:", err);
      toast.error("Failed to save pricing configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Filter bundles for the current active network
  const filteredBundles = bundles.filter((b) => b.network === activeNetwork);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/store"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors select-none cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Store
        </Link>
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Pricing Editor
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-lg tracking-tight">
              Set Storefront Package Prices
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Add your custom profit margin markup over original base cost prices and control visibility on your storefront.
            </p>
          </div>
          
          <button
            onClick={handleSavePrices}
            disabled={loading || saving}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#feb400] hover:bg-[#e6a200] disabled:opacity-50 text-slate-900 rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-[0.99] shrink-0 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <Save size={14} /> Save Pricing
              </>
            )}
          </button>
        </div>

        {/* Network Selector Tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 gap-1">
          {(["MTN", "Telecel", "AirtelTigo"] as const).map((network) => (
            <button
              key={network}
              onClick={() => setActiveNetwork(network)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all select-none cursor-pointer text-center ${
                activeNetwork === network
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/40"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {network}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs font-semibold">
            No packages available for {activeNetwork}.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Bundle / Size</div>
              <div className="col-span-2 text-right">Cost Price</div>
              <div className="col-span-3 text-center">Retail Custom Price</div>
              <div className="col-span-2 text-right">Profit Margin</div>
              <div className="col-span-1 text-center">Active</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredBundles.map((b) => {
                const rawVal = inputValues[b.id] || "";
                const floatVal = parseFloat(rawVal) || 0;
                const margin = floatVal - b.basePrice;
                const isUnderCost = floatVal > 0 && floatVal < b.basePrice;

                return (
                  <div
                    key={b.id}
                    className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-4 px-2 hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                  >
                    {/* Bundle details */}
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <Wifi size={14} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs">
                          {b.network} {b.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          Standard Package
                        </p>
                      </div>
                    </div>

                    {/* Cost Price */}
                    <div className="col-span-6 sm:col-span-2 flex sm:justify-end items-center gap-1">
                      <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                        Cost:
                      </span>
                      <span className="text-xs font-extrabold text-slate-500">
                        {formatCurrency(b.basePrice)}
                      </span>
                    </div>

                    {/* Custom Input */}
                    <div className="col-span-12 sm:col-span-3 flex justify-center">
                      <div className="relative w-full max-w-[150px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                          GH₵
                        </span>
                        <input
                          type="text"
                          value={rawVal}
                          onChange={(e) => handlePriceInputChange(b.id, e.target.value)}
                          placeholder={b.basePrice.toFixed(2)}
                          className={`w-full bg-slate-50 border rounded-xl py-2 pl-8 pr-3 text-right text-xs font-black text-slate-800 outline-none transition-all ${
                            isUnderCost
                              ? "border-red-400 focus:border-red-500 focus:bg-white"
                              : "border-slate-200 focus:border-amber-400 focus:bg-white"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Live Margin Calculation */}
                    <div className="col-span-6 sm:col-span-2 flex sm:justify-end items-center gap-1">
                      <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                        Profit:
                      </span>
                      {isUnderCost ? (
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                          Below Cost
                        </span>
                      ) : margin > 0 ? (
                        <span className="text-xs font-black text-emerald-600">
                          +{formatCurrency(margin)}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          {formatCurrency(0)}
                        </span>
                      )}
                    </div>

                    {/* Active Toggle switch */}
                    <div className="col-span-6 sm:col-span-1 flex justify-end sm:justify-center items-center">
                      <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">
                        Status:
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={b.isActive}
                          onChange={() => handleActiveToggle(b.id)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2.5px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
