import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Chapter brand-guide headline font: titles, headings, menus.
const stellar = localFont({
  src: [
    { path: "../fonts/Stellar-light.otf", weight: "300", style: "normal" },
    { path: "../fonts/Stellar-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/Stellar-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/Stellar-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-stellar",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Task and project management for the Beta Alpha chapter of La Unidad Latina, Lambda Upsilon Lambda Fraternity, Incorporated.";

export const metadata: Metadata = {
  metadataBase: new URL("https://betaalpha.vercel.app"),
  title: "Beta Alpha Project Manager",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Beta Alpha Project Manager",
    description: SITE_DESCRIPTION,
    type: "website",
    images: [{ url: "/logo.png", width: 4032, height: 4500 }],
  },
  twitter: {
    card: "summary",
    title: "Beta Alpha Project Manager",
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${stellar.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
