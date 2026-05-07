<?php

namespace App\Observers;

use App\Models\NutritionistProgram;
use App\Services\NotificationService;

class NutritionistProgramObserver
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the NutritionistProgram "updated" event.
     */
    public function updated(NutritionistProgram $nutritionistProgram): void
    {
        if ($nutritionistProgram->isDirty('status') && $nutritionistProgram->status === 'completed') {
            // Mark review as requested
            $nutritionistProgram->updateQuietly(['review_requested' => true]);

            // Send notification to client
            $this->notificationService->send(
                $nutritionistProgram->client_id,
                'achievement_unlocked', // Or a new type if preferred
                'Program Selesai!',
                'Selamat! Program kamu telah selesai. Bagaimana pengalamanmu? Berikan review untuk ahli gizi kamu ya!',
                ['nutritionist_program_id' => $nutritionistProgram->id, 'action' => 'review']
            );
        }
    }
}
