<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogImage;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class BlogController extends Controller
{
    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function backendBase(): string
    {
        return rtrim(config('app.url'), '/');
    }

    private function imageUrl(?string $path): ?string
    {
        return $path ? $this->backendBase() . '/storage/' . $path : null;
    }

    /** Attach a post's gallery images as full URLs */
    private function withImageUrls(BlogPost $post): array
    {
        $data          = $post->toArray();
        $data['image_url'] = $this->imageUrl($post->image_path);
        $data['images']    = $post->images
            ->map(fn($img) => [
                'id'        => $img->id,
                'image_url' => $this->imageUrl($img->image_path),
            ])
            ->values()
            ->toArray();
        return $data;
    }

    // ─── Index ────────────────────────────────────────────────────────────────

    public function index()
    {
        $posts = BlogPost::with(['author', 'images'])
            ->latest()
            ->paginate(10);

        // Transform each item to include full image URLs
        $posts->getCollection()->transform(fn($p) => $this->withImageUrls($p));

        return response()->json($posts);
    }

    // ─── Show ─────────────────────────────────────────────────────────────────

    public function show($id)
    {
        $post = BlogPost::with(['author', 'images'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $this->withImageUrls($post),
        ]);
    }

    // ─── Store ────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'content'  => 'required|string',
            'category' => 'required|string',
            'status'   => 'required|in:draft,published',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'images'   => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Cover image (legacy single image kept for backward compat)
        $coverPath = null;
        if ($request->hasFile('image')) {
            $coverPath = $request->file('image')->store('blogs', 'public');
        }

        $post = BlogPost::create([
            'title'        => $request->title,
            'slug'         => Str::slug($request->title) . '-' . Str::random(5),
            'content'      => $request->content,
            'category'     => $request->category,
            'status'       => $request->status,
            'image_path'   => $coverPath,
            'author_id'    => Auth::id(),
            'published_at' => $request->status === 'published' ? now() : null,
        ]);

        // Gallery images
        if ($request->hasFile('images')) {
            foreach (array_slice($request->file('images'), 0, 5) as $i => $file) {
                $path = $file->store('blogs/gallery', 'public');
                BlogImage::create([
                    'blog_id'    => $post->id,
                    'image_path' => $path,
                    'sort_order' => $i,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog post created successfully',
            'data'    => $this->withImageUrls($post->load('images')),
        ]);
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    public function update(Request $request, $id)
    {
        $post = BlogPost::with('images')->findOrFail($id);

        $request->validate([
            'title'    => 'required|string|max:255',
            'content'  => 'required|string',
            'category' => 'required|string',
            'status'   => 'required|in:draft,published',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'images'   => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'integer',
        ]);

        // Cover image
        $coverPath = $post->image_path;
        if ($request->hasFile('image')) {
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            $coverPath = $request->file('image')->store('blogs', 'public');
        }

        $post->update([
            'title'        => $request->title,
            'slug'         => Str::slug($request->title) . '-' . Str::random(5),
            'content'      => $request->content,
            'category'     => $request->category,
            'status'       => $request->status,
            'image_path'   => $coverPath,
            'published_at' => ($request->status === 'published' && ! $post->published_at)
                                ? now()
                                : $post->published_at,
        ]);

        // Remove selected gallery images
        if ($request->filled('remove_images')) {
            $toRemove = $post->images->whereIn('id', $request->remove_images);
            foreach ($toRemove as $img) {
                Storage::disk('public')->delete($img->image_path);
                $img->delete();
            }
        }

        // Add new gallery images (cap at 5 total)
        if ($request->hasFile('images')) {
            $currentCount = $post->images()->count();
            $slots        = max(0, 5 - $currentCount);
            $newFiles     = array_slice($request->file('images'), 0, $slots);

            foreach ($newFiles as $i => $file) {
                $path = $file->store('blogs/gallery', 'public');
                BlogImage::create([
                    'blog_id'    => $post->id,
                    'image_path' => $path,
                    'sort_order' => $currentCount + $i,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog post updated successfully',
            'data'    => $this->withImageUrls($post->fresh()->load(['author', 'images'])),
        ]);
    }

    // ─── Destroy ──────────────────────────────────────────────────────────────

    public function destroy($id)
    {
        $post = BlogPost::with('images')->findOrFail($id);

        // Delete gallery images from storage
        foreach ($post->images as $img) {
            Storage::disk('public')->delete($img->image_path);
        }

        // Delete cover
        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }

        $post->delete(); // cascade deletes blog_images rows via FK

        return response()->json([
            'success' => true,
            'message' => 'Blog post deleted successfully',
        ]);
    }
}
