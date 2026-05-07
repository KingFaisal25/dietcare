/**
 * Utilitas untuk perhitungan gizi (BMR, TDEE, BMI, Macro)
 */

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type TargetType = 'lose' | 'gain' | 'maintain' | 'body_recomp';

export interface NutritionInput {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: Gender;
  activity_level: ActivityLevel;
  target_type: TargetType;
}

export interface NutritionResult {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number; // grams
    carbs: number;   // grams
    fat: number;     // grams
  };
  weeklyChange: number; // kg
}

export const calculateBMI = (weight: number, height: number) => {
  if (!weight || !height) return { bmi: 0, category: '-', color: 'text-gray-400' };
  const hm = height / 100;
  const bmi = weight / (hm * hm);
  const rounded = Math.round(bmi * 10) / 10;
  
  let category = '';
  let color = '';
  if (rounded < 18.5) { category = 'Kurus'; color = 'text-yellow-600'; }
  else if (rounded <= 22.9) { category = 'Normal'; color = 'text-green-600'; }
  else if (rounded <= 24.9) { category = 'Berisiko'; color = 'text-orange-500'; }
  else if (rounded <= 29.9) { category = 'Overweight'; color = 'text-orange-600'; }
  else { category = 'Obesitas'; color = 'text-red-600'; }
  
  return { bmi: rounded, category, color };
};

export const calculateNutrition = (input: NutritionInput): NutritionResult => {
  const { weight_kg, height_cm, age, gender, activity_level, target_type } = input;

  // 1. BMR (Mifflin-St Jeor Equation)
  const bmr = gender === 'male'
    ? (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    : (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;

  // 2. TDEE
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const tdee = bmr * activityMultipliers[activity_level];

  // 3. Target Calories based on Goal
  const targetMultipliers: Record<TargetType, number> = {
    lose: 0.8,      // 20% deficit
    gain: 1.15,     // 15% surplus
    maintain: 1.0,
    body_recomp: 0.95 // 5% deficit
  };
  
  let targetCalories = Math.round(tdee * targetMultipliers[target_type]);
  
  // Safety check: minimum calories
  const minCal = gender === 'male' ? 1500 : 1200;
  targetCalories = Math.max(targetCalories, minCal);

  // 4. Macros
  // Standard split: 30% Protein, 45% Carbs, 25% Fat
  const proteinCals = targetCalories * 0.30;
  const carbsCals = targetCalories * 0.45;
  const fatCals = targetCalories * 0.25;

  const macros = {
    protein: Math.round(proteinCals / 4), // 4 cal/g
    carbs: Math.round(carbsCals / 4),   // 4 cal/g
    fat: Math.round(fatCals / 9)        // 9 cal/g
  };

  // 5. Weekly Change Estimation
  const deficit = targetCalories - Math.round(tdee);
  const weeklyChange = Math.round(((deficit * 7) / 7700) * 100) / 100;

  const bmiData = calculateBMI(weight_kg, height_cm);

  return {
    bmi: bmiData.bmi,
    bmiCategory: bmiData.category,
    bmiColor: bmiData.color,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    macros,
    weeklyChange
  };
};
