import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Beta Alpha Project Manager",
  description: "Task and duty management for the Beta Alpha chapter.",
  openGraph: {
    title: "Beta Alpha Project Manager",
    description: "Task and duty management for the Beta Alpha chapter.",
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
      </body>
    </html>
  );
}
