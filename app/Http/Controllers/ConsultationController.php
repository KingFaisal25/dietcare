<?php

namespace App\Http\Controllers;

use App\Mail\ConsultationConfirmationMail;
use App\Models\Consultation;
use App\Models\NutritionistProgram;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ConsultationController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/consultations/schedule
     * Buat jadwal konsultasi baru.
     */
    public function schedule(Request $request)
    {
        $validated = $request->validate([
            'scheduled_at'     => 'required|date|after:now',
            'type'             => 'required|in:video_call,chat',
            'duration_minutes' => 'nullable|integer|min:5|max:120',
            'notes'            => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        $program = NutritionistProgram::query()
            ->with(['nutritionist', 'client'])
            ->where('client_id', $user->id)
            ->where('status', 'active')
            ->latest('start_date')
            ->first();

        if (! $program) {
            return $this->error('Anda belum memiliki program aktif dengan ahli gizi.', 404);
        }

        if ($program->remaining_consultations !== null && $program->remaining_consultations <= 0) {
            return $this->error('Kuota konsultasi untuk program ini sudah habis.', 422);
        }

        $consultation = Consultation::create([
            'nutritionist_program_id' => $program->id,
            'type'                    => $validated['type'],
            'status'                  => 'scheduled',
            'scheduled_at'            => Carbon::parse($validated['scheduled_at']),
            'duration_minutes'        => $validated['duration_minutes'] ?? 30,
            'notes'                   => $validated['notes'],
        ]);

        // Kurangi sisa konsultasi jika ada kuota
        if ($program->remaining_consultations !== null) {
            $program->decrement('remaining_consultations');
        }

        // Kirim email konfirmasi
        try {
            if ($program->client?->email) {
                Mail::to($program->client->email)
                    ->send(new ConsultationConfirmationMail($consultation, $program));
            }

            if ($program->nutritionist?->email) {
                Mail::to($program->nutritionist->email)
                    ->send(new ConsultationConfirmationMail($consultation, $program));
            }
        } catch (\Throwable $e) {
            // Mail failure should not block the booking
            report($e);
        }

        return $this->success('Jadwal konsultasi berhasil dibuat.', [
            'consultation' => $this->transformConsultation($consultation, $program),
        ], 201);
    }

    /**
     * PUT /api/consultations/{id}/complete
     * Tandai konsultasi selesai.
     */
    public function complete(Request $request, int $id)
    {
        $consultation = Consultation::query()
            ->whereHas('nutritionistProgram', function ($query) use ($request) {
                $query->where('client_id', $request->user()->id)
                      ->orWhere('nutritionist_id', $request->user()->id);
            })
            ->findOrFail($id);

        $consultation->update([
            'status' => 'completed',
        ]);

        return $this->success('Konsultasi ditandai selesai.', [
            'id'     => $consultation->id,
            'status' => 'completed',
        ]);
    }

    /**
     * GET /api/consultations/upcoming
     * Daftar konsultasi yang akan datang + data profil untuk halaman konsultasi klien.
     */
    public function upcoming(Request $request)
    {
        $user = $request->user();

        $program = NutritionistProgram::query()
            ->with(['nutritionist', 'program'])
            ->where('client_id', $user->id)
            ->where('status', 'active')
            ->latest('start_date')
            ->first();

        if (! $program) {
            return $this->error('Anda belum memiliki program aktif.', 404);
        }

        $nutritionist = $program->nutritionist;
        $consultations = Consultation::query()
            ->where('nutritionist_program_id', $program->id)
            ->orderByDesc('scheduled_at')
            ->limit(20)
            ->get();

        $avgRating = $nutritionist
            ? $nutritionist->reviewsReceived()->avg('rating')
            : null;
        $reviewCount = $nutritionist
            ? $nutritionist->reviewsReceived()->count()
            : 0;

        return $this->success('Data konsultasi berhasil diambil.', [
            'client' => [
                'id'   => $user->id,
                'name' => $user->name,
            ],
            'nutritionist' => [
                'id'           => $nutritionist?->id,
                'name'         => $nutritionist?->name ?? 'Ahli Gizi',
                'avatar_url'   => $nutritionist?->avatar_url,
                'phone'        => $nutritionist?->phone,
                'program'      => $program->program?->name ?? 'Program Personal',
                'rating'       => $avgRating ? round((float) $avgRating, 1) : null,
                'review_count' => $reviewCount,
            ],
            'consultations' => $consultations->map(function (Consultation $c) {
                return [
                    'id'               => $c->id,
                    'type'             => $c->type,
                    'status'           => $c->status,
                    'scheduled_at'     => optional($c->scheduled_at)->toISOString(),
                    'duration_minutes' => $c->duration_minutes,
                    'notes'            => $c->notes,
                ];
            })->values(),
        ]);
    }

    private function transformConsultation(Consultation $c, NutritionistProgram $program): array
    {
        return [
            'id'               => $c->id,
            'type'             => $c->type,
            'status'           => $c->status,
            'scheduled_at'     => optional($c->scheduled_at)->toISOString(),
            'duration_minutes' => $c->duration_minutes,
            'notes'            => $c->notes,
            'client'           => [
                'id'   => $program->client?->id,
                'name' => $program->client?->name,
            ],
            'nutritionist'     => [
                'id'         => $program->nutritionist?->id,
                'name'       => $program->nutritionist?->name,
                'avatar_url' => $program->nutritionist?->avatar_url,
            ],
        ];
    }
}
