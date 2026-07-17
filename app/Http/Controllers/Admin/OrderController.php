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
        $order = Order::with('program')->findOrFail($id);
        $nutritionistId = $request->nutritionist_id;

        DB::transaction(function() use ($order, $nutritionistId) {
            $durationDays = $order->program ? $order->program->duration_days : 30;

            $nutritionistProgram = NutritionistProgram::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'client_id' => $order->user_id,
                    'nutritionist_id' => $nutritionistId,
                    'program_id' => $order->program_id,
                    'status' => 'active',
                    'start_date' => now(),
                    'end_date' => now()->addDays($durationDays),
                    'remaining_consultations' => $order->program ? $order->program->max_consultations : 2
                ]
            );

            // Update nutritionist_id in orders table as well
            $order->update([
                'nutritionist_id' => $nutritionistId
            ]);
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
        $orders = Order::with('user', 'program')->latest()->get();

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=laporan-transaksi-' . date('Y-m-d') . '.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $columns = [
            'ID', 'Kode Order', 'Nama Klien', 'Email Klien', 'Program', 
            'Total Amount', 'Diskon', 'Final Amount', 'Status', 
            'Metode Pembayaran', 'Tanggal Bayar', 'Tanggal Dibuat'
        ];

        $callback = function() use($orders, $columns) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for proper excel encoding of special chars/emojis
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, $columns, ';');

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->order_code,
                    $order->user ? $order->user->name : '-',
                    $order->user ? $order->user->email : '-',
                    $order->program ? $order->program->name : '-',
                    $order->total_amount,
                    $order->discount_amount,
                    $order->final_amount,
                    $order->status,
                    $order->payment_method ?? '-',
                    $order->paid_at ? $order->paid_at->format('Y-m-d H:i:s') : '-',
                    $order->created_at ? $order->created_at->format('Y-m-d H:i:s') : '-'
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
