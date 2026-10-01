import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";

import PageVisitTracker from "@/components/activities/PageVisitTracker";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/settings/ThemeProvider";
import {
  INTERFACE_PREFERENCES_COOKIE,
  parseInterfacePreferences,
} from "@/utils/interfacePreferences";

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
    "Store, build and export phoneme-based Wordle and word-search activities.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const savedPreferences = cookieStore.get(
    INTERFACE_PREFERENCES_COOKIE,
  )?.value;

  const preferences = savedPreferences
    ? parseInterfacePreferences(decodeURIComponent(savedPreferences))
    : parseInterfacePreferences(null);

  return (
    <html
      lang="en"
      data-theme={preferences.theme}
      data-layout={preferences.layout}
      data-scroll-behavior="smooth"
    >
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider initialTheme={preferences.theme}>
          <div className="site-shell">
            <a className="skip-link" href="#main-content">Skip to main content</a>
            <Header />
            <PageVisitTracker />

            <div className="site-content">{children}</div>

            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
