<?php

namespace App\Http\Controllers;

use App\Models\FoodDatabase;
use Illuminate\Http\Request;

class FoodSearchController extends Controller
{
    use ApiResponse;

    public function search(Request $request)
    {
        $validated = $request->validate([
            'q' => 'nullable|string|max:100',
        ]);

        $query = trim($validated['q'] ?? '');

        if ($query === '') {
            return $this->success('Pencarian makanan berhasil.', []);
        }

        $escapedQuery = str_replace(['%', '_'], ['\%', '\_'], $query);

        $foods = FoodDatabase::query()
            ->where('name', 'ILIKE', '%' . $escapedQuery . '%')
            ->orWhere('category', 'ILIKE', '%' . $escapedQuery . '%')
            ->orderBy('name')
            ->limit(10)
            ->get([
                'id',
                'name',
                'category',
                'calories_per_100g',
                'protein_g',
                'carb_g',
                'fat_g',
                'fiber_g',
                'source',
            ]);

        $formattedFoods = $foods->map(function ($food) {
            return [
                'id' => $food->id,
                'name' => $food->name,
                'category' => $food->category,
                'calories' => (float) $food->calories_per_100g,
                'protein' => (float) $food->protein_g,
                'carbs' => (float) $food->carb_g,
                'fat' => (float) $food->fat_g,
                'fiber' => (float) $food->fiber_g,
                'source' => $food->source,
            ];
        });

        return $this->success('Pencarian makanan berhasil.', $formattedFoods);
    }
}
