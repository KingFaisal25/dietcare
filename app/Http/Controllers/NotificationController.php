<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Notification;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * List all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $status = $request->query('status'); // all, unread, read
        
        $query = Notification::where('user_id', $request->user()->id);

        if ($status === 'unread') {
            $query->where('is_read', false);
        } elseif ($status === 'read') {
            $query->where('is_read', true);
        }

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id, Request $request)
    {
        $this->notificationService->markAsRead($id, $request->user()->id);
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
     * Get unread notifications count.
     */
    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();
            
        return response()->json(['unread_count' => $count]);
    }
}
