<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use Illuminate\Http\Request;
use App\Http\Requests\CreatePromoCodeRequest;

class PromoCodeController extends Controller
{
    // --- Public Endpoints ---
    
    public function check(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'amount' => 'nullable|numeric|min:0'
        ]);

        $code = strtoupper($request->code);
        $promo = PromoCode::where('code', $code)->first();

        if (!$promo) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode promo tidak ditemukan.'
            ], 404);
        }

        if (!$promo->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode promo tidak aktif atau sudah kadaluarsa.'
            ], 400);
        }

        $amount = $request->input('amount', 0);
        if ($amount > 0 && $amount < $promo->min_purchase) {
            return response()->json([
                'valid' => false,
                'message' => 'Minimal pembelian untuk kode promo ini adalah Rp ' . number_format($promo->min_purchase, 0, ',', '.')
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'discount_type' => $promo->discount_type,
            'discount_value' => $promo->discount_value,
            'max_discount' => $promo->max_discount,
            'description' => $promo->description ?? "Diskon " . ($promo->discount_type === 'percent' ? $promo->discount_value . "%" : "Rp " . number_format($promo->discount_value, 0, ',', '.'))
        ]);
    }

    // --- Admin Endpoints ---

    public function index()
    {
        $promos = PromoCode::with('creator')->latest()->paginate(15);
        return response()->json($promos);
    }

    public function store(CreatePromoCodeRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id ?? null; // Adjust based on auth setup

        $promo = PromoCode::create($data);

        return response()->json([
            'message' => 'Kode promo berhasil dibuat',
            'data' => $promo
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $promo = PromoCode::findOrFail($id);

        $validated = $request->validate([
            'name' => ['string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['in:percent,fixed'],
            'discount_value' => ['numeric', 'min:1'],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);

        $promo->update($validated);

        return response()->json([
            'message' => 'Kode promo berhasil diupdate',
            'data' => $promo
        ]);
    }

    public function destroy($id)
    {
        $promo = PromoCode::findOrFail($id);
        $promo->delete();

        return response()->json([
            'message' => 'Kode promo berhasil dihapus'
        ]);
    }

    public function usage($id)
    {
        $promo = PromoCode::findOrFail($id);
        $usages = $promo->usages()->with(['user', 'order'])->latest()->paginate(15);

        return response()->json($usages);
    }
}
