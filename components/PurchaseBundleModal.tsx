"use client";

import React from "react";
import { X, Wifi, Smartphone, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import clsx from "clsx";

interface Bundle {
  id: string;
  name: string;
  price: number;
  size: number;
}

interface PurchaseBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: Bundle | null;
  network: "MTN" | "AirtelTigo" | "Telecel" | string;
  phoneNumber: string;
  setPhoneNumber: (num: string) => void;
  isPurchasing: boolean;
  onConfirm: () => void;
  error: string | null;
  success: string | null;
  walletBalance: number;
}

export default function PurchaseBundleModal({
  isOpen,
  onClose,
  bundle,
  network,
  phoneNumber,
  setPhoneNumber,
  isPurchasing,
  onConfirm,
  error,
  success,
  walletBalance,
}: PurchaseBundleModalProps) {
  if (!isOpen || !bundle) return null;

  const isBalanceInsufficient = walletBalance < bundle.price;
  const isPhoneValid = /^\d{10}$/.test(phoneNumber);
  const isFormValid = isPhoneValid && !isBalanceInsufficient && !isPurchasing;

  // Network styling configuration
  const themeMap: Record<
    string,
    {
      headerBg: string;
      headerText: string;
      iconBg: string;
      closeBtnHover: string;
      summaryBg: string;
      summaryBorder: string;
      summaryText: string;
      payBtnBg: string;
      payBtnHover: string;
      payBtnText: string;
    }
  > = {
    MTN: {
      headerBg: "bg-[#1e3a8a]",
      headerText: "text-white",
      iconBg: "bg-white/10 text-white",
      closeBtnHover: "hover:bg-slate-900/20",
      summaryBg: "bg-[#feb400]/5",
      summaryBorder: "border-[#feb400]/20",
      summaryText: "text-amber-950",
      payBtnBg: "bg-[#feb400]",
      payBtnHover: "hover:bg-[#e6a200]",
      payBtnText: "text-slate-900",
    },
    AirtelTigo: {
      headerBg: "bg-[#0066b3]",
      headerText: "text-white",
      iconBg: "bg-white/10 text-white",
      closeBtnHover: "hover:bg-white/20",
      summaryBg: "bg-[#0066b3]/5",
      summaryBorder: "border-[#0066b3]/20",
      summaryText: "text-[#0066b3]",
      payBtnBg: "bg-[#0066b3]",
      payBtnHover: "hover:bg-[#005290]",
      payBtnText: "text-white",
    },
    Telecel: {
      headerBg: "bg-[#df0000]",
      headerText: "text-white",
      iconBg: "bg-white/10 text-white",
      closeBtnHover: "hover:bg-white/20",
      summaryBg: "bg-[#df0000]/5",
      summaryBorder: "border-[#df0000]/20",
      summaryText: "text-[#df0000]",
      payBtnBg: "bg-[#df0000]",
      payBtnHover: "hover:bg-[#b80000]",
      payBtnText: "text-white",
    },
  };

  const defaultTheme = {
    headerBg: "bg-slate-800",
    headerText: "text-white",
    iconBg: "bg-white/10 text-white",
    closeBtnHover: "hover:bg-white/20",
    summaryBg: "bg-slate-50",
    summaryBorder: "border-slate-200",
    summaryText: "text-slate-700",
    payBtnBg: "bg-slate-800",
    payBtnHover: "hover:bg-slate-900",
    payBtnText: "text-white",
  };

  const theme = themeMap[network] || defaultTheme;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => {
          if (!isPurchasing) onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-[calc(100vw-32px)] sm:max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className={clsx("p-4 flex justify-between items-center transition-colors duration-200", theme.headerBg, theme.headerText)}>
          <div className="flex items-center gap-2.5">
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", theme.iconBg)}>
              <Wifi size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Confirm Purchase</h2>
              <p className="text-[10px] opacity-90 font-semibold leading-tight">{network} Data Bundle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPurchasing}
            className={clsx(
              "w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              theme.closeBtnHover
            )}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {/* Status Alerts */}
          {success && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-100 flex gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="p-3.5 bg-red-50 text-red-800 text-xs font-bold rounded-xl border border-red-100 flex gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Bundle Selection Summary Card */}
          <div className={clsx("p-3.5 rounded-xl border flex justify-between items-center", theme.summaryBg, theme.summaryBorder)}>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Selected Package</p>
              <h4 className={clsx("text-sm font-black mt-0.5", theme.summaryText)}>
                {bundle.name.replace(" Non-Expiry", "")}
              </h4>
              <p className="text-[9px] text-slate-400 font-semibold">Non-Expiry Bundle</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Price</p>
              <h3 className={clsx("text-base font-black mt-0.5", theme.summaryText)}>
                {formatCurrency(bundle.price)}
              </h3>
            </div>
          </div>

          {/* Wallet Balance Info */}
          <div
            className={clsx(
              "p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold select-none",
              isBalanceInsufficient
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-slate-50 text-slate-600 border-slate-100"
            )}
          >
            <CreditCard size={15} className={isBalanceInsufficient ? "text-red-500" : "text-slate-400"} />
            <div className="flex-1 flex justify-between items-center">
              <span>Your Wallet Balance:</span>
              <span className="font-extrabold">{formatCurrency(walletBalance)}</span>
            </div>
          </div>

          {isBalanceInsufficient && (
            <div className="p-3 bg-red-50 text-red-800 text-[11px] font-bold rounded-xl border border-red-100 flex gap-2 items-center">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <span>
                Insufficient balance. Please{" "}
                <Link
                  href="/dashboard/wallet"
                  onClick={onClose}
                  className="underline text-red-950 hover:opacity-90 font-extrabold"
                >
                  top up your wallet
                </Link>
                .
              </span>
            </div>
          )}

          {/* Form Content: Phone number */}
          {!success && (
            <div className="space-y-1.5">
              <label htmlFor="modal-phone-input" className="text-[11px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
                Recipient Phone Number
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 text-slate-400">
                  <Smartphone size={16} />
                </div>
                <input
                  id="modal-phone-input"
                  type="tel"
                  required
                  disabled={isPurchasing}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="e.g. 0543442518"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold pl-1">
                Enter the 10-digit number to receive the bundle.
              </p>
            </div>
          )}

          {/* Confirm & Close Button Grid */}
          <div className="pt-2 flex gap-3">
            {!success ? (
              <>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!isFormValid}
                  className={clsx(
                    "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-sm cursor-pointer",
                    isFormValid
                      ? clsx(theme.payBtnBg, theme.payBtnText, theme.payBtnHover)
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  )}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" /> Processing
                    </>
                  ) : (
                    <>
                      Pay {formatCurrency(bundle.price)} <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors active:scale-[0.98] cursor-pointer"
              >
                Close Window
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
