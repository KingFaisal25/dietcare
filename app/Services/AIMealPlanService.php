<?php

namespace App\Services;

use App\Models\User;
use App\Models\AiUsageLog;
use App\Services\AI\AIManager;
use Illuminate\Support\Facades\Log;

class AIMealPlanService
{
    protected $ai;

    public function __construct(AIManager $aiManager)
    {
        $this->ai = $aiManager->driver();
    }

    public function generateMealPlan(User $user, array $params): array
    {
        $calorieTarget = $params['calorie_target'] ?? 2000;
        $dietType = $params['diet_type'] ?? 'umum';
        $allergies = implode(', ', $params['allergies'] ?? []);
        $preferences = implode(', ', $params['food_preferences'] ?? []);
        $duration = $params['duration_days'] ?? 7;
        $budget = $params['budget'] ?? 'menengah';

        $systemPrompt = "Anda adalah ahli gizi profesional Indonesia. Tugas Anda adalah menyusun rencana makan (meal plan) yang sehat, lezat, dan sesuai dengan budaya kuliner Indonesia.
        
        Aturan Khusus:
        1. Gunakan bahan makanan lokal Indonesia yang mudah ditemukan di pasar atau supermarket.
        2. Sesuaikan dengan target kalori harian: {$calorieTarget} kkal.
        3. Tipe diet: {$dietType}.
        4. Hindari alergi: {$allergies}.
        5. Sesuaikan dengan preferensi: {$preferences}.
        6. Durasi: {$duration} hari.
        7. Budget: {$budget} (ekonomi/menengah/premium).
        
        Format output HARUS berupa JSON murni dengan struktur berikut:
        {
          \"days\": [
            {
              \"day\": 1,
              \"date\": \"YYYY-MM-DD\",
              \"meals\": {
                \"breakfast\": { \"name\": \"\", \"calories\": 0, \"protein\": 0, \"carbs\": 0, \"fat\": 0, \"ingredients\": [], \"instructions\": \"\" },
                \"morning_snack\": { ... },
                \"lunch\": { ... },
                \"afternoon_snack\": { ... },
                \"dinner\": { ... }
              },
              \"total_calories\": 0,
              \"total_protein\": 0
            }
          ],
          \"shopping_list\": [{ \"item\": \"\", \"quantity\": \"\", \"estimated_price_idr\": 0 }],
          \"notes\": \"Tips dari AI untuk program ini\"
        }";

        $response = $this->ai->chat($systemPrompt, "Buatkan meal plan untuk {$duration} hari.", [
            'response_format' => ['type' => 'json_object'],
        ]);

        $result = json_decode($response['content'], true);

        // Log usage
        AiUsageLog::create([
            'user_id' => $user->id,
            'tokens_used' => $response['tokens_used'],
            'cost_usd' => $response['cost_usd'],
            'feature' => 'meal_plan_generator',
        ]);

        return $result;
    }
}
