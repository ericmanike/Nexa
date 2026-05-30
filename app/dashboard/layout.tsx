"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDashboard, DashboardProvider } from "./DashboardContext";
import Sidebar from "@/components/Sidebar";
import { Menu, ChevronRight, Loader2, Bell, ChevronDown, User as UserIcon, LogOut, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { signOut } from "next-auth/react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data, loading, error } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Find human-readable label for the current route
  const getRouteLabel = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Dashboard";
    const subRoute = segments[1];
    const labels: Record<string, string> = {
      packages: "Data Packages",
      orders: "My Orders",
      afa: "AFA Orders",
      wallet: "Wallet",
      transactions: "Transactions",
      referrals: "My Referrals",
      upgrade: "Role Upgrade",
      store: "My Store",
      withdraw: "Withdraw Rewards",
      profile: "Profile"
    };
    return labels[subRoute] || subRoute;
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading your Dakazina session...</p>
      </div>
    );
  }

  const user = data?.user || { name: "User", email: "guest@dakazina.com", role: "user", walletBalance: 0 };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans flex overflow-hidden">
      {/* 1. Reusable Static Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={{ name: user.name, email: user.email }}
      />

      {/* 2. Scrollable right panel wrapper */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header Bar (Fixed at top) */}
        <header className="sticky top-0 z-20 h-[76px] px-4 sm:px-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Path Breadcrumbs */}
            <div className="hidden sm:flex items-center  text-[14px] font-bold text-black select-none uppercase ">
             
              <span className="text-black font-bolder">{getRouteLabel()}</span>
            </div>
          </div>

          {/* User Profile Avatar & Notifications */}
          <div className="flex items-center gap-4">
            {/* Notification Bell button */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
              <Bell size={30} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 " />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Profile Avatar Card with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-2xl transition-all cursor-pointer select-none border border-transparent hover:border-slate-100"
              >
                <div className="relative h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-[#1e3a8a] overflow-hidden shadow-inner flex items-center justify-center">
                  <span className="text-xs font-black text-white uppercase">
                    {user.name ? user.name.slice(0, 2) : "US"}
                  </span>
                </div>
                <div className="hidden md:block text-left min-w-0 pr-1 select-none">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-tight capitalize max-w-[100px] flex items-center gap-1">
                    {user.name || "User"}
                    <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </h4>
                </div>
              </button>

              {/* Floating Dropdown Panel */}
              {dropdownOpen && (
                <>
                  <div
                    onClick={() => setDropdownOpen(false)}
                    className="fixed inset-0 z-30 cursor-default"
                  />
                  <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-40 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-3 py-2 border-b border-slate-50 text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-slate-950 truncate mt-0.5 capitalize">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">My Profile</span>
                      </Link>

                      <Link
                        href="/dashboard/store"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
                      >
                        <Settings size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">Store Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-50 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Children Body Container */}
        <main className="flex-grow p-3 sm:p-6 md:p-8 overflow-y-auto scrollbar-thin space-y-6 bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
