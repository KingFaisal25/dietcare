"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  X,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Bot,
  Check,
} from "lucide-react";

/* ─── Quick suggestions ─────────────────────────────────────────────────── */
const QUICK_SUGGESTIONS = [
  { icon: "🍽️", label: "Saran makan siang", text: "Apa saran makan siang sehat hari ini yang rendah kalori?" },
  { icon: "📊", label: "Cek harga paket",    text: "Berapa harga paket diet program di DietCare?" },
  { icon: "💧", label: "Tips minum air",     text: "Berapa liter air yang harus saya minum setiap hari?" },
  { icon: "👩‍⚕️", label: "Lihat ahli gizi",   text: "Siapa saja ahli gizi yang tersedia untuk konsultasi?" },
];

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface NadiaMessage {
  id: string;
  role: "user" | "nadia";
  content: string;
  timestamp: number;
}

/* ─── Rule-based responses ───────────────────────────────────────────────── */
function getNadiaResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes("harga") || msg.includes("paket") || msg.includes("biaya")) {
    return "DietCare punya 3 paket utama yang populer:\n\n💚 **Simple**: Rp279.000 / 30 hari\n💚 **Intensif**: Rp609.000 / 30 hari\n💚 **Clinicare**: Rp1.499.000 / 30 hari\n\nSemua paket termasuk meal plan personal! Kamu bisa lihat detail lengkap di halaman \"Harga\".";
  }
  if (msg.includes("ahli gizi") || msg.includes("ahligizi") || msg.includes("nutritionist")) {
    return "Kami punya tim ahli gizi tersertifikasi MTKI dengan berbagai spesialisasi: penurunan berat badan, diabetes, ibu hamil, dan olahraga. Lihat profil lengkap mereka di halaman \"Ahli Gizi\" ya!";
  }
  if (msg.includes("makan") || msg.includes("menu") || msg.includes("diet")) {
    return "Untuk diet sehat, coba kombinasi:\n- ½ piring sayur & buah\n- ¼ piring protein (ikan, ayam, tahu)\n- ¼ piring karbohidrat kompleks (nasi merah, oatmeal)\n\nIngin rekomendasi meal plan personal? Konsultasi dengan ahli gizi kami!";
  }
  if (msg.includes("air") || msg.includes("minum")) {
    return "Rekomendasi minum air putih harian:\n- Wanita: ~2 liter (8 gelas)\n- Pria: ~2.5 liter (10 gelas)\n\nTambah 1-2 gelas jika kamu banyak berolahraga!";
  }
  if (msg.includes("daftar") || msg.includes("register")) {
    return "Untuk mendaftar, klik tombol \"Daftar\" di pojok kanan atas ya! Isi data diri, lalu kamu bisa langsung pilih program diet yang sesuai.";
  }
  if (msg.includes("kontak") || msg.includes("wa") || msg.includes("whatsapp")) {
    return "Kamu bisa menghubungi tim DietCare via WhatsApp di 0812-3456-7890 ya!";
  }
  return "Terima kasih untuk pertanyaannya! Jika kamu butuh informasi lebih detail tentang program, harga, atau ahli gizi, saya sarankan untuk melihat halaman terkait di website atau chat langsung dengan tim ahli gizi kami via WhatsApp ya 😊";
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function NadiaChat() {
  const [isOpen, setIsOpen]   = useState(false);
  const [input, setInput]     = useState("");
  const [copied, setCopied]   = useState<string | null>(null);
  const [messages, setMessages] = useState<NadiaMessage[]>([
    {
      id: "welcome-1",
      role: "nadia",
      content: "Halo! Saya Nadia ✨ Asisten Gizi AI Anda. Ada yang bisa saya bantu hari ini? Misalnya tentang program DietCare, paket harga, atau tips nutrisi sederhana?",
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const userMsg: NadiaMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const nadiaMsg: NadiaMessage = {
        id: `nadia-${Date.now()}`,
        role: "nadia",
        content: getNadiaResponse(userMsg.content),
        timestamp: Date.now(),
      };
      setMessages((p) => [...p, nadiaMsg]);
      setIsTyping(false);
    }, 900 + Math.random() * 800);
  }, [input]);

  const handleQuickSuggestion = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="fixed z-50">
      {/* ── Floating trigger button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Buka chat dengan Nadia"
          className="fixed bottom-6 right-6 group flex items-center gap-3 rounded-full px-5 py-3.5 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:gap-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/40"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)",
            boxShadow: "0 8px 32px rgba(22,163,74,0.45), 0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {/* Animated ring */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-green-400 pointer-events-none" />
          {/* Icon container */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Bot className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white animate-pulse" />
          </div>
          <span className="text-sm font-bold tracking-wide">Chat dengan Nadia</span>
        </button>
      )}

      {/* ── Chat window ── */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex w-[95vw] max-w-[460px] flex-col rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 40%, #f0fdf4 100%)",
            border: "1px solid rgba(22,163,74,0.18)",
            boxShadow: "0 24px 64px rgba(22,163,74,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between p-4 text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 60%, #14532d 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl relative"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
              >
                <Bot className="h-7 w-7" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-300 border-2 border-green-700 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight">Nadia AI ✨</h3>
                <p className="text-[11px] font-medium opacity-80 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 inline-block animate-pulse" />
                  Asisten Gizi DietCare • Online 24/7
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Tutup chat"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* ── Messages area ── */}
          <div
            className="max-h-[55vh] min-h-[340px] flex-1 overflow-y-auto p-4"
            style={{
              background: "linear-gradient(180deg, #f0fdf4 0%, #f7fef9 100%)",
              scrollbarWidth: "thin",
              scrollbarColor: "#bbf7d0 transparent",
            }}
          >
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Nadia avatar dot */}
                  {msg.role === "nadia" && (
                    <div className="mr-2 mt-1 flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ background: "linear-gradient(135deg,#16a34a,#14532d)" }}>
                      <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md text-white font-medium"
                        : "rounded-tl-md text-neutral-800 shadow-sm"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg,#16a34a,#15803d)",
                            boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                          }
                        : {
                            background: "white",
                            border: "1px solid rgba(22,163,74,0.15)",
                            boxShadow: "0 2px 8px rgba(22,163,74,0.08)",
                          }
                    }
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Nadia message actions */}
                    {msg.role === "nadia" && (
                      <div className="mt-2 flex justify-end gap-2 border-t border-green-100 pt-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="text-green-300 transition hover:text-green-600"
                          title="Salin pesan"
                        >
                          {copied === msg.id
                            ? <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                            : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                        </button>
                        <button
                          className="text-green-300 transition hover:text-green-600"
                          title="Bermanfaat"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          className="text-green-300 transition hover:text-red-400"
                          title="Kurang tepat"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start items-end gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#16a34a,#14532d)" }}>
                    <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-md px-4 py-3 shadow-sm"
                    style={{
                      background: "white",
                      border: "1px solid rgba(22,163,74,0.15)",
                      boxShadow: "0 2px 8px rgba(22,163,74,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-500 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-600" />
                      <span className="ml-2 text-xs text-green-600 font-medium">Nadia mengetik…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Quick suggestions ── */}
          <div
            className="flex-shrink-0 border-t px-4 py-3"
            style={{
              background: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)",
              borderColor: "rgba(22,163,74,0.12)",
            }}
          >
            <div className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}>
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleQuickSuggestion(s.text)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "white",
                    border: "1.5px solid rgba(22,163,74,0.3)",
                    color: "#15803d",
                    boxShadow: "0 2px 8px rgba(22,163,74,0.12)",
                  }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Input area ── */}
          <div
            className="flex-shrink-0 border-t p-4"
            style={{
              background: "white",
              borderColor: "rgba(22,163,74,0.12)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya Nadia…"
                  className="h-12 w-full rounded-2xl px-4 text-sm font-medium text-neutral-800 placeholder:text-neutral-400 transition-all focus:outline-none"
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px solid rgba(22,163,74,0.25)",
                    boxShadow: "0 1px 4px rgba(22,163,74,0.08) inset",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1.5px solid #16a34a";
                    e.target.style.boxShadow = "0 0 0 4px rgba(22,163,74,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1.5px solid rgba(22,163,74,0.25)";
                    e.target.style.boxShadow = "0 1px 4px rgba(22,163,74,0.08) inset";
                  }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Kirim pesan"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg,#16a34a,#15803d)"
                    : "#d1d5db",
                  boxShadow: input.trim()
                    ? "0 4px 16px rgba(22,163,74,0.4)"
                    : "none",
                }}
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-2.5 text-center text-[10px] font-medium text-green-600/60">
              Nadia adalah AI · Untuk konsultasi mendalam, hubungi ahli gizi Anda
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
