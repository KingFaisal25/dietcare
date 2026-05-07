<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\WeightLog;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class WeightLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $client = User::where('username', 'budi')->first();

        if (!$client) {
            $this->command->error("User 'budi' not found.");
            return;
        }

        WeightLog::where('client_id', $client->id)->delete();

        $startDate = Carbon::now()->subWeeks(52);
        $startWeight = 85.0;
        $targetWeight = 72.0;
        
        // Let's create 52 weekly logs
        for ($i = 0; $i < 52; $i++) {
            $currentDate = $startDate->copy()->addWeeks($i);
            
            // Gradually decrease weight with some random fluctuations
            // Total loss target is 13kg over 52 weeks (0.25kg/week avg)
            $progress = $i / 51;
            $expectedLoss = (85 - 72) * $progress;
            $fluctuation = (rand(-5, 5) / 10.0); // -0.5 to 0.5kg
            $weight = 85.0 - $expectedLoss + $fluctuation;

            WeightLog::create([
                'client_id' => $client->id,
                'date' => $currentDate->toDateString(),
                'weight_kg' => round($weight, 2),
                'waist_cm' => round(95 - ($progress * 10) + (rand(-1, 1) / 2.0), 2),
                'hip_cm' => round(105 - ($progress * 8) + (rand(-1, 1) / 2.0), 2),
                'arm_cm' => round(35 - ($progress * 3) + (rand(-1, 1) / 2.0), 2),
                'thigh_cm' => round(60 - ($progress * 5) + (rand(-1, 1) / 2.0), 2),
                'notes' => "Minggu ke-" . ($i + 1) . " progres diet.",
            ]);
        }

        $this->command->info('Created 52 weekly weight logs for user budi.');
    }
}
