"use client";

import React from "react";
import Link from "next/link";
import { RadioTower } from "lucide-react";

export default function Home() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col">
      {/* 1. Global Brand Header with Glassmorphism */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/85 backdrop-blur-md px-4 shadow-sm sm:px-6 md:px-10 lg:px-16">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-[#1e3a8a] flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <RadioTower className="h-5 w-5 text-white" />
          </div>
          <span className="text-[17px] font-black tracking-widest flex items-baseline gap-1 group-hover:opacity-90 transition-opacity">
            <span className="text-[#1e3a8a]">Nexa</span>
            <span className="text-[#fb923c]">Bundles</span> 
            <span className="text-slate-500 text-[10px] font-semibold">GH</span>
          </span>
        </Link>


        {/* Header Right Actions - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/signIn"
            className="text-xs font-black text-slate-600 tracking-wider uppercase hover:text-slate-900 transition-colors px-3 py-1.5"
          >
            Login
          </Link>
          <Link
            href="/buy"
            className="rounded-xl bg-[#fdc700] hover:bg-[#a98700] px-5 py-2.5 text-xs font-black text-black tracking-wider uppercase shadow-md shadow-red-600/10 transition-all active:scale-[0.98]"
          >
            Buy Now
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
            className="text-slate-600 hover:text-slate-950 p-2 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-lg px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-200 md:hidden">
            <Link
              href="/auth/signIn"
              onClick={() => setMenuOpen(false)}
              className="text-center font-black text-slate-700 hover:text-slate-950 tracking-wider uppercase py-2.5 hover:bg-slate-50 rounded-xl transition-all"
            >
              Login
            </Link>
            <Link
              href="/buy"
              onClick={() => setMenuOpen(false)}
              className="text-center rounded-xl bg-[#fdc700] hover:bg-[#a98700] py-3 text-xs font-black text-black tracking-wider uppercase shadow-md shadow-amber-400/10 transition-all active:scale-[0.98]"
            >
              Buy Now
            </Link>
          </div>
        )}
      </header>

      {/* 2. Hero Presentation Layer */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-8 sm:px-6 md:pt-16 md:pb-12 text-center">
    
          <h1 className=" text-2xl md:text-4xl  font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.08] mb-6">
          
            <span className="text-black">
              Affordable Data Bundle
            </span>
          </h1>
          <p className="text-[11px] sm:text-base font-semibold text-slate-500 max-w-2xl mx-auto leading-relaxed mb-4">
   Buy Affordable Data Bundle on MTN and AirtelTigo (AT) • Doesn't work for Turbonet SIM
          </p>
          {/* <div className="flex flex-col sm:flex-row justify-center items-center">
            
            <Link
              href="/auth/signUp"
              className="w-full sm:w-auto rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold px-8 py-4 shadow-sm hover:shadow-md transition-all duration-200 text-center hover:-translate-y-0.5"
            >
              Start Your Own Data Business
            </Link>
          </div> */}
        </section>

        {/* 3. SHOWCASE SECTION (Replicated from user's screenshot) */}
        <section className="w-full border-y border-slate-200 bg-white py-7  relative overflow-hidden">
          {/* Subtle bottom fade gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/30 pointer-events-none" />

          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 relative z-10">
            {/* Header Area */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] block mb-2 select-none">
                  Choose Your 
                </span>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-7.5 bg-[#df0000] rounded-full shrink-0" />
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    Network 
                  </h2>
                </div>
              </div>

              <Link
                href="/buy"
                className="text-[#df0000] font-black tracking-wider uppercase text-xs sm:text-sm hover:underline flex items-center gap-1 group pb-0.5"
              >
                See More{" "}
                <span className="group-hover:translate-x-1 transition-transform inline-block font-sans text-base leading-none">
                  →
                </span>
              </Link>
            </div>

            {/* Pricing Cards Grid  */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {/* Card 1: AirtelTigo */}
              <div className="relative bg-[#0066b3] rounded-[28px] pt-6 pb-7 px-3 flex flex-col items-center justify-between shadow-[0_20px_45px_rgba(0,102,179,0.18)] hover:-translate-y-2.5 transition-all duration-300 group cursor-pointer h-[250px]">
               
              
                {/* Circular RadioTower Badge */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005596] shadow-inner mt-2">
                  <RadioTower className="h-6 w-6 text-white/90" />
                </div>

                {/* Details */}
                <div className="text-center mt-3 mb-5">
                  <h3 className="text-4.5xl font-black text-white tracking-tight leading-none">
                    AIRTELTIGO
                  </h3>
                  <span className="text-[10px] font-black text-white/70 block uppercase tracking-[0.18em] mt-2 select-none">
                    Non-Expiry Data
                  </span>
                </div>

                {/* Price Pill Button */}
                <div className="w-full bg-white rounded-2xl py-2 shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-[1.02]">
                  <span className="text-[17px] font-black text-slate-900 tracking-tight">
                    BUY NOW
                  </span>
                </div>
              </div>

              {/* Card 2: MTN */}
              <div className="relative bg-[#ffcc00] rounded-[28px] pt-6 pb-7 px-3 flex flex-col items-center justify-between shadow-[0_20px_45px_rgba(255,204,0,0.15)] hover:-translate-y-2.5 transition-all duration-300 group cursor-pointer h-[250px]">
            
             

                {/* Circular RadioTower Badge */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6b800] shadow-inner mt-2">
                  <RadioTower className="h-6 w-6 text-slate-900" />
                </div>

                {/* Details */}
                <div className="text-center mt-3 mb-5">
                  <h3 className="text-4.5xl font-black text-slate-900 tracking-tight leading-none">
                    MTN
                  </h3>
                  <span className="text-[10px] font-black text-slate-800/70 block uppercase tracking-[0.18em] mt-2 select-none">
                    Non-Expiry Data
                  </span>
                </div>

                {/* Price Pill Button */}
                <div className="w-full bg-white rounded-2xl py-2 shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-[1.02]">
                  <span className="text-[17px] font-black text-slate-900 tracking-tight">
                   BUY NOW
                  </span>
                </div>
              </div>

              {/* Card 3: Telecel */}
              <div className="relative bg-[#df0000] rounded-[28px] pt-6 pb-7 px-6 flex flex-col items-center justify-between shadow-[0_20px_45px_rgba(223,0,0,0.18)] hover:-translate-y-2.5 transition-all duration-300 group cursor-pointer h-[250px]">
               

                {/* Circular RadioTower Badge */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#be0000] shadow-inner mt-2">
                  <RadioTower className="h-6 w-6 text-white/90" />
                </div>

                {/* Details */}
                <div className="text-center mt-3 mb-5">
                  <h3 className="text-4.5xl font-black text-white tracking-tight leading-none">
                    TELECEL
                  </h3>
                  <span className="text-[10px] font-black text-white/70 block uppercase tracking-[0.18em] mt-2 select-none">
                    Non-Expiry Data
                  </span>
                </div>

                {/* Price Pill Button */}
                <div className="w-full bg-white rounded-2xl py-2 shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-[1.02]">
                  <span className="text-[17px] font-black text-slate-900 tracking-tight">
                    BUY NOW
                  </span>
                </div>
              </div>
            </div>

            {/* Agent Call to Action Banner (With requested text-gradient styling) */}
            <div className="bg-[#1e3a8a] rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_12px_35px_rgba(17,24,39,0.15)] hover:scale-[1.005] transition-all duration-300 border border-slate-800">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-black text-white  tracking-tight mb-1.5">
                  Ready to earn extra cash?
                </h3>
                <p className="text-[14px] font-semibold text-slate-400">
                  Start your own data business today. Become an agent for free!
                </p>
              </div>

              <Link
                href="/auth/signUp"
                className="w-full md:w-auto shrink-0 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:opacity-95 text-white font-black tracking-wide uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Become an Agent{" "}
                <span className="group-hover:translate-x-0.5 transition-transform inline-block text-base leading-none">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>



        {/* 5. Need Help? Section */}
        <section className="w-full bg-white border-t border-slate-100 py-16 px-4 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Need Help?
            </h2>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-7">
              Have questions or need assistance? We&apos;re here to help!
            </p>
            <Link
              href="/auth/signUp"
              className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] hover:bg-[#172554] px-8 py-3.5 text-xs font-black text-white tracking-widest uppercase shadow-md shadow-blue-900/10 transition-all active:scale-[0.98] select-none"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>

      {/* 5. Sleek Dark Footer */}
      <footer className="w-full bg-[#111827] text-slate-400 py-12 px-4 sm:px-6 md:px-10 lg:px-16 border-t border-slate-800">
        <div className="mx-auto w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-red-600 flex items-center justify-center shadow-md">
              <span className="text-white text-[10px] font-black">N</span>
            </div>
            <span className="text-[15px] font-black text-white tracking-widest flex items-baseline gap-1">
              <span className="text-white">Nexa</span>
              <span className="text-[#fb923c]">Bundles</span> 
              <span className="text-slate-500 text-[9px] font-semibold">GH</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>

            <Link href="/auth/signUp" className="hover:text-white transition-colors">
              Become an Agent
            </Link>
            <Link href="/auth/signIn" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>

          <p className="text-[11px] font-semibold text-slate-500">
            &copy; {new Date().getFullYear()} Nexa Bundles GH. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
