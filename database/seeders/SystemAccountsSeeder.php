<?php

namespace Database\Seeders;

use App\Models\ClientProfile;
use App\Models\NutritionistProfile;
use App\Models\NutritionistSchedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Akun sistem utama — dipakai di local & production.
 *
 * Kredensial diatur lewat .env (jangan hardcode password di kode).
 * Password hanya di-set saat akun baru dibuat, kecuali SEED_RESET_PASSWORDS=true.
 */
class SystemAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $resetPasswords = filter_var(env('SEED_RESET_PASSWORDS', false), FILTER_VALIDATE_BOOL);

        if (app()->environment('production') && empty(env('ADMIN_PASSWORD'))) {
            $this->command?->error('ADMIN_PASSWORD wajib di-set di .env sebelum seed production.');
            return;
        }

        // ── 1. Administrator (wajib di production) ─────────────────
        $admin = $this->seedAccount(
            role: 'admin',
            email: env('ADMIN_EMAIL', 'admin@dietcare.com'),
            username: env('ADMIN_USERNAME', 'admin'),
            name: env('ADMIN_NAME', 'Administrator DietCare'),
            password: env('ADMIN_PASSWORD', 'dietcare123'),
            phone: env('ADMIN_PHONE', '081111111111'),
            resetPasswords: $resetPasswords,
        );

        // ── 2. Ahli Gizi ───────────────────────────────────────────
        $nutritionist = $this->seedAccount(
            role: 'nutritionist',
            email: env('NUTRITIONIST_EMAIL', 'gizi@dietcare.com'),
            username: env('NUTRITIONIST_USERNAME', 'gizi'),
            name: env('NUTRITIONIST_NAME', 'Tim Ahli Gizi'),
            password: env('NUTRITIONIST_PASSWORD', env('ADMIN_PASSWORD', 'dietcare123')),
            phone: env('NUTRITIONIST_PHONE', '082222222222'),
            resetPasswords: $resetPasswords,
        );

        NutritionistProfile::updateOrCreate(
            ['user_id' => $nutritionist->id],
            [
                'slug' => env('NUTRITIONIST_SLUG', 'tim-ahli-gizi'),
                'title' => 'S.Gz',
                'str_number' => env('NUTRITIONIST_STR', '1234567890123456'),
                'bio' => 'Ahli gizi profesional DietCare — konsultasi gizi personal.',
                'years_experience' => 5,
                'city' => 'Jakarta',
                'specializations' => ['Penurunan BB', 'Gizi Klinis', 'Nutrisi Kehamilan'],
            ]
        );

        foreach (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as $day) {
            NutritionistSchedule::updateOrCreate(
                ['user_id' => $nutritionist->id, 'day_of_week' => $day],
                ['is_active' => true, 'start_time' => '09:00:00', 'end_time' => '17:00:00']
            );
        }

        // ── 3. Pasien contoh (opsional, untuk testing/staging) ───────
        if (filter_var(env('SEED_SAMPLE_PATIENT', true), FILTER_VALIDATE_BOOL)) {
            $patient = $this->seedAccount(
                role: 'patient',
                email: env('PATIENT_EMAIL', 'user@dietcare.com'),
                username: env('PATIENT_USERNAME', 'user'),
                name: env('PATIENT_NAME', 'Pasien Contoh'),
                password: env('PATIENT_PASSWORD', env('ADMIN_PASSWORD', 'dietcare123')),
                phone: env('PATIENT_PHONE', '083333333333'),
                resetPasswords: $resetPasswords,
            );

            ClientProfile::updateOrCreate(
                ['user_id' => $patient->id],
                [
                    'height_cm' => 170,
                    'weight_kg' => 70,
                    'age' => 28,
                    'gender' => 'male',
                    'activity_level' => 'moderate',
                    'target_type' => 'lose',
                ]
            );
        }

        $this->command?->info('System accounts ready.');
        $this->command?->table(
            ['Role', 'Username', 'Email'],
            [
                ['Admin', $admin->username, $admin->email],
                ['Ahli Gizi', $nutritionist->username, $nutritionist->email],
                filter_var(env('SEED_SAMPLE_PATIENT', true), FILTER_VALIDATE_BOOL)
                    ? ['Pasien', env('PATIENT_USERNAME', 'user'), env('PATIENT_EMAIL', 'user@dietcare.com')]
                    : ['Pasien', '(tidak di-seed)', '-'],
            ]
        );

        if (!app()->environment('production')) {
            $this->command?->warn('Local: password default dari .env (lihat ADMIN_PASSWORD).');
        } else {
            $this->command?->warn('Production: simpan ADMIN_PASSWORD di tempat aman. Jangan commit ke git.');
        }
    }

    private function seedAccount(
        string $role,
        string $email,
        string $username,
        string $name,
        string $password,
        string $phone,
        bool $resetPasswords,
    ): User {
        $user = User::where('email', $email)
            ->orWhere('username', $username)
            ->first();

        if (!$user) {
            $user = new User();
            $user->email = $email;
            $user->password = Hash::make($password);
        } elseif ($resetPasswords) {
            $user->password = Hash::make($password);
        }

        $user->fill([
            'name' => $name,
            'username' => $username,
            'email' => $email,
            'phone' => $phone,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ]);

        $user->save();
        $user->syncRoles([$role]);

        return $user;
    }
}
