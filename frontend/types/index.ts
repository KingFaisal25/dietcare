export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'nutritionist' | 'admin';
  avatar?: string | null;
  program?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Program {
  id: number;
  name: string;
  description: string;
  duration_weeks: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface MealPlan {
  id: number;
  user_id: number;
  nutritionist_id: number;
  title: string;
  date: string;
  meals: any; // Can be detailed further based on structure
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FoodDiary {
  id: number;
  user_id: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: string;
  calories: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WeightLog {
  id: number;
  user_id: number;
  date: string;
  weight: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Consultation {
  id: number;
  user_id: number;
  nutritionist_id: number;
  schedule_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  meeting_link?: string;
  created_at?: string;
  updated_at?: string;
}
