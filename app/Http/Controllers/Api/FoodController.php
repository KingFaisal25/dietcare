<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FoodController extends Controller
{
    /**
     * Search foods with filters and pagination.
     */
    public function search(Request $request)
    {
        $query = $request->get('q');
        $category = $request->get('category');
        $perPage = $request->get('per_page', 20);

        $cacheKey = "food_search_" . md5($query . $category . $request->get('page', 1));

        return Cache::remember($cacheKey, 300, function () use ($query, $category, $perPage) {
            $foods = Food::query()
                ->where('is_active', true)
                ->when($query, function ($q) use ($query) {
                    $escaped = str_replace(['%', '_'], ['\%', '\_'], $query);
                    $q->where(function ($inner) use ($escaped) {
                        $inner->where('name_id', 'LIKE', "%{$escaped}%")
                              ->orWhere('name_en', 'LIKE', "%{$escaped}%")
                              ->orWhere('brand', 'LIKE', "%{$escaped}%");
                    })
                    ->orderByRaw("CASE 
                        WHEN name_id = ? THEN 1 
                        WHEN name_id LIKE ? THEN 2 
                        ELSE 3 END", [$query, "{$escaped}%"]);
                })
                ->when($category, function ($q) use ($category) {
                    $q->where('category', $category);
                })
                ->orderBy('view_count', 'desc')
                ->paginate($perPage);

            // Transform data to include calculation per serving
            $foods->getCollection()->transform(function ($food) {
                $multiplier = $food->serving_size / 100;
                return [
                    'id' => $food->id,
                    'name' => $food->name_id,
                    'name_en' => $food->name_en,
                    'category' => $food->category,
                    'brand' => $food->brand,
                    'serving' => [
                        'size' => $food->serving_size,
                        'unit' => $food->serving_unit,
                        'description' => $food->serving_description,
                    ],
                    'nutrients_per_serving' => [
                        'calories' => round($food->calories_per_100g * $multiplier, 1),
                        'protein' => round($food->protein_per_100g * $multiplier, 1),
                        'carbs' => round($food->carbs_per_100g * $multiplier, 1),
                        'fat' => round($food->fat_per_100g * $multiplier, 1),
                        'fiber' => round($food->fiber_per_100g * $multiplier, 1),
                    ],
                    'image_url' => $food->image_url,
                    'is_verified' => $food->is_verified,
                ];
            });

            return response()->json($foods);
        });
    }

    /**
     * Find food by barcode.
     */
    public function findByBarcode($barcode)
    {
        $food = Food::where('barcode', $barcode)->first();

        if ($food) {
            $food->increment('view_count');
            return response()->json($this->formatFood($food));
        }

        // If not in DB, check Open Food Facts API
        try {
            $response = Http::get("https://world.openfoodfacts.org/api/v2/product/{$barcode}");
            
            if ($response->successful() && isset($response['product'])) {
                $product = $response['product'];
                
                // Parse and save to DB
                $newFood = Food::create([
                    'name_id' => $product['product_name'] ?? 'Unknown Product',
                    'name_en' => $product['product_name_en'] ?? null,
                    'category' => 'makanan_cepat_saji', // Default category for barcode
                    'brand' => $product['brands'] ?? null,
                    'serving_size' => 100, // Default to 100g
                    'serving_unit' => 'gram',
                    'calories_per_100g' => $product['nutriments']['energy-kcal_100g'] ?? 0,
                    'protein_per_100g' => $product['nutriments']['proteins_100g'] ?? 0,
                    'carbs_per_100g' => $product['nutriments']['carbohydrates_100g'] ?? 0,
                    'fat_per_100g' => $product['nutriments']['fat_100g'] ?? 0,
                    'fiber_per_100g' => $product['nutriments']['fiber_100g'] ?? 0,
                    'barcode' => $barcode,
                    'source' => 'usda',
                    'image_url' => $product['image_url'] ?? null,
                    'is_verified' => false,
                ]);

                return response()->json($this->formatFood($newFood));
            }
        } catch (\Exception $e) {
            Log::error("Barcode search failed: " . $e->getMessage());
        }

        return response()->json(['message' => 'Product not found'], 404);
    }

    /**
     * Suggest new food by client.
     */
    public function suggest(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'calories' => 'required|numeric',
            'protein' => 'required|numeric',
            'carbs' => 'required|numeric',
            'fat' => 'required|numeric',
            'serving_size' => 'required|numeric',
        ]);

        $food = Food::create([
            'name_id' => $validated['name'],
            'calories_per_100g' => ($validated['calories'] / $validated['serving_size']) * 100,
            'protein_per_100g' => ($validated['protein'] / $validated['serving_size']) * 100,
            'carbs_per_100g' => ($validated['carbs'] / $validated['serving_size']) * 100,
            'fat_per_100g' => ($validated['fat'] / $validated['serving_size']) * 100,
            'serving_size' => $validated['serving_size'],
            'serving_unit' => 'gram',
            'source' => 'manual',
            'is_verified' => false,
            'is_active' => false, // Pending review
        ]);

        return response()->json(['message' => 'Suggestion submitted for review', 'food' => $food], 201);
    }

    private function formatFood(Food $food)
    {
        $multiplier = $food->serving_size / 100;
        return [
            'id' => $food->id,
            'name' => $food->name_id,
            'calories' => round($food->calories_per_100g * $multiplier, 1),
            'protein' => round($food->protein_per_100g * $multiplier, 1),
            'carbs' => round($food->carbs_per_100g * $multiplier, 1),
            'fat' => round($food->fat_per_100g * $multiplier, 1),
            'serving_size' => $food->serving_size,
            'serving_unit' => $food->serving_unit,
        ];
    }
}
