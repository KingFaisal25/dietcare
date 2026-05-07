<?php

namespace App\Services;

use App\Models\ClientProfile;
use App\Models\WeightLog;
use Carbon\Carbon;

/**
 * ==========================================================
 *  NutritionCalculator — Service untuk kalkulasi gizi
 * ==========================================================
 *
 *  Service ini menangani semua perhitungan nutrisi untuk klien
 *  DietCare, termasuk BMI, BMR, TDEE, target kalori,
 *  distribusi makronutrien, dan monitoring progres berat badan.
 *
 *  Referensi rumus:
 *  - BMI Asia-Pasifik: WHO Western Pacific Region (2000)
 *  - BMR Mifflin-St Jeor: Mifflin et al. (1990)
 *  - TDEE: Harris-Benedict Activity Factors
 */
class NutritionCalculator
{
    // ╔════════════════════════════════════════════════════════╗
    // ║  1. CALCULATE BMI (Body Mass Index)                   ║
    // ╚════════════════════════════════════════════════════════╝

    /**
     * Menghitung Body Mass Index (BMI) berdasarkan standar Asia-Pasifik.
     *
     * Rumus: BMI = berat(kg) / tinggi(m)²
     *
     * Kategori BMI menurut kriteria Asia-Pasifik (WHO WPRO):
     * - Kurus       : BMI < 18.5
     * - Normal      : BMI 18.5 – 22.9
     * - Berisiko    : BMI 23.0 – 24.9
     * - Overweight  : BMI 25.0 – 29.9
     * - Obesitas    : BMI ≥ 30.0
     *
     * @param  float  $weightKg   Berat badan dalam kilogram (contoh: 70.5)
     * @param  float  $heightCm   Tinggi badan dalam centimeter (contoh: 165)
     * @return array  ['bmi' => float, 'category' => string, 'category_id' => string]
     *
     * @throws \InvalidArgumentException Jika berat atau tinggi ≤ 0
     */
    public function calculateBMI(float $weightKg, float $heightCm): array
    {
        // Validasi input: berat dan tinggi harus positif
        if ($weightKg <= 0 || $heightCm <= 0) {
            throw new \InvalidArgumentException(
                'Berat badan dan tinggi badan harus bernilai positif.'
            );
        }

        // Konversi tinggi dari centimeter ke meter (1m = 100cm)
        $heightM = $heightCm / 100;

        // Hitung BMI: berat dibagi kuadrat tinggi dalam meter
        $bmi = $weightKg / ($heightM * $heightM);

        // Bulatkan ke 1 desimal untuk tampilan
        $bmi = round($bmi, 1);

        // Tentukan kategori BMI berdasarkan standar Asia-Pasifik
        // Standar ini lebih ketat dari standar WHO internasional
        // karena risiko kesehatan populasi Asia meningkat pada BMI lebih rendah
        if ($bmi < 18.5) {
            // Berat badan kurang — risiko malnutrisi, anemia, osteoporosis
            $category   = 'Kurus';
            $categoryId = 'underweight';
        } elseif ($bmi <= 22.9) {
            // Berat badan normal — range ideal untuk populasi Asia
            $category   = 'Normal';
            $categoryId = 'normal';
        } elseif ($bmi <= 24.9) {
            // Berisiko — belum overweight tapi sudah perlu waspada
            $category   = 'Berisiko';
            $categoryId = 'at_risk';
        } elseif ($bmi <= 29.9) {
            // Overweight — risiko penyakit kardiovaskular meningkat
            $category   = 'Overweight';
            $categoryId = 'overweight';
        } else {
            // Obesitas — risiko tinggi diabetes, hipertensi, dll
            $category   = 'Obesitas';
            $categoryId = 'obese';
        }

        // Return array berisi nilai BMI, nama kategori, dan ID kategori
        return [
            'bmi'         => $bmi,          // Nilai BMI (contoh: 25.1)
            'category'    => $category,     // Kategori dalam Bahasa Indonesia
            'category_id' => $categoryId,   // ID untuk logic frontend
        ];
    }

    // ╔════════════════════════════════════════════════════════╗
    // ║  2. CALCULATE BMR (Basal Metabolic Rate)              ║
    // ╚════════════════════════════════════════════════════════╝

    /**
     * Menghitung Basal Metabolic Rate (BMR) menggunakan rumus Mifflin-St Jeor.
     *
     * BMR adalah jumlah kalori minimum yang dibutuhkan tubuh untuk
     * mempertahankan fungsi vital saat istirahat total (bernapas,
     * sirkulasi darah, fungsi organ, dll).
     *
     * Rumus Mifflin-St Jeor (1990) — paling akurat saat ini:
     *   Pria:   BMR = (10 × berat_kg) + (6.25 × tinggi_cm) - (5 × usia) + 5
     *   Wanita: BMR = (10 × berat_kg) + (6.25 × tinggi_cm) - (5 × usia) - 161
     *
     * @param  float   $weight  Berat badan dalam kilogram
     * @param  float   $height  Tinggi badan dalam centimeter
     * @param  int     $age     Usia dalam tahun
     * @param  string  $gender  Jenis kelamin: 'male' atau 'female'
     * @return float   Nilai BMR dalam kilokalori per hari (kkal/hari)
     *
     * @throws \InvalidArgumentException Jika parameter tidak valid
     */
    public function calculateBMR(float $weight, float $height, int $age, string $gender): float
    {
        // Validasi: semua parameter harus bernilai positif
        if ($weight <= 0 || $height <= 0 || $age <= 0) {
            throw new \InvalidArgumentException(
                'Berat, tinggi, dan usia harus bernilai positif.'
            );
        }

        // Validasi jenis kelamin hanya menerima 'male' atau 'female'
        $gender = strtolower($gender);
        if (!in_array($gender, ['male', 'female'])) {
            throw new \InvalidArgumentException(
                "Gender harus 'male' atau 'female', diberikan: '{$gender}'"
            );
        }

        // Komponen berat: 10 kalori per kg berat badan
        // Semakin berat tubuh, semakin banyak energi basal yang dibutuhkan
        $weightComponent = 10 * $weight;

        // Komponen tinggi: 6.25 kalori per cm tinggi badan
        // Tubuh yang lebih tinggi memiliki luas permukaan lebih besar
        $heightComponent = 6.25 * $height;

        // Komponen usia: -5 kalori per tahun usia
        // Metabolisme melambat seiring bertambahnya usia
        $ageComponent = 5 * $age;

        // Hitung BMR berdasarkan jenis kelamin
        if ($gender === 'male') {
            // Pria: ditambah konstanta +5
            // Pria umumnya memiliki massa otot lebih banyak = BMR lebih tinggi
            $bmr = $weightComponent + $heightComponent - $ageComponent + 5;
        } else {
            // Wanita: dikurangi konstanta -161
            // Perbedaan -166 kkal dari pria mencerminkan komposisi tubuh berbeda
            $bmr = $weightComponent + $heightComponent - $ageComponent - 161;
        }

        // Bulatkan ke bilangan bulat (presisi desimal tidak bermakna klinis)
        return round($bmr, 2);
    }

    // ╔════════════════════════════════════════════════════════╗
    // ║  3. CALCULATE TDEE (Total Daily Energy Expenditure)    ║
    // ╚════════════════════════════════════════════════════════╝

    /**
     * Menghitung Total Daily Energy Expenditure (TDEE).
     *
     * TDEE = BMR × Activity Multiplier
     *
     * TDEE adalah total kalori yang dibakar per hari termasuk
     * semua aktivitas fisik. Ini menjadi dasar penentuan target kalori.
     *
     * Level aktivitas dan multiplier:
     *   sedentary    = 1.2  → Duduk sepanjang hari, tanpa olahraga
     *   light        = 1.375 → Olahraga ringan 1-3x/minggu
     *   moderate     = 1.55  → Olahraga sedang 3-5x/minggu
     *   active       = 1.725 → Olahraga berat 6-7x/minggu
     *   very_active  = 1.9   → Aktivitas fisik sangat berat/atlet
     *
     * @param  float   $bmr            Nilai BMR dari calculateBMR()
     * @param  string  $activityLevel  Level aktivitas fisik
     * @return float   Nilai TDEE dalam kkal/hari
     *
     * @throws \InvalidArgumentException Jika level aktivitas tidak valid
     */
    public function calculateTDEE(float $bmr, string $activityLevel): float
    {
        // Daftar multiplier untuk setiap level aktivitas
        // Angka ini menunjukkan seberapa banyak kalori tambahan dari aktivitas
        $multipliers = [
            'sedentary'   => 1.2,    // ×1.2: hampir tidak ada aktivitas fisik
            'light'       => 1.375,  // ×1.375: jalan kaki ringan, yoga
            'moderate'    => 1.55,   // ×1.55: jogging, berenang 3-5x/minggu
            'active'      => 1.725,  // ×1.725: latihan intens hampir setiap hari
            'very_active' => 1.9,    // ×1.9: atlet atau pekerjaan fisik berat
        ];

        // Validasi: pastikan level aktivitas terdaftar
        if (!isset($multipliers[$activityLevel])) {
            $validLevels = implode(', ', array_keys($multipliers));
            throw new \InvalidArgumentException(
                "Activity level tidak valid: '{$activityLevel}'. Pilihan: {$validLevels}"
            );
        }

        // TDEE = BMR × multiplier sesuai level aktivitas
        $tdee = $bmr * $multipliers[$activityLevel];

        // Bulatkan ke bilangan bulat
        return round($tdee, 2);
    }

    // ╔════════════════════════════════════════════════════════╗
    // ║  4. CALCULATE DIET TARGET (Target Kalori Harian)      ║
    // ╚════════════════════════════════════════════════════════╝

    /**
     * Menghitung target kalori harian berdasarkan tujuan diet.
     *
     * Prinsip dasar:
     *   - 1 kg lemak ≈ 7.700 kkal
     *   - Defisit 500 kkal/hari ≈ turun 0.5 kg/minggu (aman)
     *   - Surplus 250 kkal/hari ≈ naik 0.25 kg/minggu (lean bulk)
     *
     * Target type dan persentase dari TDEE:
     *   lose_weight  = TDEE × 0.75 (defisit 25%)
     *   gain_weight  = TDEE × 1.15 (surplus 15%)
     *   maintain     = TDEE × 1.0  (tanpa perubahan)
     *   body_recomp  = TDEE × 0.90 (defisit ringan 10%)
     *
     * Safety net: Kalori minimum 1200 kkal (wanita) / 1500 kkal (pria)
     * untuk mencegah kelaparan dan defisiensi nutrisi.
     *
     * @param  float   $tdee        Nilai TDEE dari calculateTDEE()
     * @param  string  $targetType  Tujuan diet klien
     * @param  string  $gender      Jenis kelamin (untuk batas minimum)
     * @return array   ['target_calories', 'deficit_surplus', 'estimated_weekly_change']
     */
    public function calculateDietTarget(float $tdee, string $targetType, string $gender = 'female'): array
    {
        // Mapping target type ke persentase TDEE
        // Angka ini berdasarkan rekomendasi dietisien profesional
        $multipliers = [
            'lose_weight' => 0.75,  // Defisit 25%: agresif tapi masih aman
            'lose'        => 0.75,  // Alias untuk lose_weight
            'gain_weight' => 1.15,  // Surplus 15%: lean bulk, minim lemak
            'gain'        => 1.15,  // Alias untuk gain_weight
            'maintain'    => 1.0,   // Pertahankan berat badan saat ini
            'body_recomp' => 0.90,  // Defisit ringan 10%: ganti lemak → otot
        ];

        // Default ke maintain jika target type tidak dikenali
        $multiplier = $multipliers[$targetType] ?? 1.0;

        // Hitung target kalori: TDEE × multiplier
        $targetCalories = $tdee * $multiplier;

        // === SAFETY NET ===
        // Batas minimum kalori harian untuk menjaga kesehatan:
        // - Wanita: 1200 kkal — di bawah ini berisiko malnutrisi
        // - Pria: 1500 kkal — di bawah ini berisiko kehilangan otot
        $minimumCalories = strtolower($gender) === 'male' ? 1500 : 1200;

        // Terapkan batas minimum jika target terlalu rendah
        if ($targetCalories < $minimumCalories) {
            $targetCalories = $minimumCalories;
        }

        // Bulatkan ke bilangan bulat terdekat (presisi kkal)
        $targetCalories = round($targetCalories);

        // Hitung defisit atau surplus harian (kkal/hari)
        // Negatif = defisit (turun berat), Positif = surplus (naik berat)
        $deficitSurplus = round($targetCalories - $tdee);

        // Estimasi perubahan berat badan per minggu
        // Rumus: (defisit_harian × 7 hari) / 7700 kkal per kg lemak
        // Contoh: defisit -500 kkal/hari → (-500 × 7) / 7700 = -0.45 kg/minggu
        $estimatedWeeklyChange = round(($deficitSurplus * 7) / 7700, 2);

        return [
            'target_calories'        => (int) $targetCalories,    // Target kkal per hari
            'deficit_surplus'        => (int) $deficitSurplus,    // Selisih dari TDEE
            'estimated_weekly_change' => $estimatedWeeklyChange,  // Estimasi kg/minggu
        ];
    }

    // ╔════════════════════════════════════════════════════════╗
    // ║  5. CALCULATE MACROS (Distribusi Makronutrien)         ║
    // ╚════════════════════════════════════════════════════════╝

    /**
     * Menghitung distribusi makronutrien (protein, karbohidrat, lemak).
     *
     * Distribusi disesuaikan berdasarkan kondisi medis klien:
     *
     *   Normal (sehat):
     *     Protein 25% | Karbo 50% | Lemak 25%
     *     → Distribusi seimbang untuk orang tanpa kondisi khusus
     *
     *   Diabetes / Resistensi Insulin:
     *     Protein 25% | Karbo 35% | Lemak 40%
     *     → Karbohidrat dikurangi untuk kontrol gula darah
     *     → Lemak sehat ditingkatkan sebagai sumber energi alternatif
     *
     *   PCOS (Polycystic Ovary Syndrome):
     *     Protein 30% | Karbo 40% | Lemak 30%
     *     → Protein tinggi untuk kontrol insulin dan rasa kenyang
     *
     *   Muscle Gain / Pembentukan Otot:
     *     Protein 35% | Karbo 50% | Lemak 15%
     *     → Protein sangat tinggi untuk sintesis otot
     *     → Karbo tinggi untuk energi latihan
     *
     * Konversi kalori ke gram:
     *   1g protein = 4 kkal
     *   1g karbohidrat = 4 kkal
     *   1g lemak = 9 kkal
     *
     * @param  float  $targetCalories     Target kalori harian
     * @param  string $targetType         Tujuan diet klien
     * @param  array  $medicalConditions  Daftar kondisi medis klien
     * @return array  ['protein_g', 'carb_g', 'fat_g', 'protein_pct', 'carb_pct', 'fat_pct']
     */
    public function calculateMacros(float $targetCalories, string $targetType, array $medicalConditions = []): array
    {
        // Default distribusi: 25% protein, 50% karbo, 25% lemak
        // Ini sesuai panduan gizi seimbang Kemenkes RI
        $proteinPct = 25;
        $carbPct    = 50;
        $fatPct     = 25;

        // Normalisasi array kondisi medis ke lowercase untuk pencocokan
        $conditions = array_map('strtolower', $medicalConditions);

        // === Penyesuaian berdasarkan kondisi medis ===
        // Urutan pengecekan: kondisi yang paling spesifik didahulukan

        if (in_array('diabetes', $conditions) || in_array('resistensi_insulin', $conditions)) {
            // Diabetes / Resistensi Insulin:
            // Kurangi karbo → kontrol gula darah
            // Tingkatkan lemak sehat → sumber energi stabil
            $proteinPct = 25;  // Protein tetap cukup: jaga massa otot
            $carbPct    = 35;  // Karbo rendah: cegah lonjakan gula darah
            $fatPct     = 40;  // Lemak tinggi: energi stabil & kenyang lebih lama
        } elseif (in_array('pcos', $conditions)) {
            // PCOS (Polycystic Ovary Syndrome):
            // Protein tinggi → bantu kontrol insulin & nafsu makan
            $proteinPct = 30;  // Protein tinggi: kontrol insulin
            $carbPct    = 40;  // Karbo moderate: hindari lonjakan insulin
            $fatPct     = 30;  // Lemak moderate: hormon seimbang
        }

        // Override untuk target muscle gain — protein prioritas
        if (in_array($targetType, ['gain_weight', 'gain', 'muscle_gain'])) {
            if (empty(array_intersect($conditions, ['diabetes', 'resistensi_insulin', 'pcos']))) {
                // Hanya override jika tidak ada kondisi medis khusus
                $proteinPct = 35;  // Protein sangat tinggi: sintesis otot maksimal
                $carbPct    = 50;  // Karbo tinggi: energi untuk latihan berat
                $fatPct     = 15;  // Lemak rendah: minimalkan penambahan lemak
            }
        }

        // === Konversi persentase ke gram ===

        // Kalori dari protein = target × persentase / 100
        // Gram protein = kalori_protein / 4 (1g protein = 4 kkal)
        $proteinCalories = $targetCalories * ($proteinPct / 100);
        $proteinGrams    = round($proteinCalories / 4);

        // Kalori dari karbohidrat = target × persentase / 100
        // Gram karbo = kalori_karbo / 4 (1g karbo = 4 kkal)
        $carbCalories = $targetCalories * ($carbPct / 100);
        $carbGrams    = round($carbCalories / 4);

        // Kalori dari lemak = target × persentase / 100
        // Gram lemak = kalori_lemak / 9 (1g lemak = 9 kkal)
        $fatCalories = $targetCalories * ($fatPct / 100);
        $fatGrams    = round($fatCalories / 9);

        return [
            'protein_g'   => (int) $proteinGrams,  // Gram protein per hari
            'carb_g'      => (int) $carbGrams,      // Gram karbohidrat per hari
            'fat_g'       => (int) $fatGrams,       // Gram lemak per hari
            'protein_pct' => $proteinPct,           // Persentase protein
            'carb_pct'    => $carbPct,              // Persentase karbohidrat
            'fat_pct'     => $fatPct,               // Persentase lemak
        ];
    }

    // ╔════════════════════════════════════════════════════════╗
    // ║  6. CALCULATE ALL (Kalkulasi Lengkap dari Data Klien) ║
    // ╚════════════════════════════════════════════════════════╝

    /**
     * Menjalankan semua kalkulasi sekaligus dari data klien lengkap.
     *
     * Method ini mengkoordinasikan seluruh pipeline kalkulasi:
     * 1. Hitung BMI dari berat dan tinggi
     * 2. Hitung BMR dari berat, tinggi, usia, gender
     * 3. Hitung TDEE dari BMR dan level aktivitas
     * 4. Hitung target kalori dari TDEE dan tujuan diet
     * 5. Hitung distribusi makro dari target kalori dan kondisi medis
     *
     * Setelah semua dihitung, hasilnya otomatis disimpan ke tabel
     * client_profiles di database.
     *
     * @param  array  $clientData  Data klien yang diperlukan:
     *   [
     *     'user_id'             => int,      // ID user di tabel users
     *     'weight_kg'           => float,    // Berat badan (kg)
     *     'height_cm'           => float,    // Tinggi badan (cm)
     *     'age'                 => int,      // Usia (tahun)
     *     'gender'              => string,   // 'male' atau 'female'
     *     'activity_level'      => string,   // Level aktivitas
     *     'target_type'         => string,   // Tujuan diet
     *     'medical_conditions'  => array,    // Kondisi medis (opsional)
     *     'target_weight_kg'    => float,    // Target berat (opsional)
     *     'allergies'           => array,    // Alergi makanan (opsional)
     *     'dietary_preferences' => array,    // Preferensi diet (opsional)
     *   ]
     *
     * @return array  Seluruh hasil kalkulasi + data profil yang tersimpan
     */
    public function calculateAll(array $clientData): array
    {
        // ── Langkah 1: Hitung BMI ──────────────────────────
        // BMI digunakan untuk menentukan status gizi awal klien
        $bmiResult = $this->calculateBMI(
            $clientData['weight_kg'],   // Berat badan klien
            $clientData['height_cm']    // Tinggi badan klien
        );

        // ── Langkah 2: Hitung BMR ──────────────────────────
        // BMR adalah kalori basal tubuh saat istirahat total
        $bmr = $this->calculateBMR(
            $clientData['weight_kg'],   // Berat → kalori untuk metabolisme
            $clientData['height_cm'],   // Tinggi → luas permukaan tubuh
            $clientData['age'],         // Usia → perlambatan metabolisme
            $clientData['gender']       // Gender → perbedaan komposisi tubuh
        );

        // ── Langkah 3: Hitung TDEE ─────────────────────────
        // TDEE = BMR × multiplier aktivitas (total kalori harian)
        $tdee = $this->calculateTDEE(
            $bmr,                           // BMR sebagai baseline
            $clientData['activity_level']   // Level aktivitas fisik harian
        );

        // ── Langkah 4: Hitung Target Kalori ────────────────
        // Tentukan target kalori berdasarkan tujuan diet klien
        $dietTarget = $this->calculateDietTarget(
            $tdee,                      // TDEE sebagai basis perhitungan
            $clientData['target_type'], // Tujuan: turun/naik/maintain
            $clientData['gender']       // Gender untuk batas minimum kalori
        );

        // ── Langkah 5: Hitung Distribusi Makro ─────────────
        // Bagi target kalori ke protein, karbo, dan lemak
        $macros = $this->calculateMacros(
            $dietTarget['target_calories'],          // Target kkal sebagai total
            $clientData['target_type'],              // Tujuan diet mempengaruhi rasio
            $clientData['medical_conditions'] ?? []  // Kondisi medis ubah distribusi
        );

        // ── Langkah 6: Simpan ke Database ──────────────────
        // Update atau buat profil klien di tabel client_profiles
        // Menggunakan updateOrCreate: jika sudah ada → update, belum → buat baru
        $profile = ClientProfile::updateOrCreate(
            // Kondisi pencarian: cari berdasarkan user_id
            ['user_id' => $clientData['user_id']],
            // Data yang disimpan/diperbarui:
            [
                'height_cm'           => $clientData['height_cm'],
                'weight_kg'           => $clientData['weight_kg'],
                'age'                 => $clientData['age'],
                'gender'              => $clientData['gender'],
                'activity_level'      => $clientData['activity_level'],
                'target_type'         => $clientData['target_type'],
                'target_weight_kg'    => $clientData['target_weight_kg'] ?? null,
                'medical_conditions'  => $clientData['medical_conditions'] ?? [],
                'allergies'           => $clientData['allergies'] ?? [],
                'dietary_preferences' => $clientData['dietary_preferences'] ?? [],
                // Simpan hasil kalkulasi ke kolom tabel
                'bmi'                 => $bmiResult['bmi'],
                'bmr'                 => $bmr,
                'tdee'                => $tdee,
                'calorie_target'      => $dietTarget['target_calories'],
            ]
        );

        // ── Langkah 7: Buat Log Berat Awal ─────────────────
        // Catat berat badan pertama sebagai baseline tracking
        WeightLog::updateOrCreate(
            [
                'client_id' => $clientData['user_id'],
                'date'      => Carbon::today()->toDateString(),
            ],
            [
                'weight_kg' => $clientData['weight_kg'],
                'notes'     => 'Data awal onboarding',
            ]
        );

        // ── Return Semua Hasil ─────────────────────────────
        // Gabungkan semua hasil kalkulasi dalam satu response array
        return [
            'profile_id'  => $profile->id,       // ID profil yang tersimpan
            'bmi'         => $bmiResult,          // Hasil BMI + kategori
            'bmr'         => round($bmr, 2),      // Nilai BMR (kkal/hari)
            'tdee'        => round($tdee, 2),     // Nilai TDEE (kkal/hari)
            'diet_target' => $dietTarget,         // Target kalori + estimasi
            'macros'      => $macros,             // Distribusi makronutrien
            'saved_to_db' => true,                // Konfirmasi data tersimpan
        ];
    }

    // ╔════════════════════════════════════════════════════════╗
    // ║  7. CHECK PROGRESS ALERT (Monitoring Progres)         ║
    // ╚════════════════════════════════════════════════════════╝

    /**
     * Memeriksa progres berat badan klien dan memberikan alert.
     *
     * Membandingkan berat badan minggu ini vs minggu sebelumnya
     * untuk mendeteksi 3 kondisi:
     *
     *   1. STAGNAN (2+ minggu tanpa perubahan signifikan)
     *      → Perlu evaluasi ulang diet/aktivitas
     *
     *   2. TURUN TERLALU CEPAT (>1.5 kg/minggu)
     *      → Risiko kehilangan otot, gallstones, malnutrisi
     *      → Rekomendasi: kurangi defisit kalori
     *
     *   3. SESUAI TARGET (0.25 - 1.5 kg/minggu)
     *      → Progres ideal, terus lanjutkan program
     *
     * @param  int    $clientId  User ID klien yang dicek
     * @return ?array Alert info atau null jika data belum cukup
     *   [
     *     'type'           => 'warning' | 'danger' | 'success',
     *     'title'          => string,
     *     'message'        => string,
     *     'current_weight' => float,
     *     'previous_weight'=> float,
     *     'change_kg'      => float,
     *   ]
     */
    public function checkProgressAlert(int $clientId): ?array
    {
        // Ambil log berat badan 3 minggu terakhir, urut dari terbaru
        // Kita butuh minimal 2 data point untuk membandingkan
        $recentLogs = WeightLog::where('client_id', $clientId)
            ->orderBy('date', 'desc')  // Terbaru di atas
            ->limit(21)               // Maksimal 3 minggu × 7 hari
            ->get();

        // Jika belum ada 2 data point, tidak bisa membandingkan
        if ($recentLogs->count() < 2) {
            return null; // Belum cukup data untuk alert
        }

        // Ambil berat terbaru (minggu ini)
        $currentWeight = $recentLogs->first()->weight_kg;

        // Ambil berat 1 minggu lalu (entri ke-7 atau terakhir yang tersedia)
        // Cari log yang tanggalnya ≥ 7 hari sebelum tanggal terbaru
        $latestDate  = Carbon::parse($recentLogs->first()->date);
        $oneWeekAgo  = $latestDate->copy()->subDays(7);

        // Cari log berat yang paling dekat dengan 1 minggu lalu
        $previousLog = $recentLogs->first(function ($log) use ($oneWeekAgo) {
            return Carbon::parse($log->date)->lte($oneWeekAgo);
        });

        // Jika tidak ada data 1 minggu lalu, gunakan data terakhir yang ada
        if (!$previousLog) {
            $previousLog = $recentLogs->last();
        }

        $previousWeight = $previousLog->weight_kg;

        // Hitung perubahan berat: negatif = turun, positif = naik
        $changeKg = round($currentWeight - $previousWeight, 2);

        // Hitung berapa hari antara 2 data point
        $daysDiff = Carbon::parse($previousLog->date)->diffInDays($latestDate);

        // Normalisasi perubahan ke per minggu jika periode bukan tepat 7 hari
        $weeklyChange = $daysDiff > 0
            ? round(($changeKg / $daysDiff) * 7, 2)
            : $changeKg;

        // === Cek kondisi: Stagnan 2+ Minggu ===
        // Ambil log 2 minggu lalu untuk cek stagnasi
        $twoWeeksAgo = $latestDate->copy()->subDays(14);
        $twoWeekLog  = $recentLogs->first(function ($log) use ($twoWeeksAgo) {
            return Carbon::parse($log->date)->lte($twoWeeksAgo);
        });

        // Definisi stagnan: perubahan < 0.3 kg dalam 2 minggu
        $isStagnant = false;
        if ($twoWeekLog) {
            $twoWeekChange = abs($currentWeight - $twoWeekLog->weight_kg);
            // Kurang dari 0.3 kg dalam 2 minggu = dianggap stagnan
            $isStagnant = $twoWeekChange < 0.3;
        }

        // === Tentukan Jenis Alert ===

        if ($isStagnant) {
            // ALERT: Berat badan stagnan 2+ minggu
            // Kemungkinan penyebab: adaptasi metabolik, retensi air, plateau
            return [
                'type'            => 'warning',
                'title'           => 'Berat Badan Stagnan',
                'message'         => 'Berat badan Anda tidak berubah signifikan dalam 2 minggu terakhir. '
                                   . 'Pertimbangkan untuk mengevaluasi ulang pola makan atau menambah aktivitas fisik.',
                'current_weight'  => (float) $currentWeight,
                'previous_weight' => (float) $previousWeight,
                'change_kg'       => $weeklyChange,
            ];
        }

        if ($weeklyChange < -1.5) {
            // ALERT: Penurunan terlalu cepat (lebih dari 1.5 kg/minggu)
            // Risiko: kehilangan massa otot, batu empedu, defisiensi nutrisi
            return [
                'type'            => 'danger',
                'title'           => 'Penurunan Terlalu Cepat!',
                'message'         => 'Anda kehilangan ' . abs($weeklyChange) . ' kg/minggu. '
                                   . 'Penurunan yang aman adalah 0.5-1 kg per minggu. '
                                   . 'Silakan konsultasi dengan ahli gizi untuk menyesuaikan program Anda.',
                'current_weight'  => (float) $currentWeight,
                'previous_weight' => (float) $previousWeight,
                'change_kg'       => $weeklyChange,
            ];
        }

        if ($weeklyChange < -0.25) {
            // ALERT: Penurunan berat sesuai target (0.25 - 1.5 kg/minggu)
            // Ini adalah range penurunan berat badan yang aman dan berkelanjutan
            return [
                'type'            => 'success',
                'title'           => 'Progres Bagus! 🎉',
                'message'         => 'Anda berhasil turun ' . abs($weeklyChange) . ' kg minggu ini. '
                                   . 'Pertahankan pola makan dan aktivitas fisik Anda!',
                'current_weight'  => (float) $currentWeight,
                'previous_weight' => (float) $previousWeight,
                'change_kg'       => $weeklyChange,
            ];
        }

        // Jika tidak masuk kategori manapun (naik sedikit, dsb),
        // tidak perlu memberikan alert khusus
        return null;
    }
}
