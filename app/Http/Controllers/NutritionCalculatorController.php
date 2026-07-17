<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ApiResponse;
use App\Services\NutritionCalculator;
use Illuminate\Http\Request;

/**
 * NutritionCalculatorController
 *
 * Controller ini menangani request untuk kalkulasi gizi
 * dan monitoring progres klien. Memanggil NutritionCalculator
 * service untuk semua logika bisnis.
 */
class NutritionCalculatorController extends Controller
{
    use ApiResponse;

    /**
     * Instance NutritionCalculator service.
     * Di-inject melalui constructor (Dependency Injection).
     */
    protected NutritionCalculator $calculator;

    public function __construct(NutritionCalculator $calculator)
    {
        // Laravel secara otomatis meng-inject NutritionCalculator
        // melalui Service Container (IoC Container)
        $this->calculator = $calculator;
    }

    // ──────────────────────────────────────────────────────────
    //  POST /api/client/onboarding — Submit data awal klien
    // ──────────────────────────────────────────────────────────

    /**
     * Menerima data onboarding klien, menjalankan semua kalkulasi,
     * dan menyimpan hasilnya ke database.
     *
     * Dipanggil saat klien pertama kali mengisi form profil
     * setelah registrasi (onboarding flow).
     */
    public function onboarding(Request $request)
    {
        // Validasi semua input dari form onboarding
        $validated = $request->validate([
            'weight_kg'           => 'required|numeric|min:20|max:300',    // Berat (kg): 20-300
            'height_cm'           => 'required|numeric|min:100|max:250',   // Tinggi (cm): 100-250
            'age'                 => 'required|integer|min:10|max:100',    // Usia (tahun): 10-100
            'gender'              => 'required|in:male,female',            // Jenis kelamin
            'activity_level'      => 'required|in:sedentary,light,moderate,active,very_active',
            'target_type'         => 'required|in:lose,gain,maintain,body_recomp', // Tujuan diet
            'target_weight_kg'    => 'nullable|numeric|min:30|max:200',    // Target berat (opsional)
            'medical_conditions'  => 'nullable|array',                     // Kondisi medis (array)
            'medical_conditions.*'=> 'string|max:100',                     // Setiap item: string
            'allergies'           => 'nullable|array',                     // Alergi makanan
            'allergies.*'         => 'string|max:100',
            'dietary_preferences' => 'nullable|array',                     // Preferensi diet
            'dietary_preferences.*' => 'string|max:100',
        ]);

        // Tambahkan user_id dari user yang sedang login (auth:sanctum)
        $validated['user_id'] = $request->user()->id;

        try {
            // Jalankan semua kalkulasi melalui NutritionCalculator service
            // Service akan: BMI → BMR → TDEE → Target → Macros → Save DB
            $result = $this->calculator->calculateAll($validated);

            // Return response sukses dengan semua hasil kalkulasi
            return $this->success(
                'Profil gizi berhasil dihitung dan disimpan.',
                $result,
                201
            );
        } catch (\InvalidArgumentException $e) {
            // Tangkap error validasi dari service (berat/tinggi negatif, dll)
            return $this->error($e->getMessage(), 422);
        } catch (\Exception $e) {
            // Tangkap error tak terduga lainnya
            return $this->error('Terjadi kesalahan saat menghitung profil gizi.', 500);
        }
    }

    // ──────────────────────────────────────────────────────────
    //  PUT /api/client/profile/recalculate — Hitung ulang
    // ──────────────────────────────────────────────────────────

    /**
     * Hitung ulang profil gizi klien (misalnya setelah update berat badan
     * atau perubahan level aktivitas).
     */
    public function recalculate(Request $request)
    {
        // Validasi — sama seperti onboarding tapi semua field opsional
        $validated = $request->validate([
            'weight_kg'           => 'sometimes|required|numeric|min:20|max:300',
            'height_cm'           => 'sometimes|required|numeric|min:100|max:250',
            'age'                 => 'sometimes|required|integer|min:10|max:100',
            'gender'              => 'sometimes|required|in:male,female',
            'activity_level'      => 'sometimes|required|in:sedentary,light,moderate,active,very_active',
            'target_type'         => 'sometimes|required|in:lose,gain,maintain,body_recomp',
            'target_weight_kg'    => 'nullable|numeric|min:30|max:200',
            'medical_conditions'  => 'nullable|array',
            'medical_conditions.*'=> 'string|max:100',
            'allergies'           => 'nullable|array',
            'allergies.*'         => 'string|max:100',
            'dietary_preferences' => 'nullable|array',
            'dietary_preferences.*' => 'string|max:100',
        ]);

        $user = $request->user();

        // Ambil data profil yang sudah ada di database
        $existingProfile = $user->clientProfile;

        if (!$existingProfile) {
            return $this->error('Profil belum ada. Silakan isi onboarding terlebih dahulu.', 404);
        }

        // Merge data lama dengan data baru (data baru override data lama)
        $clientData = array_merge(
            $existingProfile->toArray(),  // Data lama dari database
            $validated,                   // Data baru dari request
            ['user_id' => $user->id]      // Pastikan user_id benar
        );

        try {
            $result = $this->calculator->calculateAll($clientData);
            return $this->success('Profil gizi berhasil dihitung ulang.', $result);
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        } catch (\Exception $e) {
            return $this->error('Terjadi kesalahan saat menghitung ulang profil gizi.', 500);
        }
    }

    // ──────────────────────────────────────────────────────────
    //  POST /api/client/calculate/bmi — Hitung BMI saja
    // ──────────────────────────────────────────────────────────

    /**
     * Endpoint untuk menghitung BMI saja (tanpa simpan ke DB).
     * Berguna untuk kalkulator publik atau quick check.
     */
    public function calculateBMI(Request $request)
    {
        $validated = $request->validate([
            'weight_kg' => 'required|numeric|min:20|max:300',
            'height_cm' => 'required|numeric|min:100|max:250',
        ]);

        try {
            $result = $this->calculator->calculateBMI(
                $validated['weight_kg'],
                $validated['height_cm']
            );
            return $this->success('BMI berhasil dihitung.', $result);
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    // ──────────────────────────────────────────────────────────
    //  GET /api/client/progress/alert — Cek alert progres
    // ──────────────────────────────────────────────────────────

    /**
     * Mengecek status progres berat badan klien dan
     * mengembalikan alert jika ada (stagnan, turun terlalu cepat, dll).
     */
    public function progressAlert(Request $request)
    {
        $userId = $request->user()->id;

        $alert = $this->calculator->checkProgressAlert($userId);

        if ($alert === null) {
            return $this->success(
                'Tidak ada alert progres saat ini.',
                ['has_alert' => false]
            );
        }

        return $this->success(
            'Alert progres ditemukan.',
            array_merge(['has_alert' => true], $alert)
        );
    }

    // ──────────────────────────────────────────────────────────
    //  GET /api/client/profile — Lihat profil gizi
    // ──────────────────────────────────────────────────────────

    /**
     * Mengembalikan profil gizi klien yang sudah tersimpan di database.
     * Termasuk semua data kalkulasi (BMI, BMR, TDEE, target kalori).
     */
    public function getProfile(Request $request)
    {
        $profile = $request->user()->clientProfile;

        if (!$profile) {
            return $this->error('Profil gizi belum diisi. Silakan lengkapi onboarding.', 404);
        }

        $macros = null;
        if ($profile->calorie_target) {
            $macros = $this->calculator->calculateMacros(
                (float) $profile->calorie_target,
                $profile->target_type,
                $profile->medical_conditions ?? []
            );
        }

        return $this->success('Profil gizi berhasil diambil.', [
            'profile' => $profile,
            'macros'  => $macros,
        ]);
    }
}
