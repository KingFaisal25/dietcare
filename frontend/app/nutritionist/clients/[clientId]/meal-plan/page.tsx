"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardPlus,
  Copy,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import api from "@/lib/api";
import {
  fallbackFoods,
  getFallbackClientDetail,
  getFallbackTemplates,
  nutritionistMealTypes,
  type MealPlanTemplateResponseItem,
  type NutritionistClientDetailResponse,
  type TkpiFoodItem,
} from "@/lib/nutritionistData";

type MealTypeValue = (typeof nutritionistMealTypes)[number]["value"];

type DraftItem = TkpiFoodItem & {
  quantity_gram: number;
};

type DraftMeal = {
  meal_type: MealTypeValue;
  menu_name: string;
  notes: string;
  items: DraftItem[];
};

type DayDraft = Record<MealTypeValue, DraftMeal>;

export default function NutritionistMealPlanPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const resolvedParams = React.use(params);
  const clientId = Number(resolvedParams.clientId);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState<MealTypeValue>("breakfast");
  const [searchTerm, setSearchTerm] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
  const [draftsByDay, setDraftsByDay] = useState<Record<number, DayDraft>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const clientQuery = useQuery<NutritionistClientDetailResponse>({
    queryKey: ["nutritionist-client-meal-plan-client", clientId],
    queryFn: async () => {
      try {
        const response = await api.get(`/nutritionist/clients/${clientId}`);
        return response.data.data as NutritionistClientDetailResponse;
      } catch {
        return getFallbackClientDetail(clientId);
      }
    },
  });

  const templatesQuery = useQuery<MealPlanTemplateResponseItem[]>({
    queryKey: ["nutritionist-meal-plan-templates"],
    queryFn: async () => {
      try {
        const response = await api.get("/nutritionist/meal-plan/templates");
        return (response.data.data.templates as MealPlanTemplateResponseItem[]) ?? [];
      } catch {
        return getFallbackTemplates();
      }
    },
  });

  const foodsQuery = useQuery<TkpiFoodItem[]>({
    queryKey: ["nutritionist-food-search", searchTerm],
    enabled: searchTerm.trim().length >= 2,
    queryFn: async () => {
      try {
        const response = await api.get(`/foods/search?q=${encodeURIComponent(searchTerm)}`);
        return response.data.data as TkpiFoodItem[];
      } catch {
        const query = searchTerm.toLowerCase();
        return fallbackFoods.filter(
          (food) =>
            food.name.toLowerCase().includes(query) ||
            (food.category ?? "").toLowerCase().includes(query)
        );
      }
    },
  });

  const detail = useMemo(
    () => clientQuery.data ?? getFallbackClientDetail(clientId),
    [clientId, clientQuery.data]
  );
  const templates = useMemo(
    () => templatesQuery.data ?? getFallbackTemplates(),
    [templatesQuery.data]
  );

  useEffect(() => {
    setDraftsByDay((current) => {
      if (current[selectedDay]) {
        return current;
      }

      return {
        ...current,
        [selectedDay]: buildDraftFromDayPlan(detail.meal_plan.find((plan) => plan.day_number === selectedDay)),
      };
    });
  }, [detail.meal_plan, selectedDay]);

  const activeDraft = draftsByDay[selectedDay] ?? createEmptyDraft();
  const activeTemplate = templates.find((template) => template.id === selectedTemplateId);
  const filteredFoods =
    searchTerm.trim().length >= 2 ? foodsQuery.data ?? [] : fallbackFoods.slice(0, 4);

  const totals = useMemo(() => calculateDayTotals(activeDraft), [activeDraft]);
  const calorieTarget = detail.calculations.target_calories || 1;
  const calorieProgress = Math.min((totals.calories / calorieTarget) * 100, 100);
  const calorieState =
    totals.calories <= calorieTarget * 0.95
      ? "hijau"
      : totals.calories <= calorieTarget * 1.05
        ? "kuning"
        : "merah";

  const saveMutation = useMutation({
    mutationFn: async () => {
      const meals = nutritionistMealTypes
        .map(({ value }) => activeDraft[value])
        .filter((meal) => meal.items.length > 0)
        .map((meal) => ({
          meal_type: meal.meal_type,
          menu_name: meal.menu_name,
          notes: meal.notes || undefined,
          items: meal.items.map((item) => ({
            food_id: item.id,
            quantity_gram: item.quantity_gram,
          })),
        }));

      if (meals.length === 0) {
        throw new Error("Tambahkan minimal satu item makanan sebelum menyimpan.");
      }

      try {
        await api.post("/nutritionist/meal-plan", {
          client_id: clientId,
          day_number: selectedDay,
          special_note: specialNote || undefined,
          meals,
        });

        return "Meal plan berhasil disimpan dan dikirim ke klien.";
      } catch {
        return "Meal plan tersimpan di draft lokal. Hubungkan backend untuk sinkronisasi real-time.";
      }
    },
    onSuccess: (message) => setFeedback(message),
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Gagal menyimpan meal plan."),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href={`/nutritionist/clients/${clientId}`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke detail klien
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Meal Plan Builder</h1>
          <p className="mt-2 text-sm text-gray-500">
            Susun meal plan harian klien, hitung kalori otomatis dari database TKPI, lalu kirim langsung.
          </p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          isLoading={saveMutation.isPending}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <ClipboardPlus className="h-4 w-4" />
          Simpan & Kirim ke Klien
        </Button>
      </div>

      {feedback ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      ) : null}

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <Card className="border-gray-100">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <Image
              src={detail.client.avatar_url}
              alt={detail.client.name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-3xl object-cover ring-4 ring-emerald-50"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Klien aktif</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">{detail.client.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{detail.client.program}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SummaryChip label="Hari program" value={`${detail.client.current_day}/${detail.client.program_duration_days}`} />
                <SummaryChip label="Berat sekarang" value={`${detail.progress.current_weight.toFixed(1)} kg`} />
                <SummaryChip label="Target kalori" value={`${detail.calculations.target_calories.toFixed(0)} kkal`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="text-xl">Total Hari {selectedDay}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Kalori tersusun</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totals.calories.toFixed(0)} kkal</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getCalorieStateClass(calorieState)}`}>
                {calorieState}
              </span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${getCalorieBarClass(calorieState)}`}
                style={{ width: `${calorieProgress}%` }}
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SummaryChip label="Target" value={`${detail.calculations.target_calories.toFixed(0)} kkal`} />
              <SummaryChip label="Selisih" value={`${(totals.calories - detail.calculations.target_calories).toFixed(0)} kkal`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,1.35fr]">
        <div className="space-y-6">
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl">Pengaturan Hari & Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pilih hari">
                  <select
                    value={selectedDay}
                    onChange={(event) => setSelectedDay(Number(event.target.value))}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-400"
                  >
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((day) => (
                      <option key={day} value={day}>
                        Hari {day}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Waktu makan aktif">
                  <select
                    value={selectedMealType}
                    onChange={(event) => setSelectedMealType(event.target.value as MealTypeValue)}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-400"
                  >
                    {nutritionistMealTypes.map((mealType) => (
                      <option key={mealType.value} value={mealType.value}>
                        {mealType.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
                <Field label="Pakai template">
                  <select
                    value={selectedTemplateId}
                    onChange={(event) =>
                      setSelectedTemplateId(event.target.value ? Number(event.target.value) : "")
                    }
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Pilih template meal plan</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!activeTemplate}
                    onClick={() => {
                      if (!activeTemplate) {
                        return;
                      }

                      setDraftsByDay((current) => ({
                        ...current,
                        [selectedDay]: buildDraftFromTemplate(activeTemplate),
                      }));
                      setSpecialNote(activeTemplate.notes ?? "");
                      setFeedback(`Template "${activeTemplate.name}" diterapkan ke hari ${selectedDay}.`);
                    }}
                    className="w-full gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Pakai Template
                  </Button>
                </div>
              </div>

              <Field label="Catatan khusus">
                <textarea
                  value={specialNote}
                  onChange={(event) => setSpecialNote(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
                  placeholder="Contoh: kurangi makanan pedas, jadwalkan snack sebelum olahraga, atau fokus tinggi protein."
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl">Cari Makanan TKPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-gray-200 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400"
                  placeholder="Cari nasi, ayam, tempe, brokoli, dan lainnya"
                />
              </div>

              <div className="mt-4 space-y-3">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => {
                      upsertFoodInMeal(selectedDay, selectedMealType, food, setDraftsByDay);
                      setFeedback(`${food.name} ditambahkan ke ${labelFromMealType(selectedMealType)}.`);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{food.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{food.category ?? "Makanan umum"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-700">{food.calories_per_100g} kkal / 100g</p>
                      <p className="mt-1 text-xs text-gray-500">
                        P {food.protein_g} • K {food.carb_g} • L {food.fat_g}
                      </p>
                    </div>
                  </button>
                ))}

                {searchTerm.trim().length >= 2 && filteredFoods.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
                    Tidak ada makanan yang cocok dengan pencarian.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {nutritionistMealTypes.map((mealType) => {
            const meal = activeDraft[mealType.value];
            const mealTotals = calculateMealTotals(meal.items);

            return (
              <Card key={mealType.value} className="border-gray-100">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle className="text-lg">{mealType.label}</CardTitle>
                      <p className="mt-1 text-sm text-gray-500">
                        {meal.items.length} item • {mealTotals.calories.toFixed(0)} kkal
                      </p>
                    </div>
                    <input
                      value={meal.menu_name}
                      onChange={(event) =>
                        updateMealField(selectedDay, mealType.value, "menu_name", event.target.value, setDraftsByDay)
                      }
                      className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-400 lg:max-w-xs"
                      placeholder="Nama menu"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {meal.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
                      Belum ada item. Cari makanan di panel kiri untuk menambahkannya ke slot ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meal.items.map((item) => {
                        const itemTotals = calculateItemTotals(item);

                        return (
                          <div
                            key={`${mealType.value}-${item.id}`}
                            className="rounded-3xl border border-gray-100 bg-gray-50 p-4"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                <p className="mt-1 text-sm text-gray-500">{item.category ?? "Makanan umum"}</p>
                              </div>
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity_gram}
                                  onChange={(event) =>
                                    updateItemQuantity(
                                      selectedDay,
                                      mealType.value,
                                      item.id,
                                      Number(event.target.value),
                                      setDraftsByDay
                                    )
                                  }
                                  className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-400 sm:w-28"
                                />
                                <span className="text-sm text-gray-500">gram</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItemFromMeal(selectedDay, mealType.value, item.id, setDraftsByDay)
                                  }
                                  className="inline-flex items-center justify-center rounded-2xl bg-red-50 p-3 text-red-600 transition hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-4">
                              <NutrientBox label="Kalori" value={`${itemTotals.calories.toFixed(0)} kkal`} />
                              <NutrientBox label="Protein" value={`${itemTotals.protein_g.toFixed(1)} g`} />
                              <NutrientBox label="Karbo" value={`${itemTotals.carb_g.toFixed(1)} g`} />
                              <NutrientBox label="Lemak" value={`${itemTotals.fat_g.toFixed(1)} g`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Field label="Catatan meal">
                    <textarea
                      value={meal.notes}
                      onChange={(event) =>
                        updateMealField(selectedDay, mealType.value, "notes", event.target.value, setDraftsByDay)
                      }
                      rows={3}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
                      placeholder={`Catatan untuk ${mealType.label.toLowerCase()}`}
                    />
                  </Field>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-900">{label}</span>
      {children}
    </label>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function NutrientBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-base font-bold text-gray-900">{value}</p>
    </div>
  );
}

function createEmptyDraft(): DayDraft {
  return nutritionistMealTypes.reduce((draft, mealType) => {
    draft[mealType.value] = {
      meal_type: mealType.value,
      menu_name: "",
      notes: "",
      items: [],
    };
    return draft;
  }, {} as DayDraft);
}

function buildDraftFromDayPlan(
  dayPlan: NutritionistClientDetailResponse["meal_plan"][number] | undefined
): DayDraft {
  const draft = createEmptyDraft();

  if (!dayPlan) {
    return draft;
  }

  dayPlan.meals.forEach((meal) => {
    draft[meal.meal_type as MealTypeValue] = {
      meal_type: meal.meal_type as MealTypeValue,
      menu_name: meal.menu_name,
      notes: meal.notes ?? "",
      items: meal.ingredients.map((ingredient) => ({
        id: ingredient.food_id ?? Date.now(),
        name: ingredient.name,
        category: null,
        calories_per_100g: derivePer100(ingredient.calories ?? meal.calories, ingredient.quantity_gram),
        protein_g: derivePer100(ingredient.protein_g ?? meal.protein_g, ingredient.quantity_gram),
        carb_g: derivePer100(ingredient.carb_g ?? meal.carb_g, ingredient.quantity_gram),
        fat_g: derivePer100(ingredient.fat_g ?? meal.fat_g, ingredient.quantity_gram),
        quantity_gram: ingredient.quantity_gram,
      })),
    };
  });

  return draft;
}

function buildDraftFromTemplate(template: MealPlanTemplateResponseItem): DayDraft {
  const draft = createEmptyDraft();

  template.meals.forEach((meal) => {
    draft[meal.meal_type as MealTypeValue] = {
      meal_type: meal.meal_type as MealTypeValue,
      menu_name: meal.menu_name,
      notes: meal.notes ?? "",
      items: meal.ingredients.map((ingredient) => ({
        id: ingredient.food_id ?? Date.now(),
        name: ingredient.name,
        category: null,
        calories_per_100g: derivePer100(ingredient.calories ?? meal.calories, ingredient.quantity_gram),
        protein_g: derivePer100(ingredient.protein_g ?? meal.protein_g, ingredient.quantity_gram),
        carb_g: derivePer100(ingredient.carb_g ?? meal.carb_g, ingredient.quantity_gram),
        fat_g: derivePer100(ingredient.fat_g ?? meal.fat_g, ingredient.quantity_gram),
        quantity_gram: ingredient.quantity_gram,
      })),
    };
  });

  return draft;
}

function upsertFoodInMeal(
  day: number,
  mealType: MealTypeValue,
  food: TkpiFoodItem,
  setDraftsByDay: Dispatch<SetStateAction<Record<number, DayDraft>>>
) {
  setDraftsByDay((current) => {
    const currentDayDraft = current[day] ?? createEmptyDraft();
    const meal = currentDayDraft[mealType];
    const existing = meal.items.find((item) => item.id === food.id);
    const nextItems = existing
      ? meal.items.map((item) =>
          item.id === food.id ? { ...item, quantity_gram: item.quantity_gram + 50 } : item
        )
      : [...meal.items, { ...food, quantity_gram: 100 }];

    return {
      ...current,
      [day]: {
        ...currentDayDraft,
        [mealType]: {
          ...meal,
          menu_name: meal.menu_name || nextItems.map((item) => item.name).join(", "),
          items: nextItems,
        },
      },
    };
  });
}

function updateItemQuantity(
  day: number,
  mealType: MealTypeValue,
  itemId: number,
  quantity: number,
  setDraftsByDay: Dispatch<SetStateAction<Record<number, DayDraft>>>
) {
  setDraftsByDay((current) => {
    const currentDayDraft = current[day] ?? createEmptyDraft();
    const meal = currentDayDraft[mealType];

    return {
      ...current,
      [day]: {
        ...currentDayDraft,
        [mealType]: {
          ...meal,
          items: meal.items.map((item) =>
            item.id === itemId ? { ...item, quantity_gram: Math.max(1, quantity || 1) } : item
          ),
        },
      },
    };
  });
}

function removeItemFromMeal(
  day: number,
  mealType: MealTypeValue,
  itemId: number,
  setDraftsByDay: Dispatch<SetStateAction<Record<number, DayDraft>>>
) {
  setDraftsByDay((current) => {
    const currentDayDraft = current[day] ?? createEmptyDraft();
    const meal = currentDayDraft[mealType];
    const nextItems = meal.items.filter((item) => item.id !== itemId);

    return {
      ...current,
      [day]: {
        ...currentDayDraft,
        [mealType]: {
          ...meal,
          items: nextItems,
          menu_name: nextItems.length > 0 ? meal.menu_name : "",
        },
      },
    };
  });
}

function updateMealField(
  day: number,
  mealType: MealTypeValue,
  field: "menu_name" | "notes",
  value: string,
  setDraftsByDay: Dispatch<SetStateAction<Record<number, DayDraft>>>
) {
  setDraftsByDay((current) => {
    const currentDayDraft = current[day] ?? createEmptyDraft();
    const meal = currentDayDraft[mealType];

    return {
      ...current,
      [day]: {
        ...currentDayDraft,
        [mealType]: {
          ...meal,
          [field]: value,
        },
      },
    };
  });
}

function calculateItemTotals(item: DraftItem) {
  const multiplier = item.quantity_gram / 100;

  return {
    calories: item.calories_per_100g * multiplier,
    protein_g: item.protein_g * multiplier,
    carb_g: item.carb_g * multiplier,
    fat_g: item.fat_g * multiplier,
  };
}

function calculateMealTotals(items: DraftItem[]) {
  return items.reduce(
    (totals, item) => {
      const current = calculateItemTotals(item);

      return {
        calories: totals.calories + current.calories,
        protein_g: totals.protein_g + current.protein_g,
        carb_g: totals.carb_g + current.carb_g,
        fat_g: totals.fat_g + current.fat_g,
      };
    },
    {
      calories: 0,
      protein_g: 0,
      carb_g: 0,
      fat_g: 0,
    }
  );
}

function calculateDayTotals(draft: DayDraft) {
  return Object.values(draft).reduce(
    (totals, meal) => {
      const mealTotals = calculateMealTotals(meal.items);

      return {
        calories: totals.calories + mealTotals.calories,
        protein_g: totals.protein_g + mealTotals.protein_g,
        carb_g: totals.carb_g + mealTotals.carb_g,
        fat_g: totals.fat_g + mealTotals.fat_g,
      };
    },
    {
      calories: 0,
      protein_g: 0,
      carb_g: 0,
      fat_g: 0,
    }
  );
}

function derivePer100(value: number, quantity: number) {
  if (!quantity) {
    return 0;
  }

  return Number(((value / quantity) * 100).toFixed(2));
}

function labelFromMealType(mealType: MealTypeValue) {
  return nutritionistMealTypes.find((item) => item.value === mealType)?.label ?? mealType;
}

function getCalorieStateClass(state: "hijau" | "kuning" | "merah") {
  if (state === "hijau") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (state === "kuning") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
}

function getCalorieBarClass(state: "hijau" | "kuning" | "merah") {
  if (state === "hijau") {
    return "bg-emerald-500";
  }

  if (state === "kuning") {
    return "bg-amber-500";
  }

  return "bg-red-500";
}
