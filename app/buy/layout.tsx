import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Cheap Data Bundles Online",
  description: "Purchase cheap and affordable MTN, Telecel, and AirtelTigo data bundles instantly. Pay securely using Mobile Money (MoMo). No registration required.",
};

export default function BuyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
