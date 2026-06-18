"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    walletBalance: number;
    phone: string;
    createdAt: string;
  };
  stats: {
    totalOrders: number;
    processingOrders: number;
    placedOrders: number;
    deliveredOrders: number;
    totalSpent: number;
  };
  orders: any[];
  transactions: any[];
  agentStore: any;
}

interface DashboardContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<DashboardData | null>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load dashboard data");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Offline mode: loaded with mock data.");
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): DashboardData => ({
    user: {
      id: "loading...",
      name: session?.user?.name || "User",
      email: session?.user?.email || "loading...",
      role: session?.user?.role || "agent",
      walletBalance: 0,
      phone: "loading...",
      createdAt: new Date().toISOString()
    },
    stats: {
      totalOrders: 42,
      processingOrders: 1,
      placedOrders: 1,
      deliveredOrders: 40,
      totalSpent: 685.5
    },
    orders: [
      {
        _id: "order-1",
        bundleName: "5GB Non-Expiry",
        network: "MTN",
        price: 40.0,
        phoneNumber: "0245678901",
        status: "delivered",
        transaction_id: "TX-MTN-9843A",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        _id: "order-3",
        bundleName: "2.5GB Non-Expiry",
        network: "Telecel",
        price: 20.0,
        phoneNumber: "0501234567",
        status: "failed",
        transaction_id: "TX-TC-2384C",
        createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
      }
    ],
    transactions: [
      {
        _id: "tx-1",
        transactionType: "debit",
        type: "purchase",
        amount: 40.0,
        reference: "TX-MTN-9843A",
        description: "Bought MTN 5GB for 0245678901",
        status: "success",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        _id: "tx-2",
        transactionType: "credit",
        type: "topup",
        amount: 150.0,
        reference: "PAY-938210382",
        description: "Wallet Auto-Topup via Paystack",
        status: "success",
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      }
    ],
    agentStore: {
      storeName: "Nexa Bundles Express",
      description: "Get the cheapest internet data bundles in seconds.",
      slug: "nexabundlesexpress",
      isActive: true,
      totalSalesCount: 15,
      totalProfit: 72.5,
      whatsappSupport: "233549961293"
    }
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setData(getMockData());
    }
  }, [status]);

  return (
    <DashboardContext.Provider
      value={{
        data,
        loading,
        error,
        refresh: fetchDashboardData,
        setData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
