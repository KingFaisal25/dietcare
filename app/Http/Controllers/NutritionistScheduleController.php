<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\NutritionistScheduleSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NutritionistScheduleController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $validated = $request->validate([
            'week_start' => 'nullable|date',
        ]);

        $nutritionistId = $request->user()->id;
        $weekStart = isset($validated['week_start'])
            ? Carbon::parse($validated['week_start'])->startOfWeek(Carbon::MONDAY)
            : now()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $weekStart->copy()->endOfWeek(Carbon::SUNDAY);

        $settings = NutritionistScheduleSetting::query()
            ->where('nutritionist_id', $nutritionistId)
            ->get()
            ->keyBy('weekday');

        $availability = collect(range(0, 6))->map(function (int $weekday) use ($settings) {
            return [
                'weekday' => $weekday,
                'availability' => $settings->get($weekday)?->availability ?? $this->defaultAvailability($weekday),
            ];
        })->values();

        $bookedSlots = Consultation::query()
            ->with('nutritionistProgram.client')
            ->whereHas('nutritionistProgram', function ($query) use ($nutritionistId) {
                $query->where('nutritionist_id', $nutritionistId);
            })
            ->whereBetween('scheduled_at', [$weekStart->copy()->startOfDay(), $weekEnd->copy()->endOfDay()])
            ->orderBy('scheduled_at')
            ->get()
            ->map(function (Consultation $consultation) use ($weekStart) {
                $scheduledAt = Carbon::parse($consultation->scheduled_at);

                return [
                    'id' => $consultation->id,
                    'client_id' => $consultation->nutritionistProgram?->client?->id,
                    'client_name' => $consultation->nutritionistProgram?->client?->name ?? 'Klien',
                    'day_index' => $weekStart->copy()->startOfDay()->diffInDays($scheduledAt->copy()->startOfDay()),
                    'date' => $scheduledAt->toDateString(),
                    'time' => $scheduledAt->format('H:i'),
                    'type' => $consultation->type,
                    'status' => $consultation->status,
                    'duration_minutes' => $consultation->duration_minutes,
                ];
            })
            ->filter(fn (array $slot) => $slot['day_index'] >= 0 && $slot['day_index'] <= 6)
            ->values();

        return $this->success('Jadwal ahli gizi berhasil diambil.', [
            'week_start' => $weekStart->toDateString(),
            'week_end' => $weekEnd->toDateString(),
            'availability' => $availability,
            'booked_slots' => $bookedSlots,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array|size:7',
            'settings.*.weekday' => 'required|integer|min:0|max:6',
            'settings.*.availability' => 'required|in:active,slow,off',
        ]);

        $nutritionistId = $request->user()->id;

        NutritionistScheduleSetting::upsert(
            collect($validated['settings'])->map(fn (array $setting) => [
                'nutritionist_id' => $nutritionistId,
                'weekday' => $setting['weekday'],
                'availability' => $setting['availability'],
                'created_at' => now(),
                'updated_at' => now(),
            ])->all(),
            ['nutritionist_id', 'weekday'],
            ['availability', 'updated_at']
        );

        return $this->success('Jadwal ahli gizi berhasil diperbarui.', [
            'settings' => collect($validated['settings'])->sortBy('weekday')->values(),
        ]);
    }

    private function defaultAvailability(int $weekday): string
    {
        return match ($weekday) {
            5 => 'slow',
            6 => 'off',
            default => 'active',
        };
    }
}
