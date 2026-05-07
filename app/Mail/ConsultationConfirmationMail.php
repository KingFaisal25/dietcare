<?php

namespace App\Mail;

use App\Models\Consultation;
use App\Models\NutritionistProgram;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ConsultationConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Consultation $consultation;
    public NutritionistProgram $program;

    public function __construct(Consultation $consultation, NutritionistProgram $program)
    {
        $this->consultation = $consultation;
        $this->program = $program;
    }

    public function build()
    {
        $scheduledAt = Carbon::parse($this->consultation->scheduled_at);
        $type = $this->consultation->type === 'video_call' ? 'Video Call' : 'Chat';

        return $this->subject("Konfirmasi Konsultasi {$type} - DietCare")
                    ->html($this->buildHtml($scheduledAt, $type));
    }

    private function buildHtml(Carbon $scheduledAt, string $type): string
    {
        $clientName = $this->program->client?->name ?? 'Klien';
        $nutritionistName = $this->program->nutritionist?->name ?? 'Ahli Gizi';
        $date = $scheduledAt->translatedFormat('l, d F Y');
        $time = $scheduledAt->format('H:i') . ' WIB';
        $duration = $this->consultation->duration_minutes ?? 30;

        return <<<HTML
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8faf9;">
            <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e8f0eb;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #16a361; font-size: 24px; margin: 0;">✅ Konsultasi Terjadwal</h1>
                </div>

                <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                    Halo! Jadwal konsultasi <strong>{$type}</strong> telah berhasil dibuat:
                </p>

                <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 6px 0; color: #6b7280;">Klien</td><td style="padding: 6px 0; font-weight: 600;">{$clientName}</td></tr>
                        <tr><td style="padding: 6px 0; color: #6b7280;">Ahli Gizi</td><td style="padding: 6px 0; font-weight: 600;">{$nutritionistName}</td></tr>
                        <tr><td style="padding: 6px 0; color: #6b7280;">Tipe</td><td style="padding: 6px 0; font-weight: 600;">{$type}</td></tr>
                        <tr><td style="padding: 6px 0; color: #6b7280;">Tanggal</td><td style="padding: 6px 0; font-weight: 600;">{$date}</td></tr>
                        <tr><td style="padding: 6px 0; color: #6b7280;">Waktu</td><td style="padding: 6px 0; font-weight: 600;">{$time}</td></tr>
                        <tr><td style="padding: 6px 0; color: #6b7280;">Durasi</td><td style="padding: 6px 0; font-weight: 600;">{$duration} menit</td></tr>
                    </table>
                </div>

                <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 24px;">
                    DietCare — Konsultasi Gizi Online
                </p>
            </div>
        </div>
        HTML;
    }
}
