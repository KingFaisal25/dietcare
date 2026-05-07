<?php

namespace App\Jobs;

use App\Models\MealPlanGeneration;
use App\Models\User;
use App\Services\AIMealPlanService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Exception;

class GenerateMealPlanJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $generation;

    /**
     * Create a new job instance.
     */
    public function __construct(MealPlanGeneration $generation)
    {
        $this->generation = $generation;
    }

    /**
     * Execute the job.
     */
    public function handle(AIMealPlanService $service): void
    {
        $this->generation->update(['status' => 'processing']);

        try {
            $result = $service->generateMealPlan($this->generation->user, $this->generation->params);

            $this->generation->update([
                'status' => 'done',
                'result' => $result,
                'generated_at' => now(),
            ]);

            // TODO: Send notification email + Firebase push
            // Notification::send($this->generation->user, new MealPlanGeneratedNotification($this->generation));

        } catch (Exception $e) {
            Log::error('Meal Plan Generation Failed: ' . $e->getMessage());
            $this->generation->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
