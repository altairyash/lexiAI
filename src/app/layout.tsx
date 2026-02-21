import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});
const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

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
          outfit.variable
        )}>
        {children}
      </body>
    </html>
  );
}
