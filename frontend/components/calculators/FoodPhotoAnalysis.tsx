import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCamera, FiUpload, FiX, FiLoader, FiCheck, FiClock } from "react-icons/fi";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface TotalNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AnalysisResult {
  id: string;
  image_url: string;
  status: string;
  created_at: string;
  food_items: FoodItem[];
  total_nutrition: TotalNutrition;
  suggestions: string;
}

interface FoodPhotoAnalysisProps {
  onComplete?: (result: AnalysisResult) => void;
  onAddToDiary?: (result: AnalysisResult) => void;
}

export default function FoodPhotoAnalysis({ onComplete, onAddToDiary }: FoodPhotoAnalysisProps) {
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("food_image", imageFile);

      const res = await api.post("/public/food-analysis/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60s — AI can be slow
      });

      const { status, data } = res.data;

      if (status === "completed" && data) {
        const result: AnalysisResult = {
          id: Date.now().toString(),
          image_url: image ?? "",
          status: "completed",
          created_at: new Date().toISOString(),
          food_items: data.food_items ?? [],
          total_nutrition: data.total_nutrition ?? { calories: 0, protein: 0, carbs: 0, fat: 0 },
          suggestions: data.suggestions ?? "",
        };
        setAnalysisResult(result);
        if (onComplete) onComplete(result);
      } else {
        setErrorMsg(res.data.message ?? "Analisis gagal. Coba foto yang lebih jelas.");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Terjadi kesalahan. Silakan coba lagi.";
      setErrorMsg(msg);
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setImageFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatNumber = (num: number) => {
    return num ? num.toFixed(1) : "0";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">
            Food Photo AI Analysis
          </h2>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Ambil foto makanan Anda dan AI akan menganalisis kandungan gizinya
          </p>
        </div>

        {/* Image Upload Section */}
        {!image && !analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div
              className="relative w-full h-64 border-2 border-dashed border-[var(--border-color)] rounded-2xl 
                       bg-[var(--background-elevated)] flex flex-col items-center justify-center
                       hover:border-green-500 transition-all cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />

              <div className="relative z-10 text-center">
                <FiCamera className="w-12 h-12 text-[var(--muted-foreground)] mb-4 mx-auto" />
                <p className="text-lg font-bold text-[var(--foreground)] mb-2">
                  Upload Food Photo
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Klik untuk memilih foto makanan Anda
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-[var(--background-elevated)] rounded-lg">
                <div className="text-green-500 font-bold">AI-Powered</div>
                <div className="text-[var(--muted-foreground)]">Smart Analysis</div>
              </div>
              <div className="text-center p-2 bg-[var(--background-elevated)] rounded-lg">
                <div className="text-blue-500 font-bold">Real-time</div>
                <div className="text-[var(--muted-foreground)]">Nutrition Data</div>
              </div>
              <div className="text-center p-2 bg-[var(--background-elevated)] rounded-lg">
                <div className="text-purple-500 font-bold">Free</div>
                <div className="text-[var(--muted-foreground)]">No Cost</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Uploaded Image Preview */}
        {image && !analysisResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="relative">
              <img
                src={image}
                alt="Food preview"
                className="w-full h-64 object-cover rounded-2xl"
              />
              <button
                onClick={resetAnalysis}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FiCamera className="w-4 h-4 mr-2" />
                    Analyze Food
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={resetAnalysis}
                className="flex-1"
              >
                <FiX className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiLoader className="w-6 h-6 text-green-500 animate-spin" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
              AI is analyzing your food...
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              This may take 10-30 seconds depending on image complexity
            </p>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysisResult && analysisResult.status === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                Analysis Complete!
              </h3>
              <button
                onClick={resetAnalysis}
                className="w-8 h-8 bg-[var(--background-elevated)] rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Food Image */}
            <div className="relative">
              <img
                src={analysisResult.image_url}
                alt="Analyzed food"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                <FiCheck className="w-3 h-3" />
                Analyzed
              </div>
            </div>

            {/* Total Nutrition */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-black text-orange-500">
                  {formatNumber(analysisResult.total_nutrition.calories)}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">Calories</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-black text-blue-500">
                  {formatNumber(analysisResult.total_nutrition.protein)}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">Protein (g)</div>
              </Card>
            </div>

            {/* Food Items */}
            {analysisResult.food_items.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-[var(--foreground)] text-sm">
                  Identified Food Items:
                </h4>
                {analysisResult.food_items.map((item, index) => (
                  <Card key={index} className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {item.portion}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-bold text-orange-500">
                        {formatNumber(item.calories)} cal
                      </div>
                      <div className="text-[var(--muted-foreground)]">
                        P: {formatNumber(item.protein)}g
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {analysisResult.suggestions && (
              <Card className="p-4 bg-blue-50/20 border-blue-200/50">
                <h4 className="font-bold text-blue-600 mb-2 text-sm">
                  AI Suggestions:
                </h4>
                <p className="text-sm text-[var(--foreground)]">
                  {analysisResult.suggestions}
                </p>
              </Card>
            )}

            <Button
              onClick={() => onComplete?.(analysisResult)}
              className="w-full"
            >
              Add to Food Diary
            </Button>
          </motion.div>
        )}

        {/* Error State */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 text-red-500"
          >
            <FiX className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Analisis Gagal</h3>
            <p className="text-sm mb-4 text-red-400">{errorMsg}</p>
            <Button onClick={resetAnalysis}>Coba Lagi</Button>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
