import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | LexiAI",
  description: "Experience the power of AI-driven documentation search.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-neutral-950 antialiased selection:bg-emerald-500/30">
      {children}
    </main>
  );
}
