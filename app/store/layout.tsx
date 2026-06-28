import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reseller Data storefront",
  description: "Purchase cheap and affordable data bundles instantly from your local reseller. Pay securely using Mobile Money.",
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
