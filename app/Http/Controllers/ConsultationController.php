<?php

namespace App\Http\Controllers;

use App\Application\DTOs\CreateConsultationDTO;
use App\Application\Services\ConsultationService;
use App\Mail\ConsultationConfirmationMail;
use App\Models\Consultation;
use App\Models\NutritionistProgram;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ConsultationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ConsultationService $consultationService,
    ) {}

    /**
     * POST /api/consultations/schedule
     * Schedule a new consultation.
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

        $dto = CreateConsultationDTO::fromArray([
            'nutritionist_program_id' => $program->id,
            'type'                    => $validated['type'],
            'scheduled_at'            => $validated['scheduled_at'],
            'duration_minutes'        => $validated['duration_minutes'] ?? 30,
            'notes'                   => $validated['notes'] ?? null,
        ]);

        $consultation = $this->consultationService->schedule($dto);

        // Decrement remaining consultations if there's a quota
        if ($program->remaining_consultations !== null) {
            $program->decrement('remaining_consultations');
        }

        // Send confirmation emails
        $eloquentConsultation = Consultation::find($consultation->id);
        if ($eloquentConsultation) {
            $this->sendConfirmationEmails($eloquentConsultation, $program);
        }

        return $this->success('Jadwal konsultasi berhasil dibuat.', [
            'consultation' => $this->transformConsultation($consultation, $program),
        ], 201);
    }

    /**
     * PUT /api/consultations/{id}/complete
     * Mark a consultation as completed.
     */
    public function complete(Request $request, int $id)
    {
        $consultation = Consultation::with('nutritionistProgram')->findOrFail($id);

        $this->authorize('complete', $consultation);

        try {
            $this->consultationService->complete($id);
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success('Konsultasi ditandai selesai.', [
            'id'     => $consultation->id,
            'status' => 'completed',
        ]);
    }

    /**
     * GET /api/consultations/upcoming
     * Get upcoming consultations and client/nutritionist profile data.
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

    /**
     * Send confirmation emails for a newly scheduled consultation.
     */
    private function sendConfirmationEmails(Consultation $consultation, NutritionistProgram $program): void
    {
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
    }

    /**
     * Transform a domain consultation entity for API response.
     */
    private function transformConsultation(object $c, NutritionistProgram $program): array
    {
        return [
            'id'               => $c->id,
            'type'             => is_object($c->type) ? $c->type : $c->type,
            'status'           => is_object($c->status) ? $c->status->value : $c->status,
            'scheduled_at'     => $c->scheduledAt instanceof \DateTimeImmutable
                ? $c->scheduledAt->format('c')
                : (is_string($c->scheduledAt ?? null) ? $c->scheduledAt : optional($c->scheduled_at ?? null)?->toISOString()),
            'duration_minutes' => $c->durationMinutes ?? $c->duration_minutes ?? 30,
            'notes'            => $c->notes ?? null,
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
