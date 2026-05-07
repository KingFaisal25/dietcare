"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Camera, Upload, X, Loader2, Sparkles } from "lucide-react";
import api from "@/lib/api";
import FoodAnalysisResult from "./FoodAnalysisResult";

export default function FoodCamera() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [mealType, setMealType] = useState("lunch");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("meal_type", mealType);

    try {
      const response = await api.post("/food-analysis/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data.result);
      setMessage({ type: 'success', text: 'Analisis berhasil!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menganalisis foto' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!preview ? (
        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center space-y-4 hover:border-green-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="p-4 bg-green-100 rounded-full">
            <Camera className="w-12 h-12 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800">Foto Makananmu</h3>
            <p className="text-gray-500">Ambil foto atau upload dari galeri untuk analisis gizi otomatis</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment"
            onChange={handleFileChange} 
          />
          <Button variant="primary" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Pilih Foto
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black group">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            {!loading && !result && (
              <button 
                onClick={reset}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-green-400" />
                <p className="font-medium animate-pulse">AI sedang menganalisis... 🔍</p>
              </div>
            )}
          </div>

          {!result && !loading && (
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Waktu Makan</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                    <Button
                      key={type}
                      variant={mealType === type ? "primary" : "outline"}
                      onClick={() => setMealType(type)}
                      className="capitalize"
                    >
                      {type === "breakfast" ? "Sarapan" : type === "lunch" ? "Siang" : type === "dinner" ? "Malam" : "Cemilan"}
                    </Button>
                  ))}
                </div>
              </div>
              <Button 
                onClick={handleAnalyze} 
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Analisis Gizi Sekarang
              </Button>
            </Card>
          )}

          {result && <FoodAnalysisResult result={result} image={preview} />}
        </div>
      )}
    </div>
  );
}
