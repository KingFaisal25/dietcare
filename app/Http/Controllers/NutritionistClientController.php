<?php

namespace App\Http\Controllers;

use App\Models\ClientMessage;
use App\Models\Consultation;
use App\Models\FoodDiaryEntry;
use App\Models\MealPlan;
use App\Models\NutritionistProgram;
use App\Models\NutritionistReview;
use App\Models\WeightLog;
use App\Services\NutritionCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NutritionistClientController extends Controller
{
    use ApiResponse;

    public function __construct(private NutritionCalculator $calculator)
    {
    }

    public function index(Request $request)
    {
        $nutritionistId = $request->user()->id;

        $programs = NutritionistProgram::query()
            ->with(['client.clientProfile', 'program'])
            ->where('nutritionist_id', $nutritionistId)
            ->where('status', 'active')
            ->orderBy('start_date')
            ->get();

        $clients = $programs->map(fn (NutritionistProgram $program) => $this->transformClientSummary($program))->filter()->values();
        $averageRating = NutritionistReview::query()
            ->where('nutritionist_id', $nutritionistId)
            ->avg('rating');
        $reviewCount = NutritionistReview::query()
            ->where('nutritionist_id', $nutritionistId)
            ->count();

        $consultationsToday = Consultation::query()
            ->whereHas('nutritionistProgram', function ($query) use ($nutritionistId) {
                $query->where('nutritionist_id', $nutritionistId);
            })
            ->whereDate('scheduled_at', today())
            ->count();

        $mealPlanPending = $clients
            ->filter(fn (array $client) => ! $client['has_meal_plan_today'])
            ->values();

        $clientsNeedAttention = $clients
            ->filter(fn (array $client) => $client['status'] === 'perlu perhatian')
            ->values();
        $unrepliedMessages = $this->unrepliedMessages($nutritionistId);

        return $this->success('Daftar klien aktif berhasil diambil.', [
            'stats' => [
                'total_active_clients' => $clients->count(),
                'consultations_today' => $consultationsToday,
                'clients_need_attention' => $clientsNeedAttention->count(),
                'average_rating' => $averageRating ? round((float) $averageRating, 1) : null,
                'review_count' => $reviewCount,
            ],
            'notifications' => [
                'meal_plan_pending' => [
                    'count' => $mealPlanPending->count(),
                    'items' => $mealPlanPending->map(fn (array $client) => [
                        'client_id' => $client['id'],
                        'name' => $client['name'],
                        'program' => $client['program'],
                        'current_day' => $client['current_day'],
                    ])->values(),
                ],
                'unreplied_messages' => [
                    'count' => $unrepliedMessages->count(),
                    'items' => $unrepliedMessages->values(),
                ],
            ],
            'clients' => $clients,
        ]);
    }

    public function show(Request $request, int $id)
    {
        $program = NutritionistProgram::query()
            ->with(['client.clientProfile', 'program'])
            ->where('nutritionist_id', $request->user()->id)
            ->where('client_id', $id)
            ->latest('start_date')
            ->first();

        if (! $program) {
            return $this->error('Klien tidak ditemukan atau tidak berada di bawah pendampingan Anda.', 404);
        }

        $client = $program->client;
        if (! $client) {
            return $this->error('Data klien tidak ditemukan atau tidak valid.', 404);
        }
        
        $profile = $client->clientProfile;
        $weightLogs = WeightLog::query()
            ->where('client_id', $client->id)
            ->orderByDesc('date')
            ->limit(52)
            ->get()
            ->sortBy('date')
            ->values();

        $initialWeight = WeightLog::query()
            ->where('client_id', $client->id)
            ->orderBy('date')
            ->value('weight_kg');

        $currentWeight = optional($weightLogs->last())->weight_kg ?? $profile?->weight_kg;
        $baselineWeight = $initialWeight ?? $profile?->weight_kg ?? $currentWeight ?? 0;
        $macros = $profile
            ? $this->calculator->calculateMacros(
                (float) $profile->calorie_target,
                $profile->target_type,
                $profile->medical_conditions ?? []
            )
            : [
                'protein_g' => 0,
                'carb_g' => 0,
                'fat_g' => 0,
            ];

        $mealPlans = MealPlan::query()
            ->where('nutritionist_program_id', $program->id)
            ->orderBy('day_number')
            ->orderByRaw($this->mealOrderCase('meal_type'))
            ->get();

        $foodDiary = FoodDiaryEntry::query()
            ->where('user_id', $client->id)
            ->orderByDesc('eaten_at')
            ->limit(20)
            ->get();

        $consultations = Consultation::query()
            ->where('nutritionist_program_id', $program->id)
            ->orderByDesc('scheduled_at')
            ->get();
        $reviews = NutritionistReview::query()
            ->where('nutritionist_program_id', $program->id)
            ->orderByDesc('submitted_at')
            ->get();

        $notes = collect()
            ->merge($mealPlans->pluck('notes'))
            ->merge($consultations->pluck('notes'))
            ->merge($weightLogs->pluck('notes'))
            ->merge($reviews->pluck('review'))
            ->filter()
            ->unique()
            ->values();

        return $this->success('Detail klien berhasil diambil.', [
            'nutritionist_note' => $program->nutritionist_note,
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'avatar_url' => $client->avatar_url,
                'email' => $client->email,
                'age' => $profile?->age,
                'program' => $program->program?->name ?? 'Program Personal',
                'program_status' => $program->status,
                'current_day' => $this->currentDay($program),
                'program_duration_days' => $this->programDurationDays($program),
                'medical_conditions' => $profile?->medical_conditions ?? [],
                'allergies' => $profile?->allergies ?? [],
                'dietary_preferences' => $profile?->dietary_preferences ?? [],
                'target_type' => $profile?->target_type,
                'target_weight_kg' => $profile?->target_weight_kg,
            ],
            'calculations' => [
                'bmi' => (float) ($profile?->bmi ?? 0),
                'bmr' => (float) ($profile?->bmr ?? 0),
                'tdee' => (float) ($profile?->tdee ?? 0),
                'target_calories' => (float) ($profile?->calorie_target ?? 0),
                'macros' => [
                    'protein' => (float) ($macros['protein_g'] ?? 0),
                    'carbs' => (float) ($macros['carb_g'] ?? 0),
                    'fat' => (float) ($macros['fat_g'] ?? 0),
                ],
            ],
            'progress' => [
                'labels' => $weightLogs->map(fn (WeightLog $log) => Carbon::parse($log->date)->format('d M'))->values(),
                'weights' => $weightLogs->map(fn (WeightLog $log) => (float) $log->weight_kg)->values(),
                'current_weight' => (float) ($currentWeight ?? 0),
                'initial_weight' => (float) ($baselineWeight ?? 0),
                'change_kg' => round((float) (($currentWeight ?? 0) - ($baselineWeight ?? 0)), 2),
            ],
            'meal_plan' => $mealPlans
                ->groupBy('day_number')
                ->map(function ($items, $dayNumber) {
                    return [
                        'day_number' => (int) $dayNumber,
                        'total_calories' => round((float) $items->sum('calories'), 2),
                        'meals' => $items->map(function (MealPlan $meal) {
                            return [
                                'id' => $meal->id,
                                'meal_type' => $meal->meal_type,
                                'meal_type_label' => $this->mealTypeLabel($meal->meal_type),
                                'menu_name' => $meal->menu_name,
                                'ingredients' => $meal->ingredients ?? [],
                                'calories' => (float) ($meal->calories ?? 0),
                                'protein' => (float) ($meal->protein_g ?? 0),
                                'carbs' => (float) ($meal->carb_g ?? 0),
                                'fat' => (float) ($meal->fat_g ?? 0),
                                'notes' => $meal->notes,
                            ];
                        })->values(),
                    ];
                })
                ->values(),
            'food_diary' => $foodDiary->map(function (FoodDiaryEntry $entry) {
                return [
                    'id' => $entry->id,
                    'eaten_at' => Carbon::parse($entry->eaten_at)->toIso8601String(),
                    'meal_type' => $entry->meal_type,
                    'meal_type_label' => $this->mealTypeLabel($entry->meal_type),
                    'food_name_snapshot' => $entry->food_name_snapshot,
                    'quantity_gram' => (float) $entry->quantity_gram,
                    'calories' => (float) ($entry->calories ?? 0),
                    'protein' => (float) ($entry->protein ?? 0),
                    'carbs' => (float) ($entry->carbs ?? 0),
                    'fat' => (float) ($entry->fat ?? 0),
                ];
            })->values(),
            'notes' => $notes->map(fn ($note) => [
                'title' => 'Catatan ahli gizi',
                'content' => $note,
            ])->values(),
            'consultations' => $consultations->map(function (Consultation $consultation) {
                return [
                    'id' => $consultation->id,
                    'type' => $consultation->type,
                    'status' => $consultation->status,
                    'scheduled_at' => optional($consultation->scheduled_at)->toISOString(),
                    'duration_minutes' => $consultation->duration_minutes,
                    'notes' => $consultation->notes,
                ];
            })->values(),
            'review_summary' => [
                'average_rating' => $reviews->count() > 0 ? round((float) $reviews->avg('rating'), 1) : null,
                'review_count' => $reviews->count(),
                'latest_review' => $reviews->first()
                    ? [
                        'rating' => (int) $reviews->first()->rating,
                        'review' => $reviews->first()->review,
                        'submitted_at' => optional($reviews->first()->submitted_at)->toISOString(),
                    ]
                    : null,
            ],
        ]);
    }

    public function saveNote(Request $request, int $id)
    {
        $request->validate([
            'note' => ['nullable', 'string', 'max:10000'],
        ]);

        $program = NutritionistProgram::query()
            ->where('nutritionist_id', $request->user()->id)
            ->where('client_id', $id)
            ->latest('start_date')
            ->firstOrFail();

        $program->update(['nutritionist_note' => $request->input('note')]);

        return $this->success('Catatan berhasil disimpan.', [
            'nutritionist_note' => $program->nutritionist_note,
        ]);
    }

    public function getMessages(Request $request, int $id)
    {
        $program = NutritionistProgram::query()
            ->where('nutritionist_id', $request->user()->id)
            ->where('client_id', $id)
            ->latest('start_date')
            ->firstOrFail();

        $messages = $program->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn (ClientMessage $msg) => [
                'id'          => $msg->id,
                'sender_role' => $msg->sender_role,
                'message'     => $msg->message,
                'read_at'     => optional($msg->read_at)->toISOString(),
                'created_at'  => optional($msg->created_at)->toISOString(),
            ]);

        // Mark client messages as read
        $program->messages()
            ->where('sender_role', 'client')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->success('Pesan berhasil diambil.', $messages);
    }

    public function sendMessage(Request $request, int $id)
    {
        $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $program = NutritionistProgram::query()
            ->where('nutritionist_id', $request->user()->id)
            ->where('client_id', $id)
            ->latest('start_date')
            ->firstOrFail();

        $msg = $program->messages()->create([
            'sender_role' => 'nutritionist',
            'message'     => $request->input('message'),
        ]);

        return $this->success('Pesan berhasil dikirim.', [
            'id'          => $msg->id,
            'sender_role' => $msg->sender_role,
            'message'     => $msg->message,
            'read_at'     => null,
            'created_at'  => optional($msg->created_at)->toISOString(),
        ]);
    }

    private function transformClientSummary(NutritionistProgram $program): ?array
    {
        $client = $program->client;
        if (! $client) {
            return null;
        }
        
        $profile = $client->clientProfile;
        $latestWeight = WeightLog::query()
            ->where('client_id', $client->id)
            ->orderByDesc('date')
            ->value('weight_kg');

        $initialWeight = WeightLog::query()
            ->where('client_id', $client->id)
            ->orderBy('date')
            ->value('weight_kg');

        $currentDay = $this->currentDay($program);
        $alert = $this->calculator->checkProgressAlert($client->id);
        $currentWeight = (float) ($latestWeight ?? $profile?->weight_kg ?? 0);
        $baselineWeight = (float) ($initialWeight ?? $profile?->weight_kg ?? $currentWeight);
        $status = $alert && in_array($alert['type'], ['warning', 'danger'], true) ? 'perlu perhatian' : 'on-track';
        $hasMealPlanToday = MealPlan::query()
            ->where('nutritionist_program_id', $program->id)
            ->where('day_number', $currentDay)
            ->exists();

        return [
            'id' => $client->id,
            'name' => $client->name,
            'avatar_url' => $client->avatar_url,
            'program' => $program->program?->name ?? 'Program Personal',
            'current_day' => $currentDay,
            'program_duration_days' => $this->programDurationDays($program),
            'current_weight' => $currentWeight,
            'weight_change' => round($currentWeight - $baselineWeight, 2),
            'status' => $status,
            'has_meal_plan_today' => $hasMealPlanToday,
            'needs_attention_reason' => $alert['message'] ?? null,
        ];
    }

    private function unrepliedMessages(int $nutritionistId)
    {
        return ClientMessage::query()
            ->with(['nutritionistProgram.client', 'nutritionistProgram.program'])
            ->where('sender_role', 'client')
            ->whereNull('read_at')
            ->whereHas('nutritionistProgram', function ($query) use ($nutritionistId) {
                $query->where('nutritionist_id', $nutritionistId);
            })
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('nutritionist_program_id')
            ->map(function ($messages) {
                $message = $messages->first();
                $hasLaterNutritionistReply = ClientMessage::query()
                    ->where('nutritionist_program_id', $message->nutritionist_program_id)
                    ->where('sender_role', 'nutritionist')
                    ->where('created_at', '>', $message->created_at)
                    ->exists();

                if ($hasLaterNutritionistReply) {
                    return null;
                }

                return [
                    'client_id' => $message->nutritionistProgram?->client?->id,
                    'name' => $message->nutritionistProgram?->client?->name ?? 'Klien',
                    'program' => $message->nutritionistProgram?->program?->name ?? 'Program Personal',
                    'preview' => str($message->message)->limit(80)->toString(),
                    'time' => optional($message->created_at)->format('H:i'),
                ];
            })
            ->filter()
            ->values();
    }

    private function currentDay(NutritionistProgram $program): int
    {
        return max(1, min(
            Carbon::parse($program->start_date)->diffInDays(today()) + 1,
            $this->programDurationDays($program)
        ));
    }

    private function programDurationDays(NutritionistProgram $program): int
    {
        return max(1, Carbon::parse($program->start_date)->diffInDays(Carbon::parse($program->end_date)) + 1);
    }

    private function mealTypeLabel(string $mealType): string
    {
        return [
            'breakfast' => 'Sarapan',
            'snack_morning' => 'Snack Pagi',
            'lunch' => 'Makan Siang',
            'snack_afternoon' => 'Snack Sore',
            'dinner' => 'Makan Malam',
        ][$mealType] ?? ucfirst(str_replace('_', ' ', $mealType));
    }

    private function mealOrderCase(string $column): string
    {
        return "CASE {$column}
            WHEN 'breakfast' THEN 1
            WHEN 'snack_morning' THEN 2
            WHEN 'lunch' THEN 3
            WHEN 'snack_afternoon' THEN 4
            WHEN 'dinner' THEN 5
            ELSE 6
        END";
    }
}
