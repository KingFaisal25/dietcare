<?php

namespace App\Http\Controllers;

use App\Models\ClientMessage;
use App\Models\FoodDatabase;
use App\Models\MealPlan;
use App\Models\MealPlanTemplate;
use App\Models\NutritionistProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NutritionistMealPlanController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'day_number' => 'required|integer|min:1|max:10',
            'special_note' => 'nullable|string',
            'meals' => 'required|array|min:1',
            'meals.*.meal_type' => 'required|in:breakfast,snack_morning,lunch,snack_afternoon,dinner',
            'meals.*.menu_name' => 'nullable|string|max:255',
            'meals.*.notes' => 'nullable|string',
            'meals.*.items' => 'required|array|min:1',
            'meals.*.items.*.food_id' => 'required|exists:food_database,id',
            'meals.*.items.*.quantity_gram' => 'required|numeric|min:1',
        ]);

        $program = NutritionistProgram::query()
            ->where('nutritionist_id', $request->user()->id)
            ->where('client_id', $validated['client_id'])
            ->where('status', 'active')
            ->latest('start_date')
            ->first();

        if (! $program) {
            return $this->error('Program aktif untuk klien tidak ditemukan.', 404);
        }

        $preparedMeals = $this->prepareMeals($validated['meals']);

        DB::transaction(function () use ($program, $validated, $preparedMeals) {
            MealPlan::query()
                ->where('nutritionist_program_id', $program->id)
                ->where('day_number', $validated['day_number'])
                ->delete();

            foreach ($preparedMeals as $index => $meal) {
                $noteSegments = [];

                if ($index === 0 && ! empty($validated['special_note'])) {
                    $noteSegments[] = $validated['special_note'];
                }

                if (! empty($meal['notes'])) {
                    $noteSegments[] = $meal['notes'];
                }

                MealPlan::create([
                    'nutritionist_program_id' => $program->id,
                    'day_number' => $validated['day_number'],
                    'meal_type' => $meal['meal_type'],
                    'menu_name' => $meal['menu_name'],
                    'ingredients' => $meal['ingredients'],
                    'calories' => $meal['calories'],
                    'protein_g' => $meal['protein'],
                    'carb_g' => $meal['carbs'],
                    'fat_g' => $meal['fat'],
                    'notes' => empty($noteSegments) ? null : implode("\n\n", $noteSegments),
                ]);
            }

            ClientMessage::create([
                'nutritionist_program_id' => $program->id,
                'sender_role' => 'nutritionist',
                'message' => 'Meal plan hari ' . $validated['day_number'] . ' telah diperbarui dan siap ditinjau klien.',
                'read_at' => null,
            ]);
        });

        return $this->success('Meal plan berhasil disimpan dan dikirim ke klien.', [
            'client_id' => (int) $validated['client_id'],
            'day_number' => (int) $validated['day_number'],
            'totals' => $this->sumPreparedMeals($preparedMeals),
            'notification_sent' => true,
        ], 201);
    }

    public function templates(Request $request)
    {
        $templates = MealPlanTemplate::query()
            ->where('nutritionist_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (MealPlanTemplate $template) => $this->transformTemplate($template))
            ->values();

        return $this->success('Template meal plan berhasil diambil.', [
            'templates' => $templates,
        ]);
    }

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'day_number' => 'nullable|integer|min:1|max:10',
            'notes' => 'nullable|string',
            'meals' => 'required|array|min:1',
            'meals.*.meal_type' => 'required|in:breakfast,snack_morning,lunch,snack_afternoon,dinner',
            'meals.*.menu_name' => 'nullable|string|max:255',
            'meals.*.notes' => 'nullable|string',
            'meals.*.items' => 'required|array|min:1',
            'meals.*.items.*.food_id' => 'required|exists:food_database,id',
            'meals.*.items.*.quantity_gram' => 'required|numeric|min:1',
        ]);

        $preparedMeals = $this->prepareMeals($validated['meals']);

        $template = MealPlanTemplate::create([
            'nutritionist_id' => $request->user()->id,
            'name' => $validated['name'],
            'day_number' => $validated['day_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'meals' => $preparedMeals,
            'totals' => $this->sumPreparedMeals($preparedMeals),
        ]);

        return $this->success('Template meal plan berhasil disimpan.', [
            'template' => $this->transformTemplate($template),
        ], 201);
    }

    private function prepareMeals(array $meals): array
    {
        $foodIds = collect($meals)
            ->flatMap(fn (array $meal) => collect($meal['items'] ?? [])->pluck('food_id'))
            ->unique()
            ->values();

        $foods = FoodDatabase::query()
            ->whereIn('id', $foodIds)
            ->get()
            ->keyBy('id');

        return collect($meals)
            ->map(function (array $meal) use ($foods) {
                $ingredients = collect($meal['items'])->map(function (array $item) use ($foods) {
                    $food = $foods->get($item['food_id']);
                    $quantity = (float) $item['quantity_gram'];
                    $multiplier = $quantity / 100;

                    return [
                        'food_id' => $food->id,
                        'name' => $food->name,
                        'quantity_gram' => round($quantity, 2),
                        'calories' => round((float) $food->calories_per_100g * $multiplier, 2),
                        'protein' => round((float) $food->protein_g * $multiplier, 2),
                        'carbs' => round((float) $food->carb_g * $multiplier, 2),
                        'fat' => round((float) $food->fat_g * $multiplier, 2),
                    ];
                })->values();

                return [
                    'meal_type' => $meal['meal_type'],
                    'menu_name' => $meal['menu_name'] ?: $ingredients->pluck('name')->implode(', '),
                    'ingredients' => $ingredients->all(),
                    'calories' => round((float) $ingredients->sum('calories'), 2),
                    'protein' => round((float) $ingredients->sum('protein'), 2),
                    'carbs' => round((float) $ingredients->sum('carbs'), 2),
                    'fat' => round((float) $ingredients->sum('fat'), 2),
                    'notes' => $meal['notes'] ?? null,
                ];
            })
            ->sortBy(fn (array $meal) => $this->mealOrderNumber($meal['meal_type']))
            ->values()
            ->all();
    }

    private function sumPreparedMeals(array $meals): array
    {
        return [
            'calories' => round((float) collect($meals)->sum('calories'), 2),
            'protein' => round((float) collect($meals)->sum('protein'), 2),
            'carbs' => round((float) collect($meals)->sum('carbs'), 2),
            'fat' => round((float) collect($meals)->sum('fat'), 2),
        ];
    }

    private function transformTemplate(MealPlanTemplate $template): array
    {
        return [
            'id' => $template->id,
            'name' => $template->name,
            'day_number' => $template->day_number,
            'notes' => $template->notes,
            'meals' => $template->meals ?? [],
            'totals' => $template->totals ?? [
                'calories' => 0,
                'protein' => 0,
                'carbs' => 0,
                'fat' => 0,
            ],
            'created_at' => optional($template->created_at)->toISOString(),
        ];
    }

    private function mealOrderNumber(string $mealType): int
    {
        return [
            'breakfast' => 1,
            'snack_morning' => 2,
            'lunch' => 3,
            'snack_afternoon' => 4,
            'dinner' => 5,
        ][$mealType] ?? 99;
    }
}
