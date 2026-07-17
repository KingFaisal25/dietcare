<?php

namespace App\Http\Controllers;

use App\Application\Services\FoodDiaryService;
use Illuminate\Http\Request;

class ClientNutritionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private FoodDiaryService $foodDiaryService
    ) {}

    public function mealPlan(Request $request)
    {
        $validated = $request->validate([
            'day' => 'nullable|integer|min:1|max:10',
        ]);

        $user = $request->user();
        $day = $validated['day'] ?? 1;

        $result = $this->foodDiaryService->getMealPlan($user->id, $day);

        return $this->success('Meal plan berhasil diambil.', $result);
    }

    public function foodDiary(Request $request)
    {
        $validated = $request->validate([
            'eaten_at' => 'nullable|date',
        ]);

        $user = $request->user();
        $result = $this->foodDiaryService->getFoodDiary(
            $user->id,
            $validated['eaten_at'] ?? null,
            $user->clientProfile
        );

        return $this->success('Food diary berhasil diambil.', $result);
    }

    public function storeFoodDiary(Request $request)
    {
        $validated = $request->validate([
            'food_id' => 'required|integer',
            'meal_type' => 'required|in:breakfast,snack_morning,lunch,snack_afternoon,dinner',
            'quantity_gram' => 'required|numeric|min:1',
            'eaten_at' => 'nullable|date',
        ]);

        $result = $this->foodDiaryService->storeFoodDiary($request->user()->id, $validated);

        if (!$result['success']) {
            return $this->error($result['message'], 404);
        }

        return $this->success('Food diary berhasil ditambahkan.', [
            'entry' => $result['entry'],
        ], 201);
    }

    public function deleteFoodDiary(Request $request, int $id)
    {
        $deleted = $this->foodDiaryService->deleteFoodDiary($request->user()->id, $id);

        if (!$deleted) {
            return $this->error('Food diary tidak ditemukan atau tidak valid.', 404);
        }

        return $this->success('Food diary berhasil dihapus.', [
            'id' => $id,
        ]);
    }

    public function diarySummary(Request $request)
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:30',
        ]);

        $user = $request->user();
        $days = $validated['days'] ?? 7;

        $result = $this->foodDiaryService->getDiarySummary($user->id, $days, $user->clientProfile);

        return $this->success('Ringkasan food diary berhasil diambil.', $result);
    }
}

