import type { Metadata } from "next";
import { Instrument_Serif, Public_Sans, Overpass_Mono } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const mono = Overpass_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CompetitorMap",
  description: "Give it a company and see who they're really competing with.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
