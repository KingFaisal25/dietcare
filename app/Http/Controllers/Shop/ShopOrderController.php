<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\ShopOrder;
use App\Models\ShopOrderItem;
use App\Models\ShopProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ShopOrderController extends Controller
{
    /** POST /api/shop/orders — place a new order (authenticated user) */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name'  => 'required|string|max:255',
            'address'        => 'required|string',
            'phone'          => 'required|string|max:20',
            'delivery_type'  => 'required|in:instant,scheduled',
            'delivery_time'  => 'nullable|in:pagi,siang,malam',
            'payment_method' => 'required|in:cod,transfer,ewallet',
            'notes'          => 'nullable|string|max:500',
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:shop_products,id',
            'items.*.quantity'   => 'required|integer|min:1|max:50',
        ]);

        DB::beginTransaction();
        try {
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = ShopProduct::where('id', $item['product_id'])
                                      ->where('is_active', true)
                                      ->firstOrFail();
                $lineTotal = $product->price * $item['quantity'];
                $subtotal += $lineTotal;
                $itemsData[] = [
                    'shop_product_id' => $product->id,
                    'quantity'        => $item['quantity'],
                    'unit_price'      => $product->price,
                    'subtotal'        => $lineTotal,
                ];
            }

            $deliveryFee = $validated['delivery_type'] === 'instant' ? 15000 : 10000;
            $total = $subtotal + $deliveryFee;

            $order = ShopOrder::create([
                'order_number'   => ShopOrder::generateOrderNumber(),
                'user_id'        => $request->user()->id,
                'customer_name'  => $validated['customer_name'],
                'address'        => $validated['address'],
                'phone'          => $validated['phone'],
                'delivery_type'  => $validated['delivery_type'],
                'delivery_time'  => $validated['delivery_time'] ?? null,
                'payment_method' => $validated['payment_method'],
                'subtotal'       => $subtotal,
                'delivery_fee'   => $deliveryFee,
                'total'          => $total,
                'status'         => 'pending',
                'notes'          => $validated['notes'] ?? null,
            ]);

            foreach ($itemsData as $item) {
                $item['shop_order_id'] = $order->id;
                ShopOrderItem::create($item);
            }

            DB::commit();

            return response()->json([
                'message' => 'Pesanan berhasil dibuat.',
                'data'    => $this->format($order->load('items.product')),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat pesanan: ' . $e->getMessage()], 500);
        }
    }

    /** GET /api/shop/orders — user's own orders */
    public function myOrders(Request $request): JsonResponse
    {
        $orders = ShopOrder::where('user_id', $request->user()->id)
                           ->with('items.product')
                           ->orderByDesc('created_at')
                           ->get()
                           ->map(fn($o) => $this->format($o));

        return response()->json(['data' => $orders]);
    }

    /** GET /api/shop/orders/{orderNumber} — track single order */
    public function track(Request $request, string $orderNumber): JsonResponse
    {
        $order = ShopOrder::where('order_number', $orderNumber)
                          ->where('user_id', $request->user()->id)
                          ->with('items.product')
                          ->firstOrFail();

        return response()->json(['data' => $this->format($order)]);
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    /** GET /api/admin/shop/orders */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = ShopOrder::with('items.product', 'user')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'data' => collect($orders->items())->map(fn($o) => $this->format($o)),
            'meta' => [
                'total'        => $orders->total(),
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
            ],
        ]);
    }

    /** PATCH /api/admin/shop/orders/{id}/status */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = ShopOrder::findOrFail($id);
        $request->validate([
            'status' => 'required|in:pending,diproses,dikirim,sampai,dibatalkan',
        ]);

        $now = now();
        $extra = [];
        match ($request->status) {
            'diproses'   => $extra = ['processed_at' => $now, 'tracking_code' => 'TRK-' . strtoupper(substr(md5(uniqid()), 0, 8))],
            'dikirim'    => $extra = ['shipped_at' => $now],
            'sampai'     => $extra = ['delivered_at' => $now],
            default      => null,
        };

        $order->update(array_merge(['status' => $request->status], $extra));

        return response()->json(['message' => 'Status diperbarui.', 'data' => $this->format($order->fresh()->load('items.product'))]);
    }

    /** GET /api/admin/shop/orders/{id} */
    public function adminShow(int $id): JsonResponse
    {
        $order = ShopOrder::with('items.product', 'user')->findOrFail($id);
        return response()->json(['data' => $this->format($order)]);
    }

    private function format(ShopOrder $o): array
    {
        return [
            'id'             => $o->id,
            'order_number'   => $o->order_number,
            'user'           => $o->user ? ['id' => $o->user->id, 'name' => $o->user->name, 'email' => $o->user->email] : null,
            'customer_name'  => $o->customer_name,
            'address'        => $o->address,
            'phone'          => $o->phone,
            'delivery_type'  => $o->delivery_type,
            'delivery_time'  => $o->delivery_time,
            'payment_method' => $o->payment_method,
            'subtotal'       => $o->subtotal,
            'delivery_fee'   => $o->delivery_fee,
            'total'          => $o->total,
            'status'         => $o->status,
            'status_label'   => $o->status_label,
            'tracking_code'  => $o->tracking_code,
            'notes'          => $o->notes,
            'processed_at'   => $o->processed_at,
            'shipped_at'     => $o->shipped_at,
            'delivered_at'   => $o->delivered_at,
            'created_at'     => $o->created_at,
            'items'          => $o->items ? $o->items->map(fn($item) => [
                'id'         => $item->id,
                'quantity'   => $item->quantity,
                'unit_price' => $item->unit_price,
                'subtotal'   => $item->subtotal,
                'product'    => $item->product ? [
                    'id'        => $item->product->id,
                    'name'      => $item->product->name,
                    'slug'      => $item->product->slug,
                    'image_url' => $item->product->image_url,
                    'calories'  => $item->product->calories,
                ] : null,
            ])->toArray() : [],
        ];
    }
}
