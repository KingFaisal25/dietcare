<?php

namespace App\Http\Controllers;

use App\Application\Services\MealPlanService;
use App\Models\MealPlanTemplate;
use Illuminate\Http\Request;

class NutritionistMealPlanController extends Controller
{
    use ApiResponse;

    public function __construct(
        private MealPlanService $mealPlanService
    ) {}

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

        try {
            $result = $this->mealPlanService->storeMealPlanForClient($request->user()->id, $validated);
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->success('Meal plan berhasil disimpan dan dikirim ke klien.', $result, 201);
    }

    public function templates(Request $request)
    {
        $templates = $this->mealPlanService->getTemplates($request->user()->id);

        return $this->success('Template meal plan berhasil diambil.', [
            'templates' => $templates->map(fn (MealPlanTemplate $template) => $this->transformTemplate($template))->values(),
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

        $template = $this->mealPlanService->storeTemplate($request->user()->id, $validated);

        return $this->success('Template meal plan berhasil disimpan.', [
            'template' => $this->transformTemplate($template),
        ], 201);
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
}

