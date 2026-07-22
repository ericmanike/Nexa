import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import AuthProvider from "@/components/SessionProvider";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { Analytics } from "@vercel/analytics/next";
// Import system-fallback styles to bypass Google Fonts download block in offline environments
const geistSans = {
  variable: "font-sans",
};

const geistMono = {
  variable: "font-mono",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nexabundles.com"),
  title: {
    default: "Nexa Bundles | Cheap & Affordable Data Bundles in Ghana",
    template: "%s | Nexa Bundles",
  },
  description: "Buy cheap and affordable MTN, Telecel, and AirtelTigo data bundles in Ghana. High-speed internet bundles with instant delivery, no expiry, and active 24/7. Pay via Mobile Money.",
  keywords: [
    "Nexa Bundles",
    "cheap data bundle ghana",
    "buy MTN data bundle",
    "cheap MTN data",
    "AirtelTigo data bundle",
    "Telecel data bundle",
    "buy internet bundle ghana",
    "momo data bundle",
    "ghana data bundle agent",
    "non-expiry data ghana",
    "cheap internet ghana",
  ],
  authors: [{ name: "Nexa Bundles" }],
  creator: "Nexa Bundles",
  publisher: "Nexa Bundles",
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://www.nexabundles.com",
    title: "Nexa Bundles | Cheap & Affordable Data Bundles in Ghana",
    description: "Buy cheap and affordable MTN, Telecel, and AirtelTigo data bundles in Ghana. High-speed internet bundles with instant delivery, no expiry, and active 24/7. Pay via Mobile Money.",
    siteName: "Nexa Bundles",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexa Bundles - Cheap & Affordable Data Bundles in Ghana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexa Bundles | Cheap & Affordable Data Bundles in Ghana",
    description: "Buy cheap and affordable MTN, Telecel, and AirtelTigo data bundles in Ghana. High-speed internet bundles with instant delivery, no expiry, and active 24/7. Pay via Mobile Money.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col ">
        <AuthProvider>{children}</AuthProvider>
        <WhatsAppWidget />
        <Analytics />
      </body>
    </html>
  );
}
