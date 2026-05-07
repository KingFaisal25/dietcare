<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Broadcast;

class NotificationService
{
    /**
     * Send a notification to a specific user.
     */
    public function send(int $userId, string $type, string $title, string $message, array $data = []): void
    {
        $user = \App\Models\User::find($userId);
        
        // Check notification settings if user exists
        if ($user && $user->notification_settings) {
            $settings = $user->notification_settings;
            // Map types to settings keys
            $key = match($type) {
                'meal_reminder' => 'meal_log',
                'weight_reminder' => 'weight_log',
                'nutritionist_message' => 'nutritionist_msg',
                'program_expiring' => 'promo_article',
                default => null
            };
            
            if ($key && isset($settings[$key]) && !$settings[$key]) {
                return; // User opted out
            }
        }

        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_read' => false,
        ]);

        // Broadcast to Pusher/Reverb for real-time frontend updates
        broadcast(new \App\Events\NotificationSent($notification))->toOthers();
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(int $notifId, int $userId): void
    {
        Notification::where('id', $notifId)
            ->where('user_id', $userId)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Mark all notifications for a user as read.
     */
    public function markAllAsRead(int $userId): void
    {
        Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Get all unread notifications for a user.
     */
    public function getUnread(int $userId): Collection
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->latest()
            ->get();
    }
}
