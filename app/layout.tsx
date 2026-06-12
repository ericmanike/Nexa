import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import AuthProvider from "@/components/SessionProvider";

// Import system-fallback styles to bypass Google Fonts download block in offline environments
const geistSans = {
  variable: "font-sans",
};

const geistMono = {
  variable: "font-mono",
};

export const metadata: Metadata = {
  title: "Nexa Bundles GH",
  description: "Your number one stop for internet   Data bundles at the best prices",
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
      </body>
    </html>
  );
}
