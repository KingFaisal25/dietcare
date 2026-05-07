<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;

class PublicBlogController extends Controller
{
    private function backendBase(): string
    {
        return rtrim(config('app.url'), '/');
    }

    private function imageUrl(?string $path): ?string
    {
        return $path ? $this->backendBase() . '/storage/' . $path : null;
    }

    private function transformPost(BlogPost $post): array
    {
        $galleryImages = $post->images
            ->map(fn($img) => $this->imageUrl($img->image_path))
            ->filter()
            ->values()
            ->toArray();

        return [
            'id'           => $post->id,
            'title'        => $post->title,
            'slug'         => $post->slug,
            'content'      => $post->content,
            'category'     => $post->category,
            'status'       => $post->status,
            'image_url'    => $this->imageUrl($post->image_path),
            'images'       => $galleryImages,
            'published_at' => ($post->published_at ?? $post->created_at)?->toISOString(),
            'created_at'   => $post->created_at?->toISOString(),
            'author'       => $post->author ? ['name' => $post->author->name] : null,
        ];
    }

    /**
     * GET /api/public/blogs?limit=N&page=P&search=keyword&paginate=true
     */
    public function index(Request $request)
    {
        $limit = (int) $request->query('limit', 12);
        $limit = max(1, min(50, $limit));

        $paginate = filter_var($request->query('paginate', false), FILTER_VALIDATE_BOOLEAN);
        $search   = trim($request->query('search', ''));

        $query = BlogPost::with(['author', 'images'])
            ->where('status', 'published')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($search) . '%'])
                          ->orWhereRaw('LOWER(category) LIKE ?', ['%' . strtolower($search) . '%']);
                });
            })
            ->orderByRaw('COALESCE(published_at, created_at) DESC');

        if ($paginate) {
            $paged = $query->paginate($limit);
            return response()->json([
                'success'  => true,
                'data'     => $paged->getCollection()->map(fn($p) => $this->transformPost($p))->values(),
                'meta'     => [
                    'current_page' => $paged->currentPage(),
                    'last_page'    => $paged->lastPage(),
                    'per_page'     => $paged->perPage(),
                    'total'        => $paged->total(),
                ],
            ]);
        }

        $posts = $query->limit($limit)->get()->map(fn($p) => $this->transformPost($p));

        return response()->json(['success' => true, 'data' => $posts]);
    }

    /**
     * GET /api/public/blogs/{slug}
     */
    public function show(string $slug)
    {
        $post = BlogPost::with(['author', 'images'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json(['success' => true, 'data' => $this->transformPost($post)]);
    }
}
