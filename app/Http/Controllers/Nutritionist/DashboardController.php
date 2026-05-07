<?php

namespace App\Http\Controllers\Nutritionist;

use App\Http\Controllers\Controller;
use App\Models\NutritionistProgram;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $nutritionistId = Auth::id();

        // Stats
        $totalActiveClients = NutritionistProgram::where('nutritionist_id', $nutritionistId)
            ->where('status', 'active')
            ->count();

        $todayConsultations = Consultation::where('nutritionist_id', $nutritionistId)
            ->whereDate('scheduled_at', Carbon::today())
            ->count();

        $unreadMessages = 0; // Placeholder for real messaging logic

        $avgRating = Auth::user()->nutritionistReviews()->avg('rating') ?? 0;

        // Clients List
        $clients = NutritionistProgram::with(['client', 'program'])
            ->where('nutritionist_id', $nutritionistId)
            ->where('status', 'active')
            ->latest()
            ->get()
            ->map(function($np) {
                return [
                    'id' => $np->client->id,
                    'name' => $np->client->name,
                    'program' => $np->program->name,
                    'progress' => 45, // Placeholder
                    'status' => 'On Track', // Placeholder
                    'avatar' => $np->client->avatar_url,
                    'last_update' => '2 jam lalu'
                ];
            });

        // Upcoming Consultations
        $upcomingConsultations = Consultation::with('user')
            ->where('nutritionist_id', $nutritionistId)
            ->where('scheduled_at', '>=', now())
            ->orderBy('scheduled_at', 'asc')
            ->limit(5)
            ->get()
            ->map(function($c) {
                return [
                    'id' => $c->id,
                    'client_name' => $c->user->name,
                    'client_avatar' => $c->user->avatar_url,
                    'time' => $c->scheduled_at->format('H:i'),
                    'date' => $c->scheduled_at->format('Y-m-d'),
                    'type' => 'Video Call'
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_active_clients' => $totalActiveClients,
                    'today_consultations' => $todayConsultations,
                    'unread_messages' => $unreadMessages,
                    'avg_rating' => round($avgRating, 1)
                ],
                'clients' => $clients,
                'upcoming_consultations' => $upcomingConsultations
            ]
        ]);
    }
}
