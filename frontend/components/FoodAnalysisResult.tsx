"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PieChart, TrendingUp, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";

interface FoodItem {
  name_id: string;
  name_en: string;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  confidence: number;
}

interface AnalysisResult {
  food_items: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes: string;
  is_healthy: boolean;
  health_score: number;
  suggestions: string[];
}

export default function FoodAnalysisResult({ result, image }: { result: AnalysisResult; image: string }) {
  const handleAddToDiary = async () => {
    try {
      // TODO: Implement add to diary via API
      alert("Makanan berhasil ditambahkan ke jurnal!");
    } catch (error) {
      console.error('Failed to add to diary', error);
      alert("Gagal menambahkan ke jurnal");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 5) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Detail Kandungan Gizi</h3>
              <Badge variant="outline" className="text-xs">Confidence: {Math.round(result.food_items[0]?.confidence * 100)}%</Badge>
            </div>

            <div className="space-y-4">
              {result.food_items.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.name_id}</h4>
                    <p className="text-sm text-gray-500">{item.portion}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">{item.calories} kkal</span>
                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                      <span>P: {item.protein_g}g</span>
                      <span>K: {item.carbs_g}g</span>
                      <span>L: {item.fat_g}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Kalori Terdeteksi</p>
                <p className="text-3xl font-black text-green-700">{result.total_calories} <span className="text-lg font-medium">kkal</span></p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-400 flex items-center justify-center text-xs font-bold">{result.total_protein}g</div>
                  <p className="text-[10px] mt-1 text-gray-500 uppercase">Protein</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-yellow-400 flex items-center justify-center text-xs font-bold">{result.total_carbs}g</div>
                  <p className="text-[10px] mt-1 text-gray-500 uppercase">Karbo</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-red-400 flex items-center justify-center text-xs font-bold">{result.total_fat}g</div>
                  <p className="text-[10px] mt-1 text-gray-500 uppercase">Lemak</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Saran Ahli Gizi AI ✨
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-green-50 text-green-800 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {s}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600 italic">"{result.notes}"</p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={`p-6 border-2 text-center ${getScoreColor(result.health_score)}`}>
            <h3 className="font-bold mb-2">Health Score</h3>
            <div className="text-6xl font-black mb-2">{result.health_score}</div>
            <p className="text-sm font-medium">Skala 1 - 10</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Komposisi Kalori
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span>Protein</span>
                <span>{Math.round((result.total_protein * 4 / result.total_calories) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${(result.total_protein * 4 / result.total_calories) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span>Karbohidrat</span>
                <span>{Math.round((result.total_carbs * 4 / result.total_calories) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${(result.total_carbs * 4 / result.total_calories) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span>Lemak</span>
                <span>{Math.round((result.total_fat * 9 / result.total_calories) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${(result.total_fat * 9 / result.total_calories) * 100}%` }}></div>
              </div>
            </div>
          </Card>

          <Button 
            onClick={handleAddToDiary}
            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-green-200 transition-all"
          >
            Catat di Jurnal Makan 🍽️
          </Button>
        </div>
      </div>
    </div>
  );
}
