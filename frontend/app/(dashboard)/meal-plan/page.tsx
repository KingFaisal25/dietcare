"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import api from "@/lib/api";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import ShoppingList from "@/components/ShoppingList";
import {
  FiZap,
  FiCalendar,
  FiShoppingBag,
  FiClock,
  FiLoader,
  FiSend,
  FiCpu,
  FiX,
} from "react-icons/fi";
import { gsap } from "gsap";
import { Scene3DBackground } from "@/components/ui/Scene3DBackground";
import { TiltCard } from "@/components/ui/TiltCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function MealPlanPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"generate" | "view" | "history">("generate");
  const [showChat, setShowChat] = useState(true); // Always show chat!
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Halo! Saya adalah asisten AI untuk membantu kamu dengan meal plan dan pertanyaan seputar nutrisi. Ada yang bisa saya bantu?",
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    calorie_target: 2000,
    diet_type: "umum",
    duration_days: 7,
    budget: "menengah",
    allergies: [] as string[],
    food_preferences: [] as string[],
  });

  useEffect(() => {
    fetchHistory();
    gsap.from(pageRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading]);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/meal-plan/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("AI sedang menyusun meal plan kamu... (~30 detik)");

    try {
      const response = await api.post("/meal-plan/generate", formData);
      setGenerationId(response.data.generation_id);
      startPolling(response.data.generation_id);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Gagal membuat meal plan");
    }
  };

  const startPolling = (id: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/meal-plan/status/${id}`);
        if (response.data.status === "done") {
          clearInterval(interval);
          fetchMealPlan(id);
        } else if (response.data.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          toast.error("Gagal membuat meal plan: " + response.data.error_message);
        }
      } catch (error) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 3000);
  };

  const fetchMealPlan = async (id: number) => {
    try {
      const response = await api.get(`/meal-plan/${id}`);
      setMealPlan(response.data);
      setLoading(false);
      setActiveTab("view");
      fetchHistory();
    } catch (error) {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const messages = [
        {
          role: "system",
          content:
            "Kamu adalah asisten nutrisi yang ramah dan profesional dari DietCare. Jawab pertanyaan pengguna tentang meal plan, nutrisi, dan tips sehat dengan bahasa Indonesia yang jelas dan informatif.",
        },
        ...chatMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: chatInput },
      ];

      const response = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.choices[0].message.content,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast.error("Gagal mendapatkan respons dari AI");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden"
    >
      <Scene3DBackground subtle />
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight leading-tight">
              AI Meal Plan Generator
            </h1>
            <p className="text-[var(--muted-foreground)] font-medium mt-4 text-lg">
              Susun menu makan sehatmu secara otomatis dengan bantuan AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-3 p-2 bg-[var(--background-elevated)] rounded-2xl border border-[var(--border-color)] shadow-sm">
              <Button
                variant={activeTab === "generate" ? "primary" : "outline"}
                onClick={() => setActiveTab("generate")}
                className="flex items-center gap-2"
              >
                <FiZap className="w-4 h-4" />
                Generate
              </Button>
              <Button
                variant={activeTab === "history" ? "primary" : "outline"}
                onClick={() => setActiveTab("history")}
                className="flex items-center gap-2"
              >
                <FiClock className="w-4 h-4" />
                Riwayat
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left Column - Main Tabs */}
          <div className="lg:col-span-2 space-y-8">
            {loading ? (
              <TiltCard className="p-12 flex flex-col items-center justify-center space-y-6 text-center">
                <FiLoader className="w-14 h-14 text-green-500 animate-spin" />
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">{status}</h2>
                <p className="text-[var(--muted-foreground)] text-lg">
                  Mohon tunggu sebentar, kami sedang menyiapkan yang terbaik untukmu.
                </p>
              </TiltCard>
            ) : activeTab === "generate" ? (
              <Card className="p-8 sm:p-12 bg-[var(--background-elevated)]">
                <form onSubmit={handleGenerate} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-sm font-black text-[var(--foreground)] uppercase tracking-[0.2em]">
                        Target Kalori (kkal)
                      </label>
                      <Input
                        type="number"
                        value={formData.calorie_target}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            calorie_target: parseInt(e.target.value) || 2000,
                          })
                        }
                        className="bg-[var(--background)] border-[var(--border-color)] text-[var(--foreground)] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-inner"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-black text-[var(--foreground)] uppercase tracking-[0.2em]">
                        Durasi (Hari)
                      </label>
                      <select
                        className="w-full h-14 px-6 border border-[var(--border-color)] rounded-2xl bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium shadow-inner"
                        value={formData.duration_days}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration_days: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value={7}>7 Hari</option>
                        <option value={14}>14 Hari</option>
                        <option value={30}>30 Hari</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-[var(--foreground)] uppercase tracking-[0.2em]">
                      Tipe Diet
                    </label>
                    <Input
                      placeholder="Misal: Low Carb, Ketogenik, Vegan, dll"
                      value={formData.diet_type}
                      onChange={(e) =>
                        setFormData({ ...formData, diet_type: e.target.value })
                      }
                      className="bg-[var(--background)] border-[var(--border-color)] text-[var(--foreground)] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-inner"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-[var(--foreground)] uppercase tracking-[0.2em]">
                      Budget
                    </label>
                    <div className="flex gap-4">
                      {["ekonomi", "menengah", "premium"].map((b) => (
                        <Button
                          key={b}
                          type="button"
                          variant={formData.budget === b ? "primary" : "outline"}
                          onClick={() => setFormData({ ...formData, budget: b })}
                          className="capitalize flex-1 py-4 text-sm font-bold"
                        >
                          {b}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center justify-center gap-3 text-base font-black rounded-[1.5rem] shadow-xl shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1 transition-all"
                  >
                    <FiZap className="w-6 h-6" />
                    Generate AI Meal Plan ✨
                  </Button>
                </form>
              </Card>
            ) : activeTab === "view" && mealPlan ? (
              <div className="space-y-8">
                <div className="flex items-center gap-4 overflow-x-auto pb-4">
                  <Button variant="primary" className="flex items-center gap-3 shrink-0">
                    <FiCalendar className="w-5 h-5" />
                    Kalender Makan
                  </Button>
                  <Button variant="outline" className="flex items-center gap-3 shrink-0">
                    <FiShoppingBag className="w-5 h-5" />
                    Daftar Belanja
                  </Button>
                </div>

                <MealPlanCalendar data={mealPlan.days} />
                <ShoppingList data={mealPlan.shopping_list} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {history.map((item) => (
                  <TiltCard
                    key={item.id}
                    className="p-8 bg-[var(--background-elevated)]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant={item.status === "done" ? "success" : "warning"}>
                        {item.status}
                      </Badge>
                      <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <h3 className="font-black text-[var(--foreground)] text-xl tracking-tight">
                      {item.params.diet_type} - {item.params.duration_days} Hari
                    </h3>
                    <p className="text-sm font-medium text-[var(--muted-foreground)] mt-3">
                      {item.params.calorie_target} kkal/hari
                    </p>
                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => fetchMealPlan(item.id)}
                        className="flex-1"
                      >
                        Lihat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await api.delete(`/meal-plan/${item.id}`);
                            toast.success("Meal plan berhasil dihapus!");
                            fetchHistory();
                          } catch (err: any) {
                            toast.error(err.response?.data?.message || "Gagal menghapus meal plan");
                          }
                        }}
                        className="text-red-500 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10"
                      >
                        Hapus
                      </Button>
                    </div>
                  </TiltCard>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Chat */}
          {showChat && (
            <div className="lg:col-span-1">
              <Card className="h-[650px] flex flex-col bg-[var(--background-elevated)] border-[var(--border-color)] shadow-xl rounded-[2rem]">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-green-500/10 flex items-center justify-center">
                      <FiCpu className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-[var(--foreground)] text-lg">Asisten AI</h3>
                      <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Online 24/7</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-3 hover:bg-[var(--background-soft)] rounded-full transition"
                  >
                    <FiX className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[var(--background-soft)]/50">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-[1.75rem] px-6 py-4 ${
                          msg.role === "user"
                            ? "rounded-br-md bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20"
                            : "rounded-bl-md bg-[var(--background-elevated)] text-[var(--foreground)] shadow-sm border border-[var(--border-color)]"
                        }`}
                      >
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        <p className="text-xs mt-3 text-right opacity-80 font-bold">
                          {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-[1.75rem] rounded-bl-md bg-[var(--background-elevated)] px-6 py-4 shadow-sm border border-[var(--border-color)]">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 animate-bounce rounded-full bg-green-500 [animation-delay:-0.3s]" />
                          <span className="h-3 w-3 animate-bounce rounded-full bg-green-500 [animation-delay:-0.15s]" />
                          <span className="h-3 w-3 animate-bounce rounded-full bg-green-500" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="border-t border-[var(--border-color)] p-5 bg-[var(--background)]">
                  <div className="flex items-end gap-4">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      placeholder="Tanya tentang nutrisi..."
                      className="bg-[var(--background-soft)] border-[var(--border-color)] text-[var(--foreground)] focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                    <Button
                      onClick={sendChatMessage}
                      disabled={chatLoading || !chatInput.trim()}
                      className="h-12 w-12 p-0 rounded-[1.25rem] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <FiSend className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
