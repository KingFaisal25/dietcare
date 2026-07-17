<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ApiResponse;
use Illuminate\Http\Request;

/**
 * PublicFreeToolsController
 *
 * Controller untuk fitur gratis yang bisa diakses tanpa login.
 * Untuk viral marketing dan memberikan value kepada calon user.
 */
class PublicFreeToolsController extends Controller
{
    use ApiResponse;

    /**
     * Kalkulator Lengkap: BMI + TDEE + Macro
     *
     * POST /api/public/calculate/complete
     *
     * Request Body:
     * - weight_kg: float (20-300)
     * - height_cm: float (100-250)
     * - age: integer (10-100)
     * - gender: string (male|female)
     * - activity_level: string (sedentary|light|moderate|active|very_active)
     * - goal: string (lose|gain|maintain) - optional
     */
    public function calculateComplete(Request $request)
    {
        $validated = $request->validate([
            'weight_kg' => 'required|numeric|min:20|max:300',
            'height_cm' => 'required|numeric|min:100|max:250',
            'age' => 'required|integer|min:10|max:100',
            'gender' => 'required|in:male,female',
            'activity_level' => 'required|in:sedentary,light,moderate,active,very_active',
            'goal' => 'nullable|in:lose,gain,maintain',
        ]);

        try {
            // 1. Calculate BMI
            $heightM = $validated['height_cm'] / 100;
            $bmi = $validated['weight_kg'] / ($heightM * $heightM);
            $bmi = round($bmi, 2);

            // BMI Category
            $bmiCategory = $this->getBMICategory($bmi);

            // 2. Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor
            if ($validated['gender'] === 'male') {
                $bmr = (10 * $validated['weight_kg']) + (6.25 * $validated['height_cm']) - (5 * $validated['age']) + 5;
            } else {
                $bmr = (10 * $validated['weight_kg']) + (6.25 * $validated['height_cm']) - (5 * $validated['age']) - 161;
            }
            $bmr = round($bmr, 0);

            // 3. Calculate TDEE (Total Daily Energy Expenditure)
            $activityMultipliers = [
                'sedentary' => 1.2,    // Little to no exercise
                'light' => 1.375,      // Exercise 1-3 days/week
                'moderate' => 1.55,    // Exercise 3-5 days/week
                'active' => 1.725,     // Exercise 6-7 days/week
                'very_active' => 1.9,  // Very intense exercise, physical job
            ];

            $tdee = $bmr * $activityMultipliers[$validated['activity_level']];
            $tdee = round($tdee, 0);

            // 4. Calculate Target Calories based on goal
            $goal = $validated['goal'] ?? 'maintain';
            $targetCalories = $this->getTargetCalories($tdee, $goal);

            // 5. Calculate Ideal Weight Range (based on BMI 18.5-24.9)
            $idealWeightMin = round(18.5 * $heightM * $heightM, 1);
            $idealWeightMax = round(24.9 * $heightM * $heightM, 1);

            // 6. Calculate Macros (Protein, Carbs, Fat)
            $macros = $this->calculateMacros($targetCalories, $goal);

            // 7. Generate Recommendations
            $recommendations = $this->generateRecommendations($bmi, $bmiCategory, $validated['goal']);

            return $this->success('Kalkulasi berhasil!', [
                'bmi' => [
                    'value' => $bmi,
                    'category' => $bmiCategory['category'],
                    'description' => $bmiCategory['description'],
                    'health_risk' => $bmiCategory['health_risk'],
                ],
                'bmr' => [
                    'value' => $bmr,
                    'description' => 'Kalori yang dibutuhkan tubuh saat istirahat total',
                ],
                'tdee' => [
                    'value' => $tdee,
                    'description' => 'Kalori yang dibutuhkan per hari berdasarkan aktivitas Anda',
                    'activity_level' => $validated['activity_level'],
                ],
                'target_calories' => [
                    'value' => $targetCalories,
                    'goal' => $goal,
                    'description' => $this->getGoalDescription($goal),
                ],
                'ideal_weight' => [
                    'min' => $idealWeightMin,
                    'max' => $idealWeightMax,
                    'unit' => 'kg',
                    'description' => 'Rentang berat badan ideal berdasarkan tinggi Anda',
                ],
                'macros' => $macros,
                'recommendations' => $recommendations,
                'input_data' => [
                    'weight_kg' => $validated['weight_kg'],
                    'height_cm' => $validated['height_cm'],
                    'age' => $validated['age'],
                    'gender' => $validated['gender'],
                ],
            ]);

        } catch (\Exception $e) {
            return $this->error('Terjadi kesalahan saat menghitung. Silakan cek data Anda.', 500);
        }
    }

    /**
     * Calorie Burn Calculator
     *
     * POST /api/public/calculate/calorie-burn
     *
     * Request Body:
     * - exercise_type: string
     * - duration_minutes: integer
     * - weight_kg: float
     */
    public function calculateCalorieBurn(Request $request)
    {
        $validated = $request->validate([
            'exercise_type' => 'required|string',
            'duration_minutes' => 'required|integer|min:1|max:480',
            'weight_kg' => 'required|numeric|min:20|max:300',
        ]);

        try {
            // MET (Metabolic Equivalent of Task) values for common exercises
            $metValues = [
                'walking' => 3.5,
                'jogging' => 7.0,
                'running' => 9.8,
                'cycling' => 7.5,
                'swimming' => 8.0,
                'yoga' => 3.0,
                'pilates' => 3.5,
                'aerobics' => 6.5,
                'dancing' => 5.5,
                'badminton' => 5.5,
                'basketball' => 6.5,
                'football' => 8.0,
                'weightlifting' => 6.0,
                'jump_rope' => 11.0,
                'hiking' => 6.0,
                'stair_climbing' => 8.0,
            ];

            $exerciseType = strtolower($validated['exercise_type']);
            $met = $metValues[$exerciseType] ?? 5.0; // Default MET if exercise not found

            // Formula: Calories burned = MET × weight (kg) × duration (hours)
            $durationHours = $validated['duration_minutes'] / 60;
            $caloriesBurned = round($met * $validated['weight_kg'] * $durationHours, 0);

            // Food equivalents (approximate)
            $foodComparisons = $this->getFoodComparisons($caloriesBurned);

            return $this->success('Kalkulasi kalori terbakar berhasil!', [
                'calories_burned' => $caloriesBurned,
                'exercise' => [
                    'type' => $validated['exercise_type'],
                    'duration_minutes' => $validated['duration_minutes'],
                    'met_value' => $met,
                ],
                'food_comparisons' => $foodComparisons,
                'message' => "Anda membakar sekitar {$caloriesBurned} kalori dengan {$validated['exercise_type']} selama {$validated['duration_minutes']} menit!",
            ]);

        } catch (\Exception $e) {
            return $this->error('Terjadi kesalahan saat menghitung kalori terbakar.', 500);
        }
    }

    /**
     * Water Intake Calculator
     *
     * POST /api/public/calculate/water-intake
     *
     * Request Body:
     * - weight_kg: float
     * - activity_level: string
     * - climate: string (normal|hot|cold) - optional
     */
    public function calculateWaterIntake(Request $request)
    {
        $validated = $request->validate([
            'weight_kg' => 'required|numeric|min:20|max:300',
            'activity_level' => 'required|in:sedentary,light,moderate,active,very_active',
            'climate' => 'nullable|in:normal,hot,cold',
        ]);

        try {
            // Base calculation: 30-40ml per kg body weight
            $baseWater = $validated['weight_kg'] * 35; // ml

            // Activity level multiplier
            $activityMultipliers = [
                'sedentary' => 1.0,
                'light' => 1.1,
                'moderate' => 1.3,
                'active' => 1.5,
                'very_active' => 1.7,
            ];

            $waterNeeded = $baseWater * $activityMultipliers[$validated['activity_level']];

            // Climate adjustment
            $climate = $validated['climate'] ?? 'normal';
            if ($climate === 'hot') {
                $waterNeeded *= 1.2; // +20% for hot climate
            } elseif ($climate === 'cold') {
                $waterNeeded *= 0.9; // -10% for cold climate
            }

            $waterNeeded = round($waterNeeded, 0);
            $waterLiters = round($waterNeeded / 1000, 2);
            $waterGlasses = ceil($waterNeeded / 240); // 1 glass = ~240ml

            // Drinking schedule suggestion (8am - 8pm = 12 hours)
            $schedule = $this->generateDrinkingSchedule($waterGlasses);

            return $this->success('Kalkulasi kebutuhan air berhasil!', [
                'water_needed' => [
                    'ml' => $waterNeeded,
                    'liters' => $waterLiters,
                    'glasses' => $waterGlasses,
                ],
                'schedule' => $schedule,
                'tips' => [
                    'Minum segelas air saat bangun tidur',
                    'Minum sebelum makan untuk membantu pencernaan',
                    'Bawa botol air kemana pun Anda pergi',
                    'Minum lebih banyak saat berolahraga',
                    'Perhatikan warna urine: kuning muda = terhidrasi baik',
                ],
                'message' => "Anda perlu minum sekitar {$waterLiters} liter air per hari (sekitar {$waterGlasses} gelas).",
            ]);

        } catch (\Exception $e) {
            return $this->error('Terjadi kesalahan saat menghitung kebutuhan air.', 500);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────

    private function getBMICategory($bmi)
    {
        if ($bmi < 18.5) {
            return [
                'category' => 'Kurus',
                'description' => 'Berat badan Anda kurang',
                'health_risk' => 'Berisiko malnutrisi dan kekurangan energi',
            ];
        } elseif ($bmi >= 18.5 && $bmi < 25) {
            return [
                'category' => 'Normal',
                'description' => 'Berat badan Anda ideal',
                'health_risk' => 'Risiko kesehatan rendah',
            ];
        } elseif ($bmi >= 25 && $bmi < 30) {
            return [
                'category' => 'Overweight',
                'description' => 'Berat badan Anda berlebih',
                'health_risk' => 'Berisiko penyakit jantung dan diabetes',
            ];
        } else {
            return [
                'category' => 'Obesitas',
                'description' => 'Berat badan Anda sangat berlebih',
                'health_risk' => 'Risiko tinggi penyakit jantung, diabetes, dan komplikasi lainnya',
            ];
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/public/calculate/meal-plan
    // Generate sample 3-day meal plan based on calorie target
    // ─────────────────────────────────────────────────────────────

    public function generateMealPlan(Request $request)
    {
        $validated = $request->validate([
            'target_calories' => 'required|numeric|min:1000|max:5000',
            'goal'            => 'nullable|in:lose,gain,maintain',
        ]);

        $calories = (int) $validated['target_calories'];
        $goal     = $validated['goal'] ?? 'maintain';

        // Distribusi kalori per meal: Sarapan 25%, Snack pagi 10%,
        // Makan siang 35%, Snack sore 10%, Makan malam 20%
        $dist = [
            'breakfast'    => (int) round($calories * 0.25),
            'snack_am'     => (int) round($calories * 0.10),
            'lunch'        => (int) round($calories * 0.35),
            'snack_pm'     => (int) round($calories * 0.10),
            'dinner'       => (int) round($calories * 0.20),
        ];

        // Database menu Indonesia per slot kalori
        $menu = $this->getMenuDatabase();

        $days = [];
        foreach (['Senin', 'Selasa', 'Rabu'] as $i => $day) {
            $days[] = [
                'day'   => $day,
                'meals' => [
                    [
                        'type'     => 'Sarapan',
                        'time'     => '07:00',
                        'emoji'    => '🌅',
                        'calories' => $dist['breakfast'],
                        'items'    => $this->pickMeals($menu['breakfast'], $dist['breakfast'], $i),
                    ],
                    [
                        'type'     => 'Snack Pagi',
                        'time'     => '10:00',
                        'emoji'    => '🍌',
                        'calories' => $dist['snack_am'],
                        'items'    => $this->pickMeals($menu['snack'], $dist['snack_am'], $i),
                    ],
                    [
                        'type'     => 'Makan Siang',
                        'time'     => '13:00',
                        'emoji'    => '☀️',
                        'calories' => $dist['lunch'],
                        'items'    => $this->pickMeals($menu['lunch'], $dist['lunch'], $i),
                    ],
                    [
                        'type'     => 'Snack Sore',
                        'time'     => '16:00',
                        'emoji'    => '🍵',
                        'calories' => $dist['snack_pm'],
                        'items'    => $this->pickMeals($menu['snack'], $dist['snack_pm'], ($i + 1) % 3),
                    ],
                    [
                        'type'     => 'Makan Malam',
                        'time'     => '19:00',
                        'emoji'    => '🌙',
                        'calories' => $dist['dinner'],
                        'items'    => $this->pickMeals($menu['dinner'], $dist['dinner'], $i),
                    ],
                ],
                'total_calories' => $calories,
            ];
        }

        $tips = [
            'lose'     => ['Makan perlahan (20 menit)', 'Perbanyak sayur & serat', 'Hindari makan malam setelah jam 20.00'],
            'gain'     => ['Makan setiap 3-4 jam', 'Tambah alpukat & kacang-kacangan', 'Minum susu sebelum tidur'],
            'maintain' => ['Jaga porsi tetap konsisten', 'Minum air sebelum makan', 'Variasikan sayur & buah setiap hari'],
        ];

        return $this->success('Meal plan berhasil dibuat!', [
            'target_calories' => $calories,
            'goal'            => $goal,
            'days'            => $days,
            'tips'            => $tips[$goal] ?? $tips['maintain'],
            'note'            => 'Ini adalah contoh meal plan. Untuk menu personal & monitoring harian, daftar program kami!',
        ]);
    }

    private function getMenuDatabase(): array
    {
        return [
            'breakfast' => [
                [
                    'name'     => 'Nasi + Telur Dadar + Teh Manis',
                    'calories' => 380,
                    'protein'  => 14,
                    'carbs'    => 58,
                    'fat'      => 11,
                ],
                [
                    'name'     => 'Oatmeal Buah + Susu',
                    'calories' => 320,
                    'protein'  => 12,
                    'carbs'    => 52,
                    'fat'      => 7,
                ],
                [
                    'name'     => 'Roti Gandum + Telur Rebus + Susu',
                    'calories' => 350,
                    'protein'  => 18,
                    'carbs'    => 45,
                    'fat'      => 10,
                ],
                [
                    'name'     => 'Bubur Ayam + Krupuk',
                    'calories' => 400,
                    'protein'  => 16,
                    'carbs'    => 60,
                    'fat'      => 12,
                ],
                [
                    'name'     => 'Lontong Sayur + Teh',
                    'calories' => 350,
                    'protein'  => 12,
                    'carbs'    => 55,
                    'fat'      => 9,
                ],
            ],
            'lunch' => [
                [
                    'name'     => 'Nasi + Ayam Bakar + Tempe + Lalapan',
                    'calories' => 580,
                    'protein'  => 38,
                    'carbs'    => 65,
                    'fat'      => 16,
                ],
                [
                    'name'     => 'Nasi + Ikan Goreng + Sayur Bening',
                    'calories' => 520,
                    'protein'  => 32,
                    'carbs'    => 68,
                    'fat'      => 13,
                ],
                [
                    'name'     => 'Nasi + Rendang + Tumis Kangkung',
                    'calories' => 650,
                    'protein'  => 34,
                    'carbs'    => 72,
                    'fat'      => 22,
                ],
                [
                    'name'     => 'Nasi + Sop Ayam + Perkedel',
                    'calories' => 560,
                    'protein'  => 30,
                    'carbs'    => 70,
                    'fat'      => 16,
                ],
                [
                    'name'     => 'Gado-Gado + Nasi',
                    'calories' => 540,
                    'protein'  => 22,
                    'carbs'    => 68,
                    'fat'      => 20,
                ],
            ],
            'dinner' => [
                [
                    'name'     => 'Nasi (porsi kecil) + Tahu Goreng + Sup Sayur',
                    'calories' => 400,
                    'protein'  => 18,
                    'carbs'    => 55,
                    'fat'      => 12,
                ],
                [
                    'name'     => 'Nasi + Pepes Ikan + Tumis Buncis',
                    'calories' => 430,
                    'protein'  => 26,
                    'carbs'    => 52,
                    'fat'      => 13,
                ],
                [
                    'name'     => 'Nasi + Tempe Orek + Sayur Asem',
                    'calories' => 420,
                    'protein'  => 20,
                    'carbs'    => 58,
                    'fat'      => 12,
                ],
                [
                    'name'     => 'Mie Rebus Telur + Sayuran',
                    'calories' => 380,
                    'protein'  => 16,
                    'carbs'    => 56,
                    'fat'      => 11,
                ],
                [
                    'name'     => 'Nasi + Ayam Kukus + Brokoli Rebus',
                    'calories' => 440,
                    'protein'  => 32,
                    'carbs'    => 50,
                    'fat'      => 10,
                ],
            ],
            'snack' => [
                ['name' => 'Pisang (1 buah) + Susu Rendah Lemak', 'calories' => 180, 'protein' => 6, 'carbs' => 34, 'fat' => 3],
                ['name' => 'Apel + Segenggam Kacang Almond', 'calories' => 200, 'protein' => 5, 'carbs' => 28, 'fat' => 9],
                ['name' => 'Yogurt Plain + Buah Potong', 'calories' => 160, 'protein' => 8, 'carbs' => 26, 'fat' => 2],
                ['name' => 'Ubi Rebus (1 buah kecil)', 'calories' => 150, 'protein' => 2, 'carbs' => 35, 'fat' => 0],
                ['name' => 'Tempe Kukus + Teh Hijau', 'calories' => 170, 'protein' => 10, 'carbs' => 18, 'fat' => 6],
            ],
        ];
    }

    private function pickMeals(array $pool, int $targetCalories, int $dayIndex): array
    {
        // Pilih menu berdasarkan index hari agar setiap hari berbeda
        $item = $pool[$dayIndex % count($pool)];

        // Scale porsi ke target kalori
        $scale = $targetCalories / max($item['calories'], 1);
        $scale = round(min(max($scale, 0.7), 1.5), 1); // clamp 0.7x – 1.5x

        return [
            [
                'name'        => $item['name'],
                'portion'     => $scale == 1.0 ? '1 porsi' : "{$scale}x porsi",
                'calories'    => (int) round($item['calories'] * $scale),
                'protein_g'   => (int) round($item['protein'] * $scale),
                'carbs_g'     => (int) round($item['carbs'] * $scale),
                'fat_g'       => (int) round($item['fat'] * $scale),
            ],
        ];
    }

    private function getTargetCalories($tdee, $goal)
    {
        switch ($goal) {
            case 'lose':
                return round($tdee - 500, 0); // Deficit 500 cal/day = ~0.5kg/week loss
            case 'gain':
                return round($tdee + 300, 0); // Surplus 300 cal/day = ~0.3kg/week gain
            default:
                return $tdee; // maintain
        }
    }

    private function getGoalDescription($goal)
    {
        switch ($goal) {
            case 'lose':
                return 'Target untuk menurunkan berat badan (~0.5kg per minggu)';
            case 'gain':
                return 'Target untuk menambah berat badan (~0.3kg per minggu)';
            default:
                return 'Target untuk mempertahankan berat badan';
        }
    }

    private function calculateMacros($targetCalories, $goal)
    {
        // Macro distribution based on goal
        if ($goal === 'lose') {
            // High protein, moderate carbs, low fat
            $proteinPercent = 0.35;
            $carbsPercent = 0.35;
            $fatPercent = 0.30;
        } elseif ($goal === 'gain') {
            // Moderate protein, high carbs, moderate fat
            $proteinPercent = 0.25;
            $carbsPercent = 0.50;
            $fatPercent = 0.25;
        } else {
            // Balanced
            $proteinPercent = 0.30;
            $carbsPercent = 0.40;
            $fatPercent = 0.30;
        }

        // Calculate grams (1g protein = 4 cal, 1g carbs = 4 cal, 1g fat = 9 cal)
        $proteinGrams = round(($targetCalories * $proteinPercent) / 4, 0);
        $carbsGrams = round(($targetCalories * $carbsPercent) / 4, 0);
        $fatGrams = round(($targetCalories * $fatPercent) / 9, 0);

        return [
            'protein' => [
                'grams' => $proteinGrams,
                'calories' => $proteinGrams * 4,
                'percentage' => round($proteinPercent * 100, 0),
                'description' => 'Untuk membangun dan memperbaiki otot',
            ],
            'carbs' => [
                'grams' => $carbsGrams,
                'calories' => $carbsGrams * 4,
                'percentage' => round($carbsPercent * 100, 0),
                'description' => 'Sumber energi utama tubuh',
            ],
            'fat' => [
                'grams' => $fatGrams,
                'calories' => $fatGrams * 9,
                'percentage' => round($fatPercent * 100, 0),
                'description' => 'Untuk fungsi hormon dan penyerapan vitamin',
            ],
        ];
    }

    private function generateRecommendations($bmi, $bmiCategory, $goal)
    {
        $recommendations = [];

        // BMI-based recommendations
        if ($bmi < 18.5) {
            $recommendations[] = 'Fokus pada peningkatan asupan kalori secara sehat';
            $recommendations[] = 'Konsumsi makanan tinggi protein dan lemak sehat';
            $recommendations[] = 'Pertimbangkan konsultasi dengan ahli gizi';
        } elseif ($bmi >= 25) {
            $recommendations[] = 'Fokus pada defisit kalori yang sehat (300-500 kalori per hari)';
            $recommendations[] = 'Tingkatkan aktivitas fisik secara bertahap';
            $recommendations[] = 'Kurangi makanan tinggi gula dan lemak jenuh';
        } else {
            $recommendations[] = 'Pertahankan pola makan seimbang';
            $recommendations[] = 'Lakukan olahraga rutin minimal 3x seminggu';
        }

        // General recommendations
        $recommendations[] = 'Minum air putih minimal 8 gelas per hari';
        $recommendations[] = 'Tidur cukup 7-8 jam setiap malam';
        $recommendations[] = 'Kelola stres dengan baik';

        return $recommendations;
    }

    private function getFoodComparisons($calories)
    {
        // Common Indonesian food calorie values (approximate)
        $foods = [
            ['name' => 'Nasi putih (1 porsi)', 'calories' => 200],
            ['name' => 'Ayam goreng (1 potong)', 'calories' => 250],
            ['name' => 'Pisang (1 buah)', 'calories' => 100],
            ['name' => 'Roti tawar (2 lembar)', 'calories' => 150],
            ['name' => 'Telur (1 butir)', 'calories' => 70],
            ['name' => 'Bakso (1 mangkok)', 'calories' => 300],
            ['name' => 'Nasi goreng (1 porsi)', 'calories' => 400],
        ];

        $comparisons = [];
        foreach ($foods as $food) {
            if ($calories >= $food['calories']) {
                $portions = round($calories / $food['calories'], 1);
                $comparisons[] = [
                    'food' => $food['name'],
                    'portions' => $portions,
                    'message' => "Setara dengan {$portions} porsi {$food['name']}",
                ];
            }
        }

        return array_slice($comparisons, 0, 3); // Return top 3 comparisons
    }

    private function generateDrinkingSchedule($totalGlasses)
    {
        $schedule = [
            ['time' => '07:00', 'glasses' => 1, 'note' => 'Saat bangun tidur'],
            ['time' => '10:00', 'glasses' => 1, 'note' => 'Mid-morning'],
            ['time' => '12:00', 'glasses' => 1, 'note' => 'Sebelum makan siang'],
            ['time' => '15:00', 'glasses' => 1, 'note' => 'Mid-afternoon'],
            ['time' => '17:00', 'glasses' => 1, 'note' => 'Sebelum olahraga/pulang kerja'],
            ['time' => '19:00', 'glasses' => 1, 'note' => 'Sebelum makan malam'],
            ['time' => '21:00', 'glasses' => 1, 'note' => 'Sebelum tidur (1-2 jam sebelumnya)'],
        ];

        // Adjust to match total glasses needed
        if ($totalGlasses < count($schedule)) {
            return array_slice($schedule, 0, $totalGlasses);
        } elseif ($totalGlasses > count($schedule)) {
            // Distribute extra glasses throughout the day
            $extra = $totalGlasses - count($schedule);
            for ($i = 0; $i < $extra && $i < count($schedule); $i++) {
                $schedule[$i]['glasses']++;
            }
        }

        return $schedule;
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/public/calculate/metabolic-age
    // ─────────────────────────────────────────────────────────────
    public function calculateMetabolicAge(Request $request)
    {
        $validated = $request->validate([
            'age' => 'required|integer|min:10|max:100',
            'weight_kg' => 'required|numeric|min:20',
            'height_cm' => 'required|numeric|min:100',
            'activity_level' => 'required|in:sedentary,light,moderate,active,very_active'
        ]);

        $bmi = $validated['weight_kg'] / (($validated['height_cm']/100) * ($validated['height_cm']/100));
        $age = $validated['age'];

        // Simple heuristic for viral metabolic age
        $ageModifier = 0;

        if ($bmi > 25) $ageModifier += (($bmi - 25) * 1.5);
        if ($bmi < 18.5) $ageModifier += ((18.5 - $bmi) * 1.2);

        $activityScores = [
            'sedentary' => 5,
            'light' => 2,
            'moderate' => -2,
            'active' => -5,
            'very_active' => -8
        ];

        $ageModifier += $activityScores[$validated['activity_level']];
        $metabolicAge = max(15, round($age + $ageModifier));

        $difference = $metabolicAge - $age;

        if ($difference < 0) {
            $status = "Lebih Muda! 🎉";
            $message = "Luar biasa! Metabolisme tubuhmu bekerja seperti orang usia {$metabolicAge} tahun. Pertahankan gaya hidup aktifmu!";
        } else if ($difference == 0) {
            $status = "Normal 👍";
            $message = "Metabolisme tubuhmu sesuai dengan usiamu. Masih bisa ditingkatkan dengan olahraga teratur!";
        } else {
            $status = "Lebih Tua ⚠️";
            $message = "Waduh, metabolisme tubuhmu setara dengan usia {$metabolicAge} tahun. Yuk mulai kurangi gorengan dan perbanyak gerak!";
        }

        return $this->success('Kalkulasi usia tubuh berhasil', [
            'actual_age' => $age,
            'metabolic_age' => $metabolicAge,
            'difference' => abs($difference),
            'status' => $status,
            'message' => $message
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/public/foods/search-local
    // ─────────────────────────────────────────────────────────────
    public function searchFoodLocal(Request $request)
    {
        $query = strtolower($request->query('q', ''));

        $foods = [
            ['name' => 'Nasi Padang (Ayam Pop)', 'calories' => 700, 'protein' => 30, 'carbs' => 80, 'fat' => 25, 'warning' => 'Tinggi kalori & lemak jenuh! Setara lari 1.5 jam.'],
            ['name' => 'Indomie Goreng (Double)', 'calories' => 760, 'protein' => 16, 'carbs' => 108, 'fat' => 28, 'warning' => 'Tinggi natrium & karbo! Setara sepedaan 2 jam.'],
            ['name' => 'Seblak Kuah Pedas', 'calories' => 500, 'protein' => 12, 'carbs' => 60, 'fat' => 20, 'warning' => 'Tinggi karbohidrat & garam. Setara renang 1 jam.'],
            ['name' => 'Martabak Manis (2 Potong)', 'calories' => 550, 'protein' => 8, 'carbs' => 75, 'fat' => 25, 'warning' => 'Gula sangat tinggi! Setara lompat tali 45 menit.'],
            ['name' => 'Pecel Lele + Nasi', 'calories' => 650, 'protein' => 35, 'carbs' => 55, 'fat' => 30, 'warning' => 'Tinggi lemak dari minyak goreng. Setara jalan cepat 2 jam.'],
            ['name' => 'Gado-Gado Lontong', 'calories' => 450, 'protein' => 18, 'carbs' => 50, 'fat' => 15, 'warning' => 'Pilihan cukup sehat! Awas bumbu kacang terlalu banyak.'],
            ['name' => 'Boba Brown Sugar', 'calories' => 400, 'protein' => 2, 'carbs' => 85, 'fat' => 8, 'warning' => 'Kalori kosong dari gula! Setara naik turun tangga 40 menit.'],
            ['name' => 'Ayam Geprek + Nasi', 'calories' => 750, 'protein' => 35, 'carbs' => 65, 'fat' => 35, 'warning' => 'Sangat tinggi minyak! Setara senam aerobik 1.5 jam.'],
            ['name' => 'Sate Ayam (10 Tusuk) + Lontong', 'calories' => 550, 'protein' => 30, 'carbs' => 45, 'fat' => 25, 'warning' => 'Enak tapi bumbu kacangnya berkalori tinggi.'],
            ['name' => 'Soto Ayam + Nasi', 'calories' => 400, 'protein' => 20, 'carbs' => 50, 'fat' => 10, 'warning' => 'Aman! Hindari nambah koya terlalu banyak.'],
        ];

        if ($query) {
            $foods = array_values(array_filter($foods, function($f) use ($query) {
                return str_contains(strtolower($f['name']), $query);
            }));
        }

        return $this->success('Data makanan', $foods);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/public/calculate/fasting-plan
    // ─────────────────────────────────────────────────────────────
    public function planFasting(Request $request)
    {
        $validated = $request->validate([
            'wake_time' => 'required|string', // format HH:MM
            'method' => 'required|in:14_10,16_8,18_6,20_4'
        ]);

        $parts = explode(':', $validated['wake_time']);
        $wakeHour = (int)$parts[0];
        $wakeMin = $parts[1] ?? '00';

        // Metode
        $methods = [
            '14_10' => ['fast' => 14, 'eat' => 10, 'desc' => 'Pemula (14 jam puasa, 10 jam makan)'],
            '16_8' => ['fast' => 16, 'eat' => 8, 'desc' => 'Populer (16 jam puasa, 8 jam makan)'],
            '18_6' => ['fast' => 18, 'eat' => 6, 'desc' => 'Menengah (18 jam puasa, 6 jam makan)'],
            '20_4' => ['fast' => 20, 'eat' => 4, 'desc' => 'Hardcore / Warrior Diet (20 jam puasa)'],
        ];

        $selected = $methods[$validated['method']];

        // First meal is usually 2 hours after waking up
        $firstMealHour = ($wakeHour + 2) % 24;
        $firstMealTime = sprintf("%02d:%s", $firstMealHour, $wakeMin);

        // Last meal
        $lastMealHour = ($firstMealHour + $selected['eat']) % 24;
        $lastMealTime = sprintf("%02d:%s", $lastMealHour, $wakeMin);

        return $this->success('Jadwal Puasa', [
            'method_name' => $selected['desc'],
            'eating_window' => [
                'start' => $firstMealTime,
                'end' => $lastMealTime,
                'duration' => $selected['eat'] . ' Jam'
            ],
            'fasting_window' => [
                'start' => $lastMealTime,
                'end' => $firstMealTime,
                'duration' => $selected['fast'] . ' Jam'
            ],
            'tips' => [
                'Boleh minum air putih, kopi hitam, teh tawar selama puasa.',
                'Jangan kalap saat buka puasa! Mulai dengan protein ringan.',
                'Lakukan perlahan jika merasa pusing/kleyengan.'
            ]
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/public/calculate/budget-diet
    // ─────────────────────────────────────────────────────────────
    public function budgetDiet(Request $request)
    {
        $validated = $request->validate([
            'budget' => 'required|numeric|min:15000'
        ]);

        $budget = $validated['budget'];

        if ($budget <= 25000) {
            $tier = "Hemat / Anak Kos";
            $proteins = "Tempe, Tahu, Telur (1-2 butir)";
            $carbs = "Nasi putih, Ubi jalar rebus";
            $veggies = "Bayam, Kangkung, Kol";
            $example = "Sarapan: 2 Telur Rebus (Rp 4000). Siang: Nasi + Tempe Orek + Sayur Bayam (Rp 10.000). Malam: Nasi + Tahu Goreng + Lalapan (Rp 8000).";
        } else if ($budget <= 50000) {
            $tier = "Menengah";
            $proteins = "Dada Ayam, Ikan Lele, Telur, Susu Kotak";
            $carbs = "Nasi Merah, Roti Gandum, Oat";
            $veggies = "Brokoli, Wortel, Tomat";
            $example = "Sarapan: Roti Gandum + Telur (Rp 8000). Siang: Nasi Merah + Dada Ayam Panggang + Brokoli (Rp 25.000). Malam: Nasi + Ikan Bakar (Rp 15.000).";
        } else {
            $tier = "Premium";
            $proteins = "Daging Sapi (Lean), Salmon, Dada Ayam Organik";
            $carbs = "Quinoa, Pasta Gandum, Kentang Panggang";
            $veggies = "Asparagus, Salad Mix, Jamur Champignon";
            $example = "Sarapan: Overnight Oats + Berries (Rp 25.000). Siang: Quinoa + Beef Slice Teriyaki + Salad (Rp 45.000). Malam: Salmon Panggang + Asparagus (Rp 80.000+).";
        }

        return $this->success('Budget Menu', [
            'budget_per_day' => 'Rp ' . number_format($budget, 0, ',', '.'),
            'tier' => $tier,
            'recommendations' => [
                'protein' => $proteins,
                'karbohidrat' => $carbs,
                'sayur' => $veggies
            ],
            'example_menu' => $example,
            'message' => 'Diet sehat TIDAK HARUS MAHAL. Fokus pada protein lokal nabati untuk menghemat budget!'
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/public/calculate/cheat-meal
    // ─────────────────────────────────────────────────────────────
    public function checkCheatMeal(Request $request)
    {
        $validated = $request->validate([
            'tdee' => 'required|numeric|min:1000',
            'eaten_calories' => 'required|numeric|min:0',
            'cheat_food_calories' => 'required|numeric|min:1'
        ]);

        $tdee = $validated['tdee'];
        $eaten = $validated['eaten_calories'];
        $cheat = $validated['cheat_food_calories'];

        $remaining = $tdee - $eaten;
        $afterCheat = $remaining - $cheat;

        if ($afterCheat >= 0) {
            $status = "GAS MAKAN! 🟢";
            $message = "Kalorimu masih aman! Kamu punya sisa " . abs($afterCheat) . " kalori setelah makan cheat meal ini.";
            $action = "Nikmati makananmu tanpa rasa bersalah!";
        } else {
            $over = abs($afterCheat);
            $status = "STOP DULU! 🔴";
            $message = "Kalorimu jebol! Kalau kamu makan ini, kamu surplus {$over} kalori hari ini.";

            // Generate exercise penalty
            $joggingMins = round($over / 7); // ~7 cals per min
            $action = "Kalau maksa makan, kamu harus JOGGING selama {$joggingMins} menit untuk membakarnya!";
        }

        return $this->success('Cheat Meal Check', [
            'status' => $status,
            'tdee' => $tdee,
            'calories_left_before' => $remaining,
            'calories_over' => $afterCheat < 0 ? abs($afterCheat) : 0,
            'message' => $message,
            'action_required' => $action
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/public/calculate/recipe-generator
    // ─────────────────────────────────────────────────────────────
    public function generateRecipe(Request $request)
    {
        $validated = $request->validate([
            'ingredients' => 'required|array|min:1|max:8',
            'ingredients.*' => 'required|string|max:50',
        ]);

        $selectedIngredients = collect($validated['ingredients'])
            ->map(fn ($item) => strtolower(trim($item)))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $recipes = $this->getRecipeDatabase();

        $matches = collect($recipes)
            ->map(function (array $recipe) use ($selectedIngredients) {
                $matchedIngredients = array_values(array_intersect($recipe['ingredients'], $selectedIngredients));
                $score = count($matchedIngredients);

                $missingIngredients = array_values(array_diff($recipe['ingredients'], $selectedIngredients));

                return [
                    'name' => $recipe['name'],
                    'description' => $recipe['description'],
                    'cook_time_minutes' => $recipe['cook_time_minutes'],
                    'difficulty' => $recipe['difficulty'],
                    'estimated_calories' => $recipe['estimated_calories'],
                    'ingredients' => $recipe['ingredients'],
                    'matched_ingredients' => $matchedIngredients,
                    'missing_ingredients' => $missingIngredients,
                    'steps' => $recipe['steps'],
                    'score' => $score,
                ];
            })
            ->filter(fn (array $recipe) => $recipe['score'] > 0)
            ->sortByDesc('score')
            ->take(5)
            ->values();

        if ($matches->isEmpty()) {
            return $this->success('Belum ada resep yang cocok.', [
                'selected_ingredients' => $selectedIngredients,
                'recipes' => [],
                'suggestion' => 'Coba tambah bahan umum seperti telur, bawang, nasi, atau ayam agar rekomendasi lebih akurat.',
            ]);
        }

        return $this->success('Resep berhasil ditemukan.', [
            'selected_ingredients' => $selectedIngredients,
            'recipes' => $matches,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/public/foods/jajanan
    // ─────────────────────────────────────────────────────────────
    public function searchJajanan(Request $request)
    {
        $query = strtolower(trim((string) $request->query('q', '')));

        $items = collect($this->getJajananDatabase());

        if ($query !== '') {
            $items = $items->filter(function (array $item) use ($query) {
                return str_contains(strtolower($item['name']), $query)
                    || str_contains(strtolower($item['category']), $query)
                    || collect($item['tags'])->contains(fn ($tag) => str_contains(strtolower($tag), $query));
            });
        }

        return $this->success('Data jajanan ditemukan.', $items->values()->all());
    }

    private function getRecipeDatabase(): array
    {
        return [
            [
                'name' => 'Nasi Goreng Kulkas',
                'description' => 'Menu cepat dari nasi sisa, telur, dan sayur yang ada di kulkas.',
                'ingredients' => ['nasi', 'telur', 'bawang', 'kecap', 'wortel'],
                'cook_time_minutes' => 15,
                'difficulty' => 'Mudah',
                'estimated_calories' => 430,
                'steps' => [
                    'Tumis bawang sampai harum.',
                    'Masukkan telur lalu orak-arik.',
                    'Tambahkan wortel dan nasi, aduk rata.',
                    'Beri kecap, koreksi rasa, lalu sajikan hangat.',
                ],
            ],
            [
                'name' => 'Omelet Sayur Simpel',
                'description' => 'Sarapan tinggi protein dengan bahan sederhana dan cepat matang.',
                'ingredients' => ['telur', 'bayam', 'bawang', 'tomat', 'keju'],
                'cook_time_minutes' => 10,
                'difficulty' => 'Mudah',
                'estimated_calories' => 280,
                'steps' => [
                    'Kocok telur dan campurkan sayur iris.',
                    'Panaskan wajan anti lengket dengan sedikit minyak.',
                    'Masak hingga kedua sisi matang.',
                    'Tambahkan keju di akhir jika tersedia.',
                ],
            ],
            [
                'name' => 'Tumis Ayam Brokoli',
                'description' => 'Makan siang praktis, tinggi protein, dan cocok untuk meal prep.',
                'ingredients' => ['ayam', 'brokoli', 'bawang', 'saus tiram', 'wortel'],
                'cook_time_minutes' => 20,
                'difficulty' => 'Sedang',
                'estimated_calories' => 360,
                'steps' => [
                    'Tumis bawang hingga harum lalu masukkan ayam.',
                    'Masak sampai ayam berubah warna.',
                    'Tambahkan brokoli dan wortel, aduk cepat.',
                    'Bumbui saus tiram dan sedikit air, masak hingga sayur matang.',
                ],
            ],
            [
                'name' => 'Sandwich Telur Keju',
                'description' => 'Cocok untuk sarapan atau bekal singkat sebelum beraktivitas.',
                'ingredients' => ['roti', 'telur', 'keju', 'selada', 'tomat'],
                'cook_time_minutes' => 12,
                'difficulty' => 'Mudah',
                'estimated_calories' => 340,
                'steps' => [
                    'Panggang roti sebentar agar lebih renyah.',
                    'Masak telur sesuai selera.',
                    'Susun roti, telur, keju, selada, dan tomat.',
                    'Potong dua lalu sajikan.',
                ],
            ],
            [
                'name' => 'Sup Tahu Sayur Hangat',
                'description' => 'Resep ringan untuk malam hari dengan bahan yang ramah di perut.',
                'ingredients' => ['tahu', 'wortel', 'kol', 'bawang', 'daun bawang'],
                'cook_time_minutes' => 18,
                'difficulty' => 'Mudah',
                'estimated_calories' => 190,
                'steps' => [
                    'Rebus air lalu masukkan bawang dan wortel.',
                    'Tambahkan tahu dan kol.',
                    'Masak sampai semua bahan empuk.',
                    'Taburi daun bawang sebelum disajikan.',
                ],
            ],
            [
                'name' => 'Mie Tek-Tek Rumahan',
                'description' => 'Versi rumahan yang lebih gampang dikontrol minyak dan topping-nya.',
                'ingredients' => ['mi', 'telur', 'kol', 'bawang', 'kecap'],
                'cook_time_minutes' => 15,
                'difficulty' => 'Mudah',
                'estimated_calories' => 410,
                'steps' => [
                    'Rebus mi hingga setengah matang lalu tiriskan.',
                    'Tumis bawang, masukkan telur dan kol.',
                    'Tambahkan mi dan kecap.',
                    'Aduk rata sampai bumbu meresap.',
                ],
            ],
        ];
    }

    private function getJajananDatabase(): array
    {
        return [
            [
                'name' => 'Es Kopi Susu Gula Aren',
                'category' => 'Kopi Kekinian',
                'serving' => '1 gelas sedang',
                'calories' => 220,
                'sugar_g' => 24,
                'caffeine_mg' => 90,
                'tags' => ['kopi', 'susu', 'gula aren'],
                'warning' => 'Gula cukup tinggi jika diminum rutin setiap hari.',
            ],
            [
                'name' => 'Brown Sugar Boba Milk',
                'category' => 'Minuman Viral',
                'serving' => '1 cup 500 ml',
                'calories' => 420,
                'sugar_g' => 48,
                'caffeine_mg' => 0,
                'tags' => ['boba', 'brown sugar', 'susu'],
                'warning' => 'Kalori dan gula sangat tinggi, lebih cocok sebagai dessert sesekali.',
            ],
            [
                'name' => 'Croffle Cokelat',
                'category' => 'Jajanan Manis',
                'serving' => '1 porsi',
                'calories' => 310,
                'sugar_g' => 18,
                'caffeine_mg' => 0,
                'tags' => ['croffle', 'pastry', 'cokelat'],
                'warning' => 'Tinggi lemak dan gula, sebaiknya dibagi dua jika sedang diet.',
            ],
            [
                'name' => 'Seblak Ceker Pedas',
                'category' => 'Jajanan Gurih',
                'serving' => '1 mangkuk',
                'calories' => 510,
                'sugar_g' => 7,
                'caffeine_mg' => 0,
                'tags' => ['seblak', 'pedas', 'kerupuk'],
                'warning' => 'Tinggi sodium dan karbo dari kerupuk basah.',
            ],
            [
                'name' => 'Cappuccino Cincau',
                'category' => 'Minuman Viral',
                'serving' => '1 gelas',
                'calories' => 260,
                'sugar_g' => 30,
                'caffeine_mg' => 55,
                'tags' => ['cappuccino', 'cincau', 'manis'],
                'warning' => 'Sering dianggap ringan, padahal gulanya cukup tinggi.',
            ],
            [
                'name' => 'Dimsum Ayam Mayo',
                'category' => 'Jajanan Gurih',
                'serving' => '4 pcs',
                'calories' => 290,
                'sugar_g' => 6,
                'caffeine_mg' => 0,
                'tags' => ['dimsum', 'ayam', 'mayo'],
                'warning' => 'Saus mayo menambah lemak dan kalori cukup signifikan.',
            ],
            [
                'name' => 'Matcha Latte',
                'category' => 'Kopi Kekinian',
                'serving' => '1 gelas sedang',
                'calories' => 240,
                'sugar_g' => 26,
                'caffeine_mg' => 70,
                'tags' => ['matcha', 'latte', 'susu'],
                'warning' => 'Pilih less sugar bila diminum lebih dari 2 kali seminggu.',
            ],
            [
                'name' => 'Roti Bakar Keju Cokelat',
                'category' => 'Jajanan Manis',
                'serving' => '2 slice',
                'calories' => 380,
                'sugar_g' => 20,
                'caffeine_mg' => 0,
                'tags' => ['roti bakar', 'keju', 'cokelat'],
                'warning' => 'Padat energi, mudah bikin kalori harian cepat penuh.',
            ],
        ];
    }
}
