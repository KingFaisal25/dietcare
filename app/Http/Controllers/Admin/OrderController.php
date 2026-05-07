<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\NutritionistProgram;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status');
        $search = $request->get('search');
        $program = $request->get('program');

        $orders = Order::with('user', 'program', 'nutritionistProgram.nutritionist')
            ->when($status && $status != 'Semua', function($q) use ($status) {
                return $q->where('status', strtolower($status));
            })
            ->when($program, function($q) use ($program) {
                return $q->whereHas('program', function($pq) use ($program) {
                    $pq->where('name', $program);
                });
            })
            ->when($search, function($q) use ($search) {
                $escaped = str_replace(['%', '_'], ['\%', '\_'], $search);
                return $q->where(function($sq) use ($escaped) {
                    $sq->where('order_code', 'like', "%$escaped%")
                         ->orWhereHas('user', function($uq) use ($escaped) {
                             $uq->where('name', 'like', "%$escaped%");
                         });
                });
            })
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['user', 'program', 'nutritionistProgram.nutritionist'])->findOrFail($id);
        return response()->json($order);
    }

    public function assignNutritionist(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $nutritionistId = $request->nutritionist_id;

        DB::transaction(function() use ($order, $nutritionistId) {
            $nutritionistProgram = NutritionistProgram::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'user_id' => $order->user_id,
                    'nutritionist_id' => $nutritionistId,
                    'program_id' => $order->program_id,
                    'status' => 'active',
                    'start_date' => now(),
                    'end_date' => now()->addDays($order->duration_days)
                ]
            );

            $order->update(['status' => 'active']);
        });

        // Trigger emails/notifications
        // Mail::to($order->user->email)->send(new NutritionistAssignedMail($order));

        return response()->json(['message' => 'Nutritionist assigned successfully']);
    }

    public function cancelOrder($id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => 'cancelled']);
        
        return response()->json(['message' => 'Order cancelled successfully']);
    }

    public function export(Request $request)
    {
        // Use PhpSpreadsheet for Excel export
        // ... implementation for Excel generation
        return response()->json(['message' => 'Export logic triggered']);
    }
}
