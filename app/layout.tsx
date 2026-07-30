import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { UserSync } from "@/components/auth/UserSync";
import { Toaster } from "react-hot-toast";

import "@fontsource-variable/material-symbols-outlined";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clutchly | The AI Coach That Never Forgets",
  description:
    "Practice realistic voice interviews with an AI coach that remembers every conversation, adapts to your progress, and helps you land your dream job.",
  openGraph: {
    title: "Clutchly | The AI Coach That Never Forgets",
    description:
      "Practice realistic voice interviews with an AI coach that remembers every conversation, adapts to your progress, and helps you land your dream job.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clutchly | The AI Coach That Never Forgets",
    description:
      "Practice realistic voice interviews with an AI coach that remembers every conversation, adapts to your progress, and helps you land your dream job.",
  },
  metadataBase: new URL("https://interview-memory-agent.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon_io/favicon.ico",
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ClerkProvider>
          <UserSync />
          <Toaster position="bottom-right" />
          {children}
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
