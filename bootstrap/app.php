<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

use Illuminate\Console\Scheduling\Schedule;
use App\Models\User;
use App\Models\Consultation;
use App\Models\NutritionistProgram;
use App\Jobs\SendReminderJob;
use Carbon\Carbon;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule): void {
        // a. Reminder log makan sarapan — 07:00 WIB
        $schedule->call(function () {
            User::role('patient')->each(function ($user) {
                dispatch(new SendReminderJob(
                    $user->id, 
                    'meal_reminder', 
                    'Log Makan Sarapan', 
                    'Jangan lupa log sarapan kamu hari ini ya! 🍳'
                ));
            });
        })->dailyAt('07:00')->timezone('Asia/Jakarta');

        // b. Reminder log makan malam — 19:30 WIB
        $schedule->call(function () {
            User::role('patient')->each(function ($user) {
                dispatch(new SendReminderJob(
                    $user->id, 
                    'meal_reminder', 
                    'Lengkapi Catatan Makan', 
                    'Yuk lengkapi catatan makan kamu hari ini 🥗'
                ));
            });
        })->dailyAt('19:30')->timezone('Asia/Jakarta');

        // c. Reminder timbang badan — Senin 07:30 WIB
        $schedule->call(function () {
            User::role('patient')->each(function ($user) {
                dispatch(new SendReminderJob(
                    $user->id, 
                    'weight_reminder', 
                    'Hari Timbang!', 
                    'Hari ini hari timbang! Catat berat badanmu sekarang 📊'
                ));
            });
        })->weeklyOn(1, '07:30')->timezone('Asia/Jakarta');

        // d. Reminder konsultasi — 1 jam sebelum jadwal
        $schedule->call(function () {
            $consultations = Consultation::with('nutritionistProgram')
                ->where('status', 'scheduled')
                ->whereBetween('scheduled_at', [now(), now()->addHour()])
                ->get();
            
            foreach ($consultations as $consultation) {
                if ($consultation->nutritionistProgram) {
                    // Send to Client
                    dispatch(new SendReminderJob(
                        $consultation->nutritionistProgram->client_id, 
                        'consultation_reminder', 
                        'Konsultasi Segera Dimulai', 
                        'Konsultasi video call kamu mulai dalam 1 jam!',
                        ['consultation_id' => $consultation->id]
                    ));
                    // Send to Nutritionist
                    dispatch(new SendReminderJob(
                        $consultation->nutritionistProgram->nutritionist_id, 
                        'consultation_reminder', 
                        'Konsultasi Segera Dimulai', 
                        'Konsultasi video call dengan klien mulai dalam 1 jam!',
                        ['consultation_id' => $consultation->id]
                    ));
                }
            }
        })->everyFifteenMinutes();

        // e. Notif program hampir habis — 7 hari sebelum expired
        $schedule->call(function () {
            $programs = NutritionistProgram::where('status', 'active')
                ->whereDate('end_date', Carbon::today()->addDays(7))
                ->get();

            foreach ($programs as $program) {
                dispatch(new SendReminderJob(
                    $program->client_id, 
                    'program_expiring', 
                    'Program Hampir Selesai', 
                    'Program kamu akan selesai dalam 7 hari. Mau lanjut?',
                    ['program_id' => $program->id]
                ));
            }
        })->daily();
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->statefulApi();

        // JANGAN tambahkan XSRF-TOKEN ke except list.
        // Laravel perlu mengenkripsi cookie XSRF-TOKEN agar validasi X-XSRF-TOKEN header bisa bekerja.
        // VerifyCsrfToken::getTokenFromRequest() mendekripsi nilai X-XSRF-TOKEN header menggunakan encrypter.
        // Jika cookie tidak terenkripsi, dekripsi gagal → token kosong → 419 selalu.

        // Jangan tambahkan validateCsrfTokens(except: [...]) untuk route api karena
        // statefulApi() sudah menangani CSRF via EnsureFrontendRequestsAreStateful.
        // Route api/* tidak menggunakan web middleware, jadi validateCsrfTokens di web tidak berlaku.

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'prevent_role_escalation' => \App\Http\Middleware\PreventRoleEscalation::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
