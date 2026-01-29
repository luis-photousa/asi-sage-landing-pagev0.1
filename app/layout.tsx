import "@/app/globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "@/app/footer";
import { Navbar } from "@/app/navbar";
import { ReferralBadge } from "@/components/referral-badge";
import { YnsLink } from "@/components/yns-link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your Next Store",
  description: "Your next e-commerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-8">
                    <YnsLink
                      prefetch={"eager"}
                      href="/"
                      className="text-xl font-bold"
                    >
                      Your Next Store
                    </YnsLink>
                    <Navbar />
                  </div>
                </div>
              </div>
            </header>
            <div className="flex-1">{children}</div>
            <Footer />
            <ReferralBadge />
          </div>
        </Suspense>
      </body>
    </html>
  );
}
