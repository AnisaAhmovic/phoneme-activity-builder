import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import PreferenceInitializer from "@/components/settings/PreferenceInitializer";

import "./globals.css";
import "./ui-polish.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Phoneme Activity Builder",
    template: "%s | Phoneme Activity Builder",
  },
  description:
    "Build, preview and export phoneme-based Wordle and word-search activities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <PreferenceInitializer />

        <div className="site-shell">
          <Header />

          <div className="site-content">{children}</div>

          <Footer />
        </div>
      </body>
    </html>
  );
}
