<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\User;
use App\Models\NutritionistProfile;
use App\Models\NutritionistProgram;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        $revenueThisMonth = Order::where('status', 'paid')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('final_amount');

        $revenueLastMonth = Order::where('status', 'paid')
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('final_amount');

        $growthPercent = $revenueLastMonth > 0 
            ? (($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100 
            : 0;

        $activeClients = NutritionistProgram::where('status', 'active')->count();
        
        $todayTransactions = Order::whereDate('created_at', Carbon::today())
            ->where('status', 'paid')
            ->select(DB::raw('count(*) as count'), DB::raw('sum(final_amount) as amount'))
            ->first();

        $activeNutritionists = User::role('nutritionist')
            ->whereHas('nutritionistProfile', function($query) {
                $query->where('status', 'active');
            })->count();

        return response()->json([
            'revenue_this_month' => $revenueThisMonth,
            'growth_percent' => round($growthPercent, 2),
            'active_clients' => $activeClients,
            'today_transactions' => [
                'count' => $todayTransactions->count,
                'amount' => $todayTransactions->amount ?? 0
            ],
            'active_nutritionists' => $activeNutritionists
        ]);
    }

    public function revenueChart(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $data = [];
        $labels = [];

        if ($period == 'monthly') {
            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $labels[] = $date->format('M');
                $data[] = Order::where('status', 'paid')
                    ->whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->sum('final_amount');
            }
        }
        // ... handle daily/weekly if needed

        return response()->json([
            'labels' => $labels,
            'data' => $data
        ]);
    }

    public function recentTransactions()
    {
        $transactions = Order::with('user', 'program')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json($transactions);
    }

    public function alerts()
    {
        // Example alerts implementation
        $mealPlanDelay = NutritionistProgram::where('status', 'active')
            ->where('meal_plan_assigned_at', null)
            ->where('created_at', '<=', Carbon::now()->subDays(2))
            ->with('user')
            ->get();

        // Add more alerts as needed
        return response()->json([
            'meal_plan_delay' => $mealPlanDelay
        ]);
    }

    public function workload()
    {
        $nutritionists = User::role('nutritionist')
            ->withCount(['nutritionistPrograms' => function($query) {
                $query->where('status', 'active');
            }])
            ->with('nutritionistProfile')
            ->get();

        return response()->json($nutritionists->map(function($user) {
            return [
                'name' => $user->name,
                'active_clients' => $user->nutritionist_programs_count,
                'max_clients' => 50, // Default cap
                'status' => $user->nutritionist_programs_count >= 50 ? 'Penuh' : ($user->nutritionist_programs_count >= 40 ? 'Hampir Penuh' : 'Tersedia')
            ];
        }));
    }
}
