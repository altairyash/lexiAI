import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // New imports
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "LexiAI",
  description: "Open-Sourced AI Documentation Search Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          playfair.variable
        )}>
        {children}
      </body>
    </html>
  );
}
