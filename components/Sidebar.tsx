"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Wifi,
  RadioTower,
  ShoppingCart,
  Star,
  Wallet,
  ArrowLeftRight,
  Gift,
  ArrowUpCircle,
  Store,
  Coins,
  User as UserIcon,
  X,
  Shield
} from "lucide-react";

// Custom logo wrapper using Lucide Wifi
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: {
    name: string;
    email: string;
    role?: string;
  };
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, user }: SidebarProps) {
  const pathname = usePathname();

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home, color: "bg-blue-100 text-blue-600" },
    { id: "packages", label: "Data Packages", href: "/dashboard/packages", icon: Wifi, color: "bg-emerald-100 text-emerald-600" },
    { id: "orders", label: "My Orders", href: "/dashboard/orders", icon: ShoppingCart, color: "bg-purple-100 text-purple-600" },
    { id: "afa", label: "AFA Orders", href: "/dashboard/afa", icon: Star, color: "bg-amber-100 text-amber-600" },
    { id: "wallet", label: "Wallet", href: "/dashboard/wallet", icon: Wallet, color: "bg-slate-100 text-slate-700" },
    { id: "transactions", label: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight, color: "bg-orange-100 text-orange-600" },
    { id: "referrals", label: "My Referrals", href: "/dashboard/referrals", icon: Gift, color: "bg-rose-100 text-rose-600" },
    { id: "upgrade", label: "Role Upgrade", href: "/dashboard/upgrade", icon: ArrowUpCircle, color: "bg-violet-100 text-violet-600" },
    { id: "store", label: "My Store", href: "/dashboard/store", icon: Store, color: "bg-teal-100 text-teal-600" },
  ];

  if (user.role === "admin") {
    sidebarItems.push({
      id: "admin",
      label: "Admin Panel",
      href: "/dashboard/admin",
      icon: Shield,
      color: "bg-red-100 text-red-600"
    });
  }

  sidebarItems.push({
    id: "profile",
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserIcon,
    color: "bg-gray-100 text-gray-700"
  });

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[270px] bg-white border-r border-slate-100 flex flex-col h-screen xl:sticky xl:top-0 transition-transform duration-300 xl:translate-x-0 xl:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header Block (Fixed) */}
        <div className="h-[76px] px-6 bg-[#1e3a8a] text-white  flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900/10 flex items-center justify-center shadow-md">
              <RadioTower className="h-6 w-6 text-[#fcd34d]" />
            </div>
            
            <span className=" text-[10px] md:text-xl font-bold tracking-tight  select-none">
              <Link href="/">
              Nexa BundlesGh
              </Link> 
            </span>
            
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="xl:hidden p-1.5 rounded-lg bg-white/10 text-white hover:bg-slate-900/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation lists (SCROLLABLE AREA) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            // Match pathname exactly or match subroutes if necessary
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left cursor-pointer ${
                  isActive
                    ? "bg-[#1e3a8a] text-[white] border-l-2 border-[#fb923c] shadow-sm"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform ${
                    isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : item.color
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[13px] font-semibold tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Log out (Fixed at bottom) */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          
        
            <button
            onClick={() =>
              
               signOut({ callbackUrl: "/auth/signIn" })}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-600 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Log Out
          </button>
         
        </div>
      </aside>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm xl:hidden transition-opacity"
        />
      )}
    </>
  );
}
