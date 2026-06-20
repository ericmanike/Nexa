"use client";

import React from "react";
import { Wifi, Check, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import clsx from "clsx";

interface BundleCardProps {
  id?: string;
  network: "MTN" | "AirtelTigo" | "Telecel" | string;
  name: string;
  price: number;
  isSelected?: boolean;
  isLoading?: boolean;
  onBuy?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: () => void;
  className?: string;
}

export default function BundleCard({
  network,
  name,
  price,
  isSelected = false,
  isLoading = false,
  onBuy,
  onClick,
  className,
}: BundleCardProps) {
  // Brand styling configuration matching the network
  const stylesMap: Record<
    string,
    {
      cardBg: string;
      badgeBg: string;
      badgeText: string;
      iconBg: string;
      iconColor: string;
      textColor: string;
      btnBg: string;
      btnText: string;
      btnHover: string;
      ringColor: string;
    }
  > = {
    MTN: {
      cardBg: "bg-[#feb400]", // Brand gold-yellow
      badgeBg: "bg-black/10",
      badgeText: "text-slate-900",
      iconBg: "bg-black/5 border border-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
      iconColor: "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]",
      textColor: "text-slate-900",
      btnBg: "bg-white",
      btnText: "text-slate-900",
      btnHover: "hover:bg-slate-50 hover:shadow-md",
      ringColor: "ring-[#feb400] border-slate-900",
    },
    AirtelTigo: {
      cardBg: "bg-[#0066b3]", // Brand blue
      badgeBg: "bg-white/20",
      badgeText: "text-white",
      iconBg: "bg-white/10 border border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.06)]",
      iconColor: "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]",
      textColor: "text-white",
      btnBg: "bg-white",
      btnText: "text-[#0066b3]",
      btnHover: "hover:bg-slate-50 hover:shadow-md",
      ringColor: "ring-[#0066b3] border-white",
    },
    Telecel: {
      cardBg: "bg-[#df0000]", // Brand red
      badgeBg: "bg-white/20",
      badgeText: "text-white",
      iconBg: "bg-white/10 border border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.06)]",
      iconColor: "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]",
      textColor: "text-white",
      btnBg: "bg-white",
      btnText: "text-[#df0000]",
      btnHover: "hover:bg-slate-50 hover:shadow-md",
      ringColor: "ring-[#df0000] border-white",
    },
  };

  // Fallback styles for other networks
  const defaultStyle = {
    cardBg: "bg-slate-800",
    badgeBg: "bg-white/15",
    badgeText: "text-white/90",
    iconBg: "bg-white/10 border border-white/10 shadow-inner",
    iconColor: "text-white",
    textColor: "text-white",
    btnBg: "bg-white",
    btnText: "text-slate-900",
    btnHover: "hover:bg-slate-100",
    ringColor: "ring-slate-800 border-white",
  };

  const style = stylesMap[network] || defaultStyle;

  // Handle clicking on "Buy Now" button
  const handleBuyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card selection triggering when clicking the buy button
    if (onBuy) {
      onBuy(e);
    } else if (onClick) {
      onClick(); // Fallback if only onClick is provided
    }
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative rounded-2xl p-5 pt-8 pb-6 flex flex-col justify-between items-center text-center select-none cursor-pointer transition-all duration-300 w-full min-h-[220px] shadow-sm hover:-translate-y-1 hover:shadow-lg",
        style.cardBg,
        "hover:scale-[1.01] active:scale-[0.98]",
        className
      )}
    >
      {/* Network Badge top-left */}
      <div
        className={clsx(
          "absolute top-0 left-0 px-4 py-1.5 rounded-br-2xl rounded-tl-2xl text-[10px] font-black tracking-wider uppercase",
          style.badgeBg,
          style.badgeText
        )}
      >
        {network}
      </div>

      {/* Selected Indicator Checkmark Badge top-right */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white rounded-full p-1 shadow-md animate-in zoom-in-50 duration-200">
          <Check size={12} className="stroke-[3]" />
        </div>
      )}

      {/* Center Wi-Fi Circular Icon */}
      <div className="flex justify-center items-center mt-2 mb-4">
        <div
          className={clsx(
            " md:w-14 w-10 md:h-14 h-10 rounded-full flex items-center justify-center shadow-md",
            style.iconBg
          )}
        > 
          <Wifi className={clsx("w-6 h-6", style.iconColor)} />
        </div>
      </div>

      {/* Volume Size & Price Description */}
      <div className="mb-5">
        <h4 className={clsx("text-base sm:text-lg font-black tracking-tight leading-tight", style.textColor)}>
          {name} - {formatCurrency(price)}
        </h4>
      </div>

      {/* Action Button at the bottom */}
      <button
        onClick={handleBuyClick}
        disabled={isLoading}
        className={clsx(
          "w-full py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.97]",
          style.btnBg,
          style.btnText,
          style.btnHover,
          isLoading && "opacity-75 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" /> Processing...
          </>
        ) : (
          "Buy Now"
        )}
      </button>
    </div>
  );
}
