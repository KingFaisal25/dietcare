<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;
    protected $type;
    protected $title;
    protected $message;
    protected $data;

    public function __construct(int $userId, string $type, string $title, string $message, array $data = [])
    {
        $this->userId = $userId;
        $this->type = $type;
        $this->title = $title;
        $this->message = $message;
        $this->data = $data;
    }

    public function handle(NotificationService $notificationService): void
    {
        try {
            $user = User::findOrFail($this->userId);

            // Check if user opt-out notification (assuming there's a setting)
            // if ($user->notificationSettings->where('type', $this->type)->first()?->opt_out) {
            //     return;
            // }

            // 1. Send DB & Broadcast Notification
            $notificationService->send(
                $this->userId,
                $this->type,
                $this->title,
                $this->message,
                $this->data
            );

            // 2. Send Email if setting allows
            $settings = $user->notification_settings ?? [];
            $key = match($this->type) {
                'meal_reminder' => 'meal_log',
                'weight_reminder' => 'weight_log',
                'nutritionist_message' => 'nutritionist_msg',
                'program_expiring' => 'promo_article',
                default => 'general'
            };

            if ($key === 'general' || (isset($settings[$key]) && $settings[$key])) {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\ReminderMail($this->title, $this->message));
            }
            
        } catch (\Exception $e) {
            Log::error("Failed to send reminder to user {$this->userId}: " . $e->getMessage());
            throw $e;
        }
    }
}
