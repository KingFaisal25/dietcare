import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiCalendar, FiClock, FiPlus } from "react-icons/fi";
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

interface FoodAnalysisResultModalProps {
  result: AnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export default function FoodAnalysisResultModal({ result, isOpen, onClose }: FoodAnalysisResultModalProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToDiary = async () => {
    setIsAdding(true);
    try {
      // Add each food item to food diary
      for (const item of result.food_items) {
        await api.post("/food-diary", {
          food_name: item.name,
          portion: item.portion,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          meal_type: "other", // You can add meal type selection
          source: "ai_analysis",
          analysis_id: result.id,
        });
      }

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Failed to add to diary:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: isOpen ? 1 : 0.9, opacity: isOpen ? 1 : 0 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">
              Food Analysis Result
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered nutrition analysis
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Food Image */}
          <div className="mb-6">
            <img
              src={result.image_url}
              alt="Analyzed food"
              className="w-full h-48 object-cover rounded-2xl"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              Analyzed
            </div>
          </div>

          {/* Total Nutrition Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-2xl font-black text-orange-500">
                {result.total_nutrition.calories}
              </div>
              <div className="text-xs text-gray-500">Calories</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-black text-blue-500">
                {result.total_nutrition.protein}
              </div>
              <div className="text-xs text-gray-500">Protein (g)</div>
            </Card>
          </div>

          {/* Food Items */}
          {result.food_items.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-3 text-sm">
                Identified Food Items:
              </h4>
              <div className="space-y-2">
                {result.food_items.map((item, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.portion}
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-bold text-orange-500">
                          {item.calories} cal
                        </div>
                        <div className="text-gray-500">
                          P: {item.protein}g
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {result.suggestions && (
            <Card className="p-4 bg-blue-50/20 border-blue-200/50 mb-6">
              <h4 className="font-bold text-blue-600 mb-2 text-sm">
                AI Suggestions:
              </h4>
              <p className="text-sm text-gray-700">
                {result.suggestions}
              </p>
            </Card>
          )}

          {/* Action Button */}
          <Button
            onClick={handleAddToDiary}
            disabled={isAdding}
            className="w-full"
          >
            {isAdding ? (
              <>
                <FiPlus className="w-4 h-4 mr-2 animate-spin" />
                Adding to Diary...
              </>
            ) : (
              <>
                <FiPlus className="w-4 h-4 mr-2" />
                Add to Food Diary
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
