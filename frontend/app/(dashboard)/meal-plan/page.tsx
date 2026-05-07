"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import api from "@/lib/api";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import ShoppingList from "@/components/ShoppingList";
import { Sparkles, Calendar, ShoppingBag, History, Loader2 } from "lucide-react";

export default function MealPlanPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"generate" | "view" | "history">("generate");

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
  }, []);

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

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Meal Plan Generator</h1>
          <p className="text-gray-600 text-sm">Susun menu makan sehatmu secara otomatis dengan bantuan AI</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "generate" ? "primary" : "outline"}
            onClick={() => setActiveTab("generate")}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </Button>
          <Button
            variant={activeTab === "history" ? "primary" : "outline"}
            onClick={() => setActiveTab("history")}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Riwayat
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
          <h2 className="text-xl font-semibold">{status}</h2>
          <p className="text-gray-500">Mohon tunggu sebentar, kami sedang menyiapkan yang terbaik untukmu.</p>
        </Card>
      ) : activeTab === "generate" ? (
        <Card className="p-6 max-w-2xl mx-auto">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Kalori (kkal)</label>
                <Input
                  type="number"
                  value={formData.calorie_target}
                  onChange={(e) => setFormData({ ...formData, calorie_target: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Durasi (Hari)</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                >
                  <option value={7}>7 Hari</option>
                  <option value={14}>14 Hari</option>
                  <option value={30}>30 Hari</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Diet</label>
              <Input
                placeholder="Misal: Low Carb, Ketogenik, Vegan, dll"
                value={formData.diet_type}
                onChange={(e) => setFormData({ ...formData, diet_type: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget</label>
              <div className="flex gap-2">
                {["ekonomi", "menengah", "premium"].map((b) => (
                  <Button
                    key={b}
                    type="button"
                    variant={formData.budget === b ? "primary" : "outline"}
                    onClick={() => setFormData({ ...formData, budget: b })}
                    className="capitalize flex-1"
                  >
                    {b}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full py-6 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate AI Meal Plan ✨
            </Button>
          </form>
        </Card>
      ) : activeTab === "view" && mealPlan ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Button variant="primary" className="flex items-center gap-2 shrink-0">
              <Calendar className="w-4 h-4" />
              Kalender Makan
            </Button>
            <Button variant="outline" className="flex items-center gap-2 shrink-0">
              <ShoppingBag className="w-4 h-4" />
              Daftar Belanja
            </Button>
          </div>

          <MealPlanCalendar data={mealPlan.days} />
          <ShoppingList data={mealPlan.shopping_list} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fetchMealPlan(item.id)}>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={item.status === "done" ? "success" : "warning"}>{item.status}</Badge>
                <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
              </div>
              <h3 className="font-semibold">{item.params.diet_type} - {item.params.duration_days} Hari</h3>
              <p className="text-sm text-gray-600 mt-1">{item.params.calorie_target} kkal/hari</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
