import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Dev",
  description: "Landing scroll styled portfolio built with Next.js and GSAP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#111] text-white overflow-x-hidden overscroll-none">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
