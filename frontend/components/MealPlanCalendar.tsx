"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Info, Utensils, Coffee, Sun, Sunset, Moon } from "lucide-react";

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
}

interface DayPlan {
  day: number;
  date: string;
  meals: {
    breakfast: Meal;
    morning_snack: Meal;
    lunch: Meal;
    afternoon_snack: Meal;
    dinner: Meal;
  };
  total_calories: number;
  total_protein: number;
}

export default function MealPlanCalendar({ data }: { data: DayPlan[] }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [showInstructions, setShowInstructions] = useState<string | null>(null);

  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const currentDayPlan = data[selectedDay];

  const mealTypes = [
    { key: "breakfast", label: "Sarapan", icon: <Coffee className="w-5 h-5 text-orange-500" /> },
    { key: "morning_snack", label: "Cemilan Pagi", icon: <Utensils className="w-5 h-5 text-blue-500" /> },
    { key: "lunch", label: "Makan Siang", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { key: "afternoon_snack", label: "Cemilan Sore", icon: <Sunset className="w-5 h-5 text-orange-600" /> },
    { key: "dinner", label: "Makan Malam", icon: <Moon className="w-5 h-5 text-indigo-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {data.map((day, idx) => (
          <Button
            key={idx}
            variant={selectedDay === idx ? "primary" : "outline"}
            onClick={() => setSelectedDay(idx)}
            className="flex-col min-w-[80px] h-16"
          >
            <span className="text-xs">{dayNames[idx % 7]}</span>
            <span className="text-lg font-bold">H-{day.day}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {mealTypes.map(({ key, label, icon }) => {
            const meal = (currentDayPlan.meals as any)[key];
            if (!meal) return null;

            return (
              <Card key={key} className="p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-50 transition-colors">
                      {icon}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                      <h3 className="text-lg font-bold text-gray-800">{meal.name}</h3>
                      <div className="flex gap-3 mt-1">
                        <Badge variant="outline" className="text-xs">{meal.calories} kkal</Badge>
                        <Badge variant="outline" className="text-xs">P: {meal.protein}g</Badge>
                        <Badge variant="outline" className="text-xs">K: {meal.carbs}g</Badge>
                        <Badge variant="outline" className="text-xs">L: {meal.fat}g</Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstructions(showInstructions === key ? null : key)}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>

                {showInstructions === key && (
                  <div className="mt-4 pt-4 border-t space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-700">Bahan-bahan:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {meal.ingredients.map((ing: string, i: number) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-700">Cara Membuat:</h4>
                      <p className="text-sm text-gray-600 mt-1">{meal.instructions}</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-green-50 border-green-100">
            <h3 className="text-lg font-bold text-green-800 mb-4">Ringkasan Hari Ini</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-700">Kalori</span>
                  <span className="font-bold">{currentDayPlan.total_calories} kkal</span>
                </div>
                <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-700">Protein</span>
                  <span className="font-bold">{currentDayPlan.total_protein}g</span>
                </div>
                <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-4 italic">* Target harian Anda: 2000 kkal</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tips Sehat AI ✨</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pastikan Anda tetap terhidrasi dengan minum minimal 2 liter air sehari. Hindari penggunaan garam berlebih saat memasak untuk menjaga tekanan darah.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
