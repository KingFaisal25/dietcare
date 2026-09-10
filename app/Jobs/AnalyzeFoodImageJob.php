<?php

namespace App\Jobs;

use App\Models\FoodAnalysis;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Google\Gemini\Client as GeminiClient;

class AnalyzeFoodImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $analysis;

    public function __construct(FoodAnalysis $analysis)
    {
        $this->analysis = $analysis;
    }

    public function handle(): void
    {
        try {
            // Initialize Gemini client
            $gemini = new GeminiClient(env("GEMINI_API_KEY"));
            
            // Get image path
            $imagePath = Storage::disk("public")->path($this->analysis->image_path);
            
            // Create prompt for food analysis
            $prompt = "
            Analyze this food image and provide detailed nutrition information:
            - Identify all food items in the image
            - Estimate portion sizes
            - Calculate approximate nutrition values (calories, protein, carbs, fat)
            - Provide health suggestions based on nutritional content
            - Format the response as JSON with the following structure:
            {
              "food_items": [
                {
                  "name": "Food name",
                  "portion": "Estimated portion",
                  "calories": number,
                  "protein": number,
                  "carbs": number,
                  "fat": number
                }
              ],
              "total_nutrition": {
                "calories": total calories,
                "protein": total protein,
                "carbs": total carbs,
                "fat": total fat
              },
              "suggestions": "Health and dietary suggestions"
            }
            ";
            
            // Analyze image with Gemini
            $response = $gemini->geminiPro()->generateContent([
                "contents" => [
                    [
                        "role" => "user",
                        "parts" => [
                            ["text" => $prompt],
                            [
                                "inline_data" => [
                                    "mime_type" => "image/jpeg",
                                    "data" => base64_encode(file_get_contents($imagePath))
                                ]
                            ]
                        ]
                    ]
                ]
            ]);
            
            // Extract response text
            $resultText = $response["candidates"][0]["content"]["parts"][0]["text"];
            
            // Parse JSON response
            $result = json_decode($resultText, true);
            
            // Update analysis with results
            $this->analysis->update([
                "food_items" => $result["food_items"] ?? [],
                "total_nutrition" => $result["total_nutrition"] ?? [],
                "suggestions" => $result["suggestions"] ?? "",
                "status" => "completed",
                "analysis_time" => now(),
            ]);
            
        } catch (\Exception $e) {
            // Mark as failed if there"s an error
            $this->analysis->update([
                "status" => "failed",
                "suggestions" => "Gagal menganalisis gambar: " . $e->getMessage(),
            ]);
        }
    }
}
