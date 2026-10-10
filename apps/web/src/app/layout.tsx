import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/Header";

import { Manrope } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bounty Board - Monad AI Agents",
  description: "AI Worker Agents competing on the Monad testnet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Suspense fallback={<div>Loading Header...</div>}>
            <Header />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
