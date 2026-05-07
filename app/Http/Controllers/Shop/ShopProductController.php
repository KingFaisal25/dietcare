<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\ShopProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShopProductController extends Controller
{
    /** GET /api/shop/products — public product listing */
    public function index(Request $request): JsonResponse
    {
        $query = ShopProduct::where('is_active', true);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->boolean('recommended')) {
            $query->where('is_nutritionist_recommended', true);
        }

        $products = $query->orderByDesc('is_nutritionist_recommended')
                          ->orderBy('name')
                          ->get()
                          ->map(fn($p) => $this->format($p));

        return response()->json(['data' => $products]);
    }

    /** GET /api/shop/products/{slug} — single product detail */
    public function show(string $slug): JsonResponse
    {
        $product = ShopProduct::where('slug', $slug)->where('is_active', true)->firstOrFail();
        return response()->json(['data' => $this->format($product)]);
    }

    // ── Admin ──────────────────────────────────────────────────────

    /** GET /api/admin/shop/products */
    public function adminIndex(Request $request): JsonResponse
    {
        $products = ShopProduct::orderByDesc('created_at')->get()
                     ->map(fn($p) => $this->format($p));
        return response()->json(['data' => $products]);
    }

    /** POST /api/admin/shop/products */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                        => 'required|string|max:255',
            'description'                 => 'nullable|string',
            'price'                       => 'required|numeric|min:0',
            'calories'                    => 'nullable|numeric|min:0',
            'protein'                     => 'nullable|numeric|min:0',
            'fat'                         => 'nullable|numeric|min:0',
            'carbs'                       => 'nullable|numeric|min:0',
            'category'                    => 'nullable|string|max:100',
            'is_healthy'                  => 'boolean',
            'is_nutritionist_recommended' => 'boolean',
            'nutritionist_label'          => 'nullable|string|max:100',
            'stock'                       => 'nullable|integer|min:0',
            'is_active'                   => 'boolean',
            'image'                       => 'nullable|image|max:2048',
        ]);

        $slug = \Illuminate\Support\Str::slug($validated['name']);
        $counter = 1;
        $baseSlug = $slug;
        while (ShopProduct::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }
        $validated['slug'] = $slug;

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('shop/products', 'public');
        }

        $product = ShopProduct::create($validated);

        return response()->json(['message' => 'Produk berhasil ditambahkan.', 'data' => $this->format($product)], 201);
    }

    /** PUT /api/admin/shop/products/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = ShopProduct::findOrFail($id);

        $validated = $request->validate([
            'name'                        => 'sometimes|string|max:255',
            'description'                 => 'nullable|string',
            'price'                       => 'sometimes|numeric|min:0',
            'calories'                    => 'nullable|numeric|min:0',
            'protein'                     => 'nullable|numeric|min:0',
            'fat'                         => 'nullable|numeric|min:0',
            'carbs'                       => 'nullable|numeric|min:0',
            'category'                    => 'nullable|string|max:100',
            'is_healthy'                  => 'boolean',
            'is_nutritionist_recommended' => 'boolean',
            'nutritionist_label'          => 'nullable|string|max:100',
            'stock'                       => 'nullable|integer|min:0',
            'is_active'                   => 'boolean',
            'image'                       => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('shop/products', 'public');
        }

        $product->update($validated);

        return response()->json(['message' => 'Produk berhasil diperbarui.', 'data' => $this->format($product->fresh())]);
    }

    /** DELETE /api/admin/shop/products/{id} */
    public function destroy(int $id): JsonResponse
    {
        $product = ShopProduct::findOrFail($id);
        $product->update(['is_active' => false]);
        return response()->json(['message' => 'Produk dinonaktifkan.']);
    }

    /** PATCH /api/admin/shop/products/{id}/recommend */
    public function toggleRecommend(Request $request, int $id): JsonResponse
    {
        $product = ShopProduct::findOrFail($id);
        $request->validate(['label' => 'nullable|string|max:100']);
        $product->update([
            'is_nutritionist_recommended' => !$product->is_nutritionist_recommended,
            'nutritionist_label'          => $request->label ?? $product->nutritionist_label,
        ]);
        return response()->json(['message' => 'Status rekomendasi diperbarui.', 'data' => $this->format($product->fresh())]);
    }

    private function format(ShopProduct $p): array
    {
        return [
            'id'                          => $p->id,
            'name'                        => $p->name,
            'slug'                        => $p->slug,
            'description'                 => $p->description,
            'price'                       => $p->price,
            'image_url'                   => $p->image_url,
            'calories'                    => $p->calories,
            'protein'                     => $p->protein,
            'fat'                         => $p->fat,
            'carbs'                       => $p->carbs,
            'category'                    => $p->category,
            'is_healthy'                  => $p->is_healthy,
            'is_nutritionist_recommended' => $p->is_nutritionist_recommended,
            'nutritionist_label'          => $p->nutritionist_label,
            'stock'                       => $p->stock,
            'is_active'                   => $p->is_active,
            'created_at'                  => $p->created_at,
        ];
    }
}
