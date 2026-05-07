<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\NutritionistProfile;
use App\Models\NutritionistSchedule;

class NutritionistProfileSeeder extends Seeder
{
    public function run(): void
    {
        $nutritionist1 = User::updateOrCreate(
            ['email' => '@DietCare.com'],
            [
                'name' => ' DietCare',
                'username' => '',
                'password' => Hash::make('password123'),
                'phone' => '081234567891',
                'email_verified_at' => now(),
            ]
        );
        $nutritionist1->assignRole('nutritionist');

        NutritionistProfile::updateOrCreate(
            ['user_id' => $nutritionist1->id],
            [
                'slug' => '-dietcare',
                'title' => 'S.Gz',
                'str_number' => '12345678901234',
                'bio' => 'Halo! Saya , ahli gizi spesialis penurunan berat badan. Berpengalaman 5 tahun membantu klien mencapai body goals.',
                'years_experience' => 5,
                'city' => 'Jakarta',
                'specializations' => ['Penurunan BB', 'Gizi Olahraga', 'Gizi Klinis'],
                'education' => [
                    ['degree' => 'S1 Gizi', 'institution' => 'Universitas Indonesia', 'year' => '2019']
                ],
                'certifications' => [
                    ['name' => 'Certified Sports Nutritionist', 'institution' => 'ISNA', 'year' => '2020']
                ],
            ]
        );

        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        foreach ($days as $day) {
            NutritionistSchedule::updateOrCreate(
                [
                    'user_id' => $nutritionist1->id,
                    'day_of_week' => $day,
                ],
                [
                    'is_active' => true,
                    'start_time' => '09:00:00',
                    'end_time' => '17:00:00',
                ]
            );
        }

        $nutritionist2 = User::updateOrCreate(
            ['email' => 'andi@DietCare.com'],
            [
                'name' => 'Dr. Andi',
                'username' => 'drandi',
                'password' => Hash::make('password123'),
                'phone' => '081234567892',
                'email_verified_at' => now(),
            ]
        );
        $nutritionist2->assignRole('nutritionist');

        NutritionistProfile::updateOrCreate(
            ['user_id' => $nutritionist2->id],
            [
                'slug' => 'dr-andi',
                'title' => 'Sp.GK',
                'str_number' => '98765432109876',
                'bio' => 'Ahli gizi klinis untuk berbagai kondisi medis.',
                'years_experience' => 10,
                'city' => 'Surabaya',
                'specializations' => ['Gizi Klinis', 'Diabetes'],
                'education' => [
                    ['degree' => 'S2 Gizi Klinis', 'institution' => 'Universitas Airlangga', 'year' => '2015']
                ],
            ]
        );

        foreach (['Senin', 'Rabu', 'Jumat'] as $day) {
            NutritionistSchedule::updateOrCreate(
                [
                    'user_id' => $nutritionist2->id,
                    'day_of_week' => $day,
                ],
                [
                    'is_active' => true,
                    'start_time' => '10:00:00',
                    'end_time' => '14:00:00',
                ]
            );
        }
    }
}
