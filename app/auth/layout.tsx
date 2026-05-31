import React from "react";
import Link from "next/link";
import { RadioTower } from "lucide-react";

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
            <span className="text-slate-500 text-xs font-semibold ml-1 align-super">GH</span>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-4.5 w-4.5 text-[#047857] group-hover:translate-x-0.5 transition-transform duration-200"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
          Need help? Watch how to log in
        </Link>
        <span className="text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} Nexa Bundles GH
        </span>
      </div>
    </div>
  );
}
