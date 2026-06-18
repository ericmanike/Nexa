import React from "react";
import Link from "next/link";
import { RadioTower, ArrowRight, HelpCircle } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f4f6f8] px-4 py-10 font-sans antialiased text-slate-800">
      
      {/* 1. Header (Logo & Subtitle) */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-1.5">
          <div className="h-9 w-9 rounded-xl bg-[#1e3a8a] flex items-center justify-center shadow-md shadow-[#1e3a8a]/20 group-hover:scale-105 transition-transform">
            <RadioTower className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="text-[27px] font-extrabold flex items-baseline leading-none">
            <span className="text-[#1e3a8a]">Nexa</span>
            <span className="text-[#fb923c] ml-1">Bundles</span> 
          </span>
        </Link>
       
      </div>

      {/* 2. Promo Banner Card (Green) */}
      <div className="w-full max-w-[430px] mb-5">
        <Link
          href="/buy"
          className="flex items-center justify-between rounded-2xl border border-[#bef2dc] bg-[#e6fbf3] px-5 py-4 shadow-sm hover:bg-[#dbf8ec] transition-all duration-200 group"
        >
          <div className="flex flex-col text-left">
            <span className="text-[14px] font-bold text-[#047857]">
              Want to buy instantly?
            </span>
            <span className="text-[12px] font-medium text-[#059669]">
              Skip login and purchase directly
            </span>
          </div>
          <ArrowRight className="h-4.5 w-4.5 text-[#047857] group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
        </Link>
      </div>

      {/* 3. The Dynamic Card Content (Children) */}
      <div className="w-full max-w-[430px]">
        {children}
      </div>

      {/* 4. Footer */}
      <div className="mt-6 flex flex-col items-center gap-3.5 text-center text-xs">
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <HelpCircle className="h-4 w-4 text-slate-400" strokeWidth={2} />
          Need help? Watch how to log in
        </Link>
        <span className="text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} Nexa Bundles GH
        </span>
      </div>
    </div>
  );
}
