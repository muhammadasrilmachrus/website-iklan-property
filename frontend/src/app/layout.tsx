import type { Metadata } from "next";
import { DM_Serif_Display, Inter_Tight } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../shared/lib/auth";
import Navbar from "../shared/components/Navbar";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rumahku - Iklan Rumah, Kost, dan Ruko",
  description: "Temukan dan pasang iklan properti rumah, kost, dan ruko untuk dijual atau disewakan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${dmSerif.variable} ${interTight.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}