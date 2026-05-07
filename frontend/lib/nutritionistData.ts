export type NutritionistClientStatus = "on-track" | "perlu perhatian";

export interface NutritionistDashboardStats {
  total_active_clients: number;
  consultations_today: number;
  clients_need_attention: number;
  average_rating: number | null;
  review_count: number;
}

export interface NutritionistNotificationGroup {
  count: number;
  items: Array<{
    client_id?: number;
    name: string;
    program?: string;
    current_day?: number;
    preview?: string;
    time?: string;
  }>;
}

export interface NutritionistClientSummary {
  id: number;
  name: string;
  avatar_url: string;
  program: string;
  current_day: number;
  program_duration_days: number;
  current_weight: number;
  weight_change: number;
  status: NutritionistClientStatus;
  has_meal_plan_today: boolean;
  needs_attention_reason: string | null;
}

export interface NutritionistDashboardResponse {
  stats: NutritionistDashboardStats;
  notifications: {
    meal_plan_pending: NutritionistNotificationGroup;
    unreplied_messages: NutritionistNotificationGroup;
  };
  clients: NutritionistClientSummary[];
}

export interface NutritionistClientDetailResponse {
  client: {
    id: number;
    name: string;
    avatar_url: string;
    email?: string;
    age?: number | null;
    program: string;
    program_status: string;
    current_day: number;
    program_duration_days: number;
    medical_conditions: string[];
    allergies: string[];
    dietary_preferences: string[];
    target_type?: string | null;
    target_weight_kg?: number | null;
  };
  calculations: {
    bmi: number;
    bmr: number;
    tdee: number;
    target_calories: number;
    macros: {
      protein_g: number;
      carb_g: number;
      fat_g: number;
    };
  };
  progress: {
    labels: string[];
    weights: number[];
    current_weight: number;
    initial_weight: number;
    change_kg: number;
  };
  meal_plan: Array<{
    day_number: number;
    total_calories: number;
    meals: Array<{
      id: number;
      meal_type: string;
      meal_type_label: string;
      menu_name: string;
      ingredients: Array<{
        food_id?: number;
        name: string;
        quantity_gram: number;
        calories?: number;
        protein_g?: number;
        carb_g?: number;
        fat_g?: number;
      }>;
      calories: number;
      protein_g: number;
      carb_g: number;
      fat_g: number;
      notes?: string | null;
    }>;
  }>;
  food_diary: Array<{
    id: number;
    date: string;
    meal_type: string;
    meal_type_label: string;
    food_name: string;
    quantity_gram: number;
    calories: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
  }>;
  notes: Array<{
    title: string;
    content: string;
  }>;
  consultations: Array<{
    id: number;
    type: string;
    status: string;
    scheduled_at: string;
    duration_minutes?: number | null;
    notes?: string | null;
  }>;
  review_summary?: {
    average_rating: number | null;
    review_count: number;
    latest_review: {
      rating: number;
      review: string | null;
      submitted_at?: string | null;
    } | null;
  };
}

export type NutritionistAvailability = "active" | "slow" | "off";

export interface TkpiFoodItem {
  id: number;
  name: string;
  category: string | null;
  calories_per_100g: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
}

export interface MealPlanTemplateResponseItem {
  id: number;
  name: string;
  day_number: number | null;
  notes: string | null;
  meals: NutritionistClientDetailResponse["meal_plan"][number]["meals"];
  totals: {
    calories: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
  };
  created_at?: string;
}

export interface NutritionistScheduleResponse {
  week_start: string;
  week_end: string;
  availability: Array<{
    weekday: number;
    availability: NutritionistAvailability;
  }>;
  booked_slots: Array<{
    id: number;
    client_id?: number | null;
    client_name: string;
    day_index: number;
    date: string;
    time: string;
    type: string;
    status: string;
    duration_minutes?: number | null;
  }>;
}

export const nutritionistMealTypes = [
  { value: "breakfast", label: "Sarapan" },
  { value: "snack_morning", label: "Snack Pagi" },
  { value: "lunch", label: "Makan Siang" },
  { value: "snack_afternoon", label: "Snack Sore" },
  { value: "dinner", label: "Makan Malam" },
] as const;

export const fallbackFoods: TkpiFoodItem[] = [
  { id: 1, name: "Nasi merah", category: "Karbohidrat", calories_per_100g: 111, protein_g: 2.6, carb_g: 23, fat_g: 0.9 },
  { id: 2, name: "Dada ayam tanpa kulit", category: "Protein hewani", calories_per_100g: 165, protein_g: 31, carb_g: 0, fat_g: 3.6 },
  { id: 3, name: "Tempe", category: "Protein nabati", calories_per_100g: 193, protein_g: 20.8, carb_g: 13.5, fat_g: 8.8 },
  { id: 4, name: "Brokoli", category: "Sayuran", calories_per_100g: 35, protein_g: 2.4, carb_g: 6.6, fat_g: 0.4 },
  { id: 5, name: "Oatmeal", category: "Sereal", calories_per_100g: 379, protein_g: 13.2, carb_g: 67.7, fat_g: 6.5 },
  { id: 6, name: "Yoghurt plain rendah lemak", category: "Susu", calories_per_100g: 63, protein_g: 5.3, carb_g: 7, fat_g: 1.6 },
];

export function getFallbackNutritionistDashboard(): NutritionistDashboardResponse {
  return {
    stats: {
      total_active_clients: 18,
      consultations_today: 5,
      clients_need_attention: 4,
      average_rating: 4.9,
      review_count: 27,
    },
    notifications: {
      meal_plan_pending: {
        count: 3,
        items: [
          { client_id: 1, name: "Alya Rahma", program: "Fat Loss 60 Hari", current_day: 4 },
          { client_id: 3, name: "Dimas Pratama", program: "PCOS Balance", current_day: 7 },
          { client_id: 5, name: "Nadia Putri", program: "Postpartum Reset", current_day: 2 },
        ],
      },
      unreplied_messages: {
        count: 2,
        items: [
          { client_id: 2, name: "Sari Melati", preview: "Kak, apakah snack sore boleh ditukar buah?", time: "09:12" },
          { client_id: 4, name: "Kevin Aditya", preview: "Berat saya 3 hari ini stagnan, perlu ubah kalori?", time: "10:35" },
        ],
      },
    },
    clients: [
      {
        id: 1,
        name: "Alya Rahma",
        avatar_url: "https://ui-avatars.com/api/?name=Alya+Rahma&background=e8f8f0&color=0d6e42",
        program: "Fat Loss 60 Hari",
        current_day: 12,
        program_duration_days: 60,
        current_weight: 71.8,
        weight_change: -3.2,
        status: "on-track",
        has_meal_plan_today: false,
        needs_attention_reason: null,
      },
      {
        id: 2,
        name: "Sari Melati",
        avatar_url: "https://ui-avatars.com/api/?name=Sari+Melati&background=e8f8f0&color=0d6e42",
        program: "Diabetes Friendly Plan",
        current_day: 23,
        program_duration_days: 90,
        current_weight: 83.5,
        weight_change: -1.1,
        status: "perlu perhatian",
        has_meal_plan_today: true,
        needs_attention_reason: "Berat badan stagnan dalam 10 hari terakhir dan food diary belum lengkap.",
      },
      {
        id: 3,
        name: "Dimas Pratama",
        avatar_url: "https://ui-avatars.com/api/?name=Dimas+Pratama&background=e8f8f0&color=0d6e42",
        program: "Muscle Gain Clean Bulk",
        current_day: 8,
        program_duration_days: 45,
        current_weight: 66.4,
        weight_change: 1.4,
        status: "on-track",
        has_meal_plan_today: false,
        needs_attention_reason: null,
      },
      {
        id: 4,
        name: "Nadia Putri",
        avatar_url: "https://ui-avatars.com/api/?name=Nadia+Putri&background=e8f8f0&color=0d6e42",
        program: "Postpartum Reset",
        current_day: 16,
        program_duration_days: 60,
        current_weight: 74.2,
        weight_change: -0.4,
        status: "perlu perhatian",
        has_meal_plan_today: true,
        needs_attention_reason: "Penurunan terlalu lambat, perlu review kualitas tidur dan kepatuhan meal plan.",
      },
    ],
  };
}

export function getFallbackClientDetail(clientId: number): NutritionistClientDetailResponse {
  const dashboard = getFallbackNutritionistDashboard();
  const selectedClient = dashboard.clients.find((client) => client.id === clientId) ?? dashboard.clients[0];
  const weights = [75, 74.8, 74.5, 74.1, 73.9, 73.5, 73.1, 72.9, 72.4, selectedClient.current_weight];

  return {
    client: {
      id: selectedClient.id,
      name: selectedClient.name,
      avatar_url: selectedClient.avatar_url,
      email: `${selectedClient.name.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
      age: 29,
      program: selectedClient.program,
      program_status: "active",
      current_day: selectedClient.current_day,
      program_duration_days: selectedClient.program_duration_days,
      medical_conditions: selectedClient.id === 2 ? ["Diabetes tipe 2", "Insulin resistance"] : ["Kolesterol borderline"],
      allergies: selectedClient.id === 3 ? ["Udang"] : ["Susu full cream"],
      dietary_preferences: selectedClient.id === 3 ? ["High protein"] : ["Less sugar", "Whole food"],
      target_type: selectedClient.weight_change <= 0 ? "lose_weight" : "maintain",
      target_weight_kg: selectedClient.weight_change <= 0 ? 68 : 68,
    },
    calculations: {
      bmi: 27.1,
      bmr: 1428,
      tdee: 2115,
      target_calories: 1700,
      macros: {
        protein_g: 110,
        carb_g: 170,
        fat_g: 56,
      },
    },
    progress: {
      labels: ["01 Mar", "04 Mar", "07 Mar", "10 Mar", "13 Mar", "16 Mar", "19 Mar", "22 Mar", "25 Mar", "27 Mar"],
      weights,
      current_weight: selectedClient.current_weight,
      initial_weight: 75,
      change_kg: roundNumber(selectedClient.current_weight - 75),
    },
    meal_plan: [
      {
        day_number: 1,
        total_calories: 1680,
        meals: [
          {
            id: 11,
            meal_type: "breakfast",
            meal_type_label: "Sarapan",
            menu_name: "Oatmeal, yoghurt, pisang",
            ingredients: [
              { food_id: 5, name: "Oatmeal", quantity_gram: 45, calories: 170.55, protein_g: 5.94, carb_g: 30.47, fat_g: 2.93 },
              { food_id: 6, name: "Yoghurt plain rendah lemak", quantity_gram: 120, calories: 75.6, protein_g: 6.36, carb_g: 8.4, fat_g: 1.92 },
            ],
            calories: 246.15,
            protein_g: 12.3,
            carb_g: 38.87,
            fat_g: 4.85,
            notes: "Sarapan 30 menit setelah bangun.",
          },
          {
            id: 12,
            meal_type: "lunch",
            meal_type_label: "Makan Siang",
            menu_name: "Nasi merah, ayam, brokoli",
            ingredients: [
              { food_id: 1, name: "Nasi merah", quantity_gram: 150, calories: 166.5, protein_g: 3.9, carb_g: 34.5, fat_g: 1.35 },
              { food_id: 2, name: "Dada ayam tanpa kulit", quantity_gram: 120, calories: 198, protein_g: 37.2, carb_g: 0, fat_g: 4.32 },
              { food_id: 4, name: "Brokoli", quantity_gram: 100, calories: 35, protein_g: 2.4, carb_g: 6.6, fat_g: 0.4 },
            ],
            calories: 399.5,
            protein_g: 43.5,
            carb_g: 41.1,
            fat_g: 6.07,
            notes: "Tambahkan sambal tanpa gula bila perlu.",
          },
        ],
      },
      {
        day_number: 2,
        total_calories: 1710,
        meals: [
          {
            id: 21,
            meal_type: "breakfast",
            meal_type_label: "Sarapan",
            menu_name: "Tempe panggang dan oatmeal",
            ingredients: [
              { food_id: 3, name: "Tempe", quantity_gram: 90, calories: 173.7, protein_g: 18.72, carb_g: 12.15, fat_g: 7.92 },
              { food_id: 5, name: "Oatmeal", quantity_gram: 35, calories: 132.65, protein_g: 4.62, carb_g: 23.7, fat_g: 2.28 },
            ],
            calories: 306.35,
            protein_g: 23.34,
            carb_g: 35.85,
            fat_g: 10.2,
            notes: null,
          },
        ],
      },
    ],
    food_diary: [
      {
        id: 101,
        date: "2026-03-27",
        meal_type: "breakfast",
        meal_type_label: "Sarapan",
        food_name: "Oatmeal + yoghurt",
        quantity_gram: 165,
        calories: 248,
        protein_g: 12.5,
        carb_g: 39,
        fat_g: 4.8,
      },
      {
        id: 102,
        date: "2026-03-27",
        meal_type: "lunch",
        meal_type_label: "Makan Siang",
        food_name: "Nasi merah + ayam + brokoli",
        quantity_gram: 370,
        calories: 402,
        protein_g: 43.8,
        carb_g: 41.2,
        fat_g: 6.1,
      },
      {
        id: 103,
        date: "2026-03-26",
        meal_type: "dinner",
        meal_type_label: "Makan Malam",
        food_name: "Salad tuna",
        quantity_gram: 280,
        calories: 330,
        protein_g: 29,
        carb_g: 18,
        fat_g: 15,
      },
    ],
    notes: [
      {
        title: "Review mingguan",
        content: "Kualitas tidur memengaruhi rasa lapar di malam hari. Fokus pada jam tidur lebih konsisten dan tambah asupan protein sarapan.",
      },
      {
        title: "Tindak lanjut",
        content: selectedClient.needs_attention_reason ?? "Pertahankan pola makan sekarang dan lanjutkan hidrasi 2,5 liter per hari.",
      },
    ],
    consultations: [
      {
        id: 1,
        type: "video_call",
        status: "scheduled",
        scheduled_at: "2026-03-29T09:00:00.000Z",
        duration_minutes: 30,
        notes: "Evaluasi hasil minggu kedua dan update target langkah harian.",
      },
      {
        id: 2,
        type: "chat",
        status: "completed",
        scheduled_at: "2026-03-23T12:30:00.000Z",
        duration_minutes: 15,
        notes: "Diskusi pengganti menu snack sore.",
      },
    ],
    review_summary: {
      average_rating: 4.8,
      review_count: 3,
      latest_review: {
        rating: 5,
        review: "Pendampingan sangat detail dan meal plan mudah diikuti setiap hari.",
        submitted_at: "2026-03-24T08:00:00.000Z",
      },
    },
  };
}

export function getFallbackTemplates(): MealPlanTemplateResponseItem[] {
  return [
    {
      id: 1,
      name: "Template Fat Loss 1700",
      day_number: 1,
      notes: "Tinggi protein dan serat, cocok untuk awal program.",
      meals: getFallbackClientDetail(1).meal_plan[0].meals,
      totals: {
        calories: 1680,
        protein_g: 118,
        carb_g: 165,
        fat_g: 54,
      },
      created_at: "2026-03-20T09:00:00.000Z",
    },
    {
      id: 2,
      name: "Template Diabetes Friendly",
      day_number: 2,
      notes: "Distribusi karbo dibagi rata di tiap waktu makan.",
      meals: getFallbackClientDetail(2).meal_plan[1].meals,
      totals: {
        calories: 1710,
        protein_g: 121,
        carb_g: 160,
        fat_g: 58,
      },
      created_at: "2026-03-21T15:30:00.000Z",
    },
  ];
}

export function getFallbackSchedule(): NutritionistScheduleResponse {
  return {
    week_start: "2026-03-23",
    week_end: "2026-03-29",
    availability: [
      { weekday: 0, availability: "active" },
      { weekday: 1, availability: "active" },
      { weekday: 2, availability: "slow" },
      { weekday: 3, availability: "active" },
      { weekday: 4, availability: "active" },
      { weekday: 5, availability: "slow" },
      { weekday: 6, availability: "off" },
    ],
    booked_slots: [
      { id: 1, client_id: 1, client_name: "Alya Rahma", day_index: 0, date: "2026-03-23", time: "09:00", type: "video_call", status: "confirmed", duration_minutes: 30 },
      { id: 2, client_id: 2, client_name: "Sari Melati", day_index: 1, date: "2026-03-24", time: "13:00", type: "chat", status: "scheduled", duration_minutes: 15 },
      { id: 3, client_id: 3, client_name: "Dimas Pratama", day_index: 3, date: "2026-03-26", time: "10:00", type: "chat", status: "scheduled", duration_minutes: 20 },
      { id: 4, client_id: 4, client_name: "Nadia Putri", day_index: 4, date: "2026-03-27", time: "15:00", type: "video_call", status: "confirmed", duration_minutes: 30 },
    ],
  };
}

function roundNumber(value: number) {
  return Math.round(value * 100) / 100;
}
