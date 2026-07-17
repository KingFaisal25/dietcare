<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SystemAccountsSeeder::class,
            PromoCodeSeeder::class,
            NutritionistProfileSeeder::class,
            WeightLogSeeder::class,
            ShopProductSeeder::class,
            BlogContentSeeder::class,
        ]);

        // Default Programs
        foreach ([
            [
                'name' => 'Basic Weight Loss',
                'slug' => 'basic-weight-loss',
                'description' => 'Program penurunan berat badan dasar selama 1 bulan.',
                'price' => 350000.00,
                'duration_days' => 30,
                'max_consultations' => 2,
                'features' => json_encode(['Menu Diet Harian', '2x Konsultasi Chat', 'Akses Grup Komunitas']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Intensive Weight Loss',
                'slug' => 'intensive-weight-loss',
                'description' => 'Program penurunan berat badan intensif selama 2 bulan dengan pantauan ketat.',
                'price' => 750000.00,
                'duration_days' => 60,
                'max_consultations' => 4,
                'features' => json_encode(['Menu Diet Kustom', '4x Konsultasi Video Call', 'Pantauan Harian', 'Akses Grup Komunitas']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Muscle Gain Pro',
                'slug' => 'muscle-gain-pro',
                'description' => 'Program khusus untuk menaikkan massa otot.',
                'price' => 500000.00,
                'duration_days' => 30,
                'max_consultations' => 3,
                'features' => json_encode(['Menu Diet Tinggi Protein', '3x Konsultasi Chat/Video', 'Rekomendasi Suplemen']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ] as $program) {
            DB::table('programs')->updateOrInsert(
                ['slug' => $program['slug']],
                $program
            );
        }

        // Sample Food Database
        foreach ([
            [
                'name_id' => 'Nasi Putih',
                'category' => 'nasi_sereal',
                'calories_per_100g' => 130.00,
                'protein_per_100g' => 2.70,
                'carbs_per_100g' => 28.00,
                'fat_per_100g' => 0.30,
                'fiber_per_100g' => 0.40,
                'serving_size' => 100,
                'source' => 'manual',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_id' => 'Dada Ayam Rebus',
                'category' => 'lauk_hewani',
                'calories_per_100g' => 165.00,
                'protein_per_100g' => 31.00,
                'carbs_per_100g' => 0.00,
                'fat_per_100g' => 3.60,
                'fiber_per_100g' => 0.00,
                'serving_size' => 100,
                'source' => 'manual',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_id' => 'Telur Ayam Rebus',
                'category' => 'lauk_hewani',
                'calories_per_100g' => 155.00,
                'protein_per_100g' => 12.60,
                'carbs_per_100g' => 1.10,
                'fat_per_100g' => 10.60,
                'fiber_per_100g' => 0.00,
                'serving_size' => 100,
                'source' => 'manual',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_id' => 'Tempe Goreng',
                'category' => 'lauk_nabati',
                'calories_per_100g' => 192.00,
                'protein_per_100g' => 19.00,
                'carbs_per_100g' => 7.60,
                'fat_per_100g' => 11.00,
                'fiber_per_100g' => 4.80,
                'serving_size' => 100,
                'source' => 'manual',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_id' => 'Bayam Rebus',
                'category' => 'sayuran',
                'calories_per_100g' => 23.00,
                'protein_per_100g' => 2.90,
                'carbs_per_100g' => 3.60,
                'fat_per_100g' => 0.40,
                'fiber_per_100g' => 2.20,
                'serving_size' => 100,
                'source' => 'manual',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ] as $food) {
            DB::table('foods')->updateOrInsert(
                ['name_id' => $food['name_id']],
                $food
            );
        }
    }
}
