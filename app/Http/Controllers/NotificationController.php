<?php

namespace App\Http\Controllers;

use App\Contracts\Services\NotificationServiceInterface;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationServiceInterface $notificationService,
    ) {}

    /**
     * List all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $status = $request->query('status'); // all, unread, read
        
        $query = \App\Models\Notification::where('user_id', $request->user()->id);

        if ($status === 'unread') {
            $query->where('is_read', false);
        } elseif ($status === 'read') {
            $query->where('is_read', true);
        }

        return response()->json([
            'data' => $query->latest()->take(20)->get()->map(fn($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'title' => $n->title,
                'message' => $n->message,
                'is_read' => (bool)$n->is_read,
                'created_at' => $n->created_at,
            ])
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id, Request $request)
    {
        $notification = \App\Models\Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $this->notificationService->markAsRead($notification->id);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $this->notificationService->markAllAsRead($request->user()->id);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete a notification.
     */
    public function destroy($id, Request $request)
    {
        $notification = \App\Models\Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Notification deleted successfully']);
    }

    /**
     * Get unread notifications count.
     */
    public function unreadCount(Request $request)
    {
        $count = $this->notificationService->unreadCount($request->user()->id);
            
        return response()->json(['unread_count' => $count]);
    }
}

