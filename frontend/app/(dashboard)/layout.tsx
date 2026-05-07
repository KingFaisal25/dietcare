import React from "react";
import Sidebar from "@/components/klien/Sidebar";
import MobileBottomNav from "@/components/klien/MobileBottomNav";
import ChatbotWidget from "@/components/ChatbotWidget";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function KlienLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <main className="relative flex-1 overflow-y-auto bg-3d-grid pb-16 md:pb-0">
          <div className="pointer-events-none absolute right-4 top-4 z-20 md:pointer-events-auto">
            <ThemeToggle />
          </div>
          {children}
          <ChatbotWidget />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
