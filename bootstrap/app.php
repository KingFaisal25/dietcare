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
            User::role('client')->each(function ($user) {
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
            User::role('client')->each(function ($user) {
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
            User::role('client')->each(function ($user) {
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
            $consultations = Consultation::where('status', 'scheduled')
                ->whereBetween('scheduled_at', [now(), now()->addHour()])
                ->get();
            
            foreach ($consultations as $consultation) {
                // Send to Client
                dispatch(new SendReminderJob(
                    $consultation->user_id, 
                    'consultation_reminder', 
                    'Konsultasi Segera Dimulai', 
                    'Konsultasi video call kamu mulai dalam 1 jam!',
                    ['consultation_id' => $consultation->id]
                ));
                // Send to Nutritionist
                dispatch(new SendReminderJob(
                    $consultation->nutritionist_id, 
                    'consultation_reminder', 
                    'Konsultasi Segera Dimulai', 
                    'Konsultasi video call dengan klien mulai dalam 1 jam!',
                    ['consultation_id' => $consultation->id]
                ));
            }
        })->everyFifteenMinutes();

        // e. Notif program hampir habis — 7 hari sebelum expired
        $schedule->call(function () {
            $programs = NutritionistProgram::where('status', 'active')
                ->whereDate('end_date', Carbon::today()->addDays(7))
                ->get();

            foreach ($programs as $program) {
                dispatch(new SendReminderJob(
                    $program->user_id, 
                    'program_expiring', 
                    'Program Hampir Selesai', 
                    'Program kamu akan selesai dalam 7 hari. Mau lanjut?',
                    ['program_id' => $program->id]
                ));
            }
        })->daily();
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'admin' => \App\Http\Middleware\AdminOnly::class,
            'nutritionist' => \App\Http\Middleware\NutritionistOnly::class,
            'client' => \App\Http\Middleware\ClientOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
