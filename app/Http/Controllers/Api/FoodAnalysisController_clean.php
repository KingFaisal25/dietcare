<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodAnalysis;
use App\Jobs\AnalyzeFoodImageJob;
use App\Services\AI\Providers\OpenRouterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FoodAnalysisController extends Controller
{
    public function analyze(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            "food_image" => "required|image|mimes:jpeg,png,jpg|max:2048",
        ]);

        $filename = "food-analyses/" . uniqid() . "." . $request->file("food_image")->getClientOriginalExtension();
        $request->file("food_image")->storeAs("public", $filename);

        $analysis = FoodAnalysis::create([
            "user_id" => $user->id,
            "image_path" => $filename,
            "status" => "processing",
        ]);

        AnalyzeFoodImageJob::dispatch($analysis);

        return response()->json([
            "message" => "Analisis gambar sedang diproses",
            "data" => ["analysis_id" => $analysis->id],
        ]);
    }

    public function debugAI(Request $request)
    {
        // Debug endpoint untuk AI configuration
        $ai = new OpenRouterService();
        
        $reflection = new ReflectionClass($ai);
        $property = $reflection->getProperty("defaultModel");
        $property->setAccessible(true);
        $defaultModel = $property->getValue($ai);
        
        return response()->json([
            "config" => config("services.openrouter"),
            "env_model" => env("OPENROUTER_MODEL"),
            "config_model" => config("services.openrouter.model"),
            "default_model" => $defaultModel,
            "success" => true,
            "message" => "Debug endpoint accessible"
        ]);
    }

    public function analyzePhoto(Request $request)
    {
        $request->validate([
            "food_image" => "required|image|mimes:jpeg,png,jpg,webp|max:4096",
        ]);

        try {
            $file = $request->file("food_image");
            $base64Image = base64_encode(file_get_contents($file->getRealPath()));
            $mimeType = $file->getMimeType();

            $ai = new OpenRouterService();

            $systemPrompt = <<<PROMPT
You are a professional nutritionist AI. Analyze the food in this image and return a JSON response with the following structure:
{
  "food_items": [
    {
      "name": "Food name in Indonesian",
      "portion": "estimated portion (e.g. 1 porsi, 200g)",
      "calories": <number>,
      "protein": <number in grams>,
      "carbs": <number in grams>,
      "fat": <number in grams>
    }
  ],
  "total_nutrition": {
    "calories": <total number>,
    "protein": <total number>,
    "carbs": <total number>,
    "fat": <total number>
  },
  "suggestions": "Brief nutritional advice in Indonesian (1-2 sentences)"
}
Only return valid JSON, no markdown, no explanation outside the JSON.
PROMPT;

            $result = $ai->analyzeImage($systemPrompt, $base64Image, ['mime_type' => $mimeType]);
            $content = $result['content'];

            // Strip markdown code fences if present
            $content = preg_replace('/^```(?:json)?\s*/i', '', trim($content));
            $content = preg_replace('/\s*```$/', '', $content);

            $parsed = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE || empty($parsed['food_items'])) {
                return response()->json([
                    "status" => "failed",
                    "message" => "Gagal membaca hasil analisis AI. Coba dengan foto yang lebih jelas.",
                    "debug" => [
                        "raw_content" => $content,
                        "json_error" => json_last_error_msg(),
                        "parsed" => $parsed
                    ]
                ], 422);
            }

            return response()->json([
                "status" => "completed",
                "data" => [
                    "food_items" => $parsed["food_items"],
                    "total_nutrition" => $parsed["total_nutrition"],
                    "suggestions" => $parsed["suggestions"] ?? "",
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('FoodPhotoAnalysis public error: ' . $e->getMessage());
            return response()->json([
                "status" => "failed",
                "message" => "Terjadi kesalahan saat menganalisis gambar. Silakan coba lagi.",
                "detail" => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function getResult(Request $request, $analysisId)
    {
        $user = Auth::user();

        $analysis = FoodAnalysis::where("id", $analysisId)
            ->where("user_id", $user->id)
            ->firstOrFail();

        return response()->json([
            "data" => [
                "analysis" => [
                    "id" => $analysis->id,
                    "image_url" => asset("storage/" . $analysis->image_path),
                    "status" => $analysis->status,
                    "created_at" => $analysis->created_at,
                    "food_items" => $analysis->food_items ?: [],
                    "total_nutrition" => $analysis->total_nutrition ?: [],
                    "suggestions" => $analysis->suggestions ?: "",
                ],
            ],
        ]);
    }

    public function getHistory(Request $request)
    {
        $user = Auth::user();

        $analyses = FoodAnalysis::where("user_id", $user->id)
            ->orderBy("created_at", "desc")
            ->take(10)
            ->get();

        return response()->json([
            "analyses" => $analyses->map(function ($analysis) {
                return [
                    "id" => $analysis->id,
                    "image_url" => asset("storage/" . $analysis->image_path),
                    "status" => $analysis->status,
                    "created_at" => $analysis->created_at,
                    "total_calories" => $analysis->total_nutrition["calories"] ?? 0,
                ];
            }),
        ]);
    }
}
