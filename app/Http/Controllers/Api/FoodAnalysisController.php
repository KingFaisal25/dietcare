<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodAnalysis;
use App\Models\AiUsageLog;
use App\Services\AI\AIManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Exception;

class FoodAnalysisController extends Controller
{
    protected $ai;

    public function __construct(AIManager $aiManager)
    {
        $this->ai = $aiManager->driver();
    }

    public function analyzePhoto(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,webp,heic|max:5120', // 5MB
            'meal_type' => 'required|in:breakfast,lunch,dinner,snack',
        ]);

        try {
            $user = Auth::user();
            $imageFile = $request->file('image');
            
            // 1. Process Image with Intervention Image
            $manager = new ImageManager(new Driver());
            $image = $manager->read($imageFile);
            
            // Resize to max 1024px while maintaining aspect ratio
            $image->scale(width: 1024);
            
            // Save to storage
            $filename = 'food_analysis/' . uniqid() . '.webp';
            $encodedImage = $image->toWebp(80);
            Storage::disk('public')->put($filename, $encodedImage);
            $imageUrl = Storage::disk('public')->url($filename);

            // 2. Convert to Base64 for OpenAI
            $base64Image = base64_encode($encodedImage);

            // 3. Call AI Vision
            $systemPrompt = "Kamu adalah ahli gizi Indonesia. Analisis makanan dalam foto ini.
            Return JSON saja tanpa teks lain:
            {
              \"food_items\": [
                {
                  \"name_id\": \"nama dalam bahasa Indonesia\",
                  \"name_en\": \"English name\",
                  \"portion\": \"1 piring (200g)\",
                  \"calories\": 350,
                  \"protein_g\": 15,
                  \"carbs_g\": 45,
                  \"fat_g\": 12,
                  \"fiber_g\": 3,
                  \"sugar_g\": 5,
                  \"confidence\": 0.85
                }
              ],
              \"total_calories\": 350,
              \"total_protein\": 15,
              \"total_carbs\": 45,
              \"total_fat\": 12,
              \"notes\": \"Catatan tambahan dari AI\",
              \"is_healthy\": true,
              \"health_score\": 7,
              \"suggestions\": [\"Tambah sayuran\", \"Kurangi nasi\"]
            }";

            $response = $this->ai->analyzeImage($systemPrompt, $base64Image, [
                'response_format' => ['type' => 'json_object'],
            ]);

            $result = json_decode($response['content'], true);

            // 4. Save to Database
            $analysis = FoodAnalysis::create([
                'user_id' => $user->id,
                'image_path' => $filename,
                'image_url' => $imageUrl,
                'ai_result' => $result,
                'total_calories' => $result['total_calories'],
                'total_protein' => $result['total_protein'],
                'total_carbs' => $result['total_carbs'],
                'total_fat' => $result['total_fat'],
                'confidence_avg' => collect($result['food_items'])->avg('confidence'),
                'meal_type' => $request->meal_type,
                'eaten_at' => now(),
            ]);

            // 5. Log Usage
            AiUsageLog::create([
                'user_id' => $user->id,
                'tokens_used' => $response['tokens_used'],
                'cost_usd' => $response['cost_usd'],
                'feature' => 'food_photo_recognition',
            ]);

            return response()->json([
                'message' => 'Analisis berhasil',
                'analysis_id' => $analysis->id,
                'result' => $result,
                'image_url' => $imageUrl,
            ]);

        } catch (Exception $e) {
            return response()->json(['message' => 'Gagal menganalisis foto: ' . $e->getMessage()], 500);
        }
    }
}
