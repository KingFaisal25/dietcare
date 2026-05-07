import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NutritionInput, NutritionResult, calculateNutrition } from '@/lib/nutrition';

interface NutritionState {
  input: NutritionInput | null;
  result: NutritionResult | null;
  lastUpdated: string | null;
  
  // Actions
  setNutritionData: (input: NutritionInput) => void;
  clearNutritionData: () => void;
  updateWeight: (newWeight: number) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      input: null,
      result: null,
      lastUpdated: null,

      setNutritionData: (input) => {
        const result = calculateNutrition(input);
        set({ 
          input, 
          result, 
          lastUpdated: new Date().toISOString() 
        });
      },

      clearNutritionData: () => {
        set({ input: null, result: null, lastUpdated: null });
      },

      updateWeight: (newWeight) => {
        const currentInput = get().input;
        if (currentInput) {
          const newInput = { ...currentInput, weight_kg: newWeight };
          const result = calculateNutrition(newInput);
          set({ 
            input: newInput, 
            result, 
            lastUpdated: new Date().toISOString() 
          });
        }
      },
    }),
    {
      name: 'dietcare-nutrition-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
