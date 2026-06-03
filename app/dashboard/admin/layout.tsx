"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600" />
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== "admin") {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Shield size={40} className="mx-auto text-red-400" />
          <h2 className="text-xl font-bold text-zinc-900">Access Denied</h2>
          <p className="text-zinc-500 text-sm">You don't have permission to view this page.</p>
          <Link href="/dashboard" className="inline-block mt-2 text-sm font-medium text-slate-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <div className="w-full h-full">{children}</div>;
}
