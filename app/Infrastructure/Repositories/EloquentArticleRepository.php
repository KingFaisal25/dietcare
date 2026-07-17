<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\ArticleRepositoryInterface;
use App\Domain\Entities\Article;
use App\Domain\Enums\ArticleStatus;
use App\Models\BlogPost;
use Illuminate\Support\Collection;

class EloquentArticleRepository implements ArticleRepositoryInterface
{
    public function findById(int $id): ?Article
    {
        $model = BlogPost::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function findBySlug(string $slug): ?Article
    {
        $model = BlogPost::where('slug', $slug)->first();

        return $model ? $this->toEntity($model) : null;
    }

    public function getPublished(int $perPage = 15, int $page = 1): array
    {
        $paginator = BlogPost::where('status', ArticleStatus::Published->value)
            ->orderBy('published_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return [
            'items' => collect($paginator->items())
                ->map(fn (BlogPost $model) => $this->toEntity($model))
                ->all(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
        ];
    }

    public function getByAuthorId(int $authorId): Collection
    {
        return BlogPost::where('author_id', $authorId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (BlogPost $model) => $this->toEntity($model));
    }

    public function getByCategory(string $category): Collection
    {
        return BlogPost::where('category', $category)
            ->where('status', ArticleStatus::Published->value)
            ->orderBy('published_at', 'desc')
            ->get()
            ->map(fn (BlogPost $model) => $this->toEntity($model));
    }

    public function create(array $attributes): Article
    {
        $model = BlogPost::create($attributes);

        return $this->toEntity($model);
    }

    public function update(int $id, array $attributes): ?Article
    {
        $model = BlogPost::find($id);

        if (!$model) {
            return null;
        }

        $model->update($attributes);

        return $this->toEntity($model->fresh());
    }

    public function updateStatus(int $id, ArticleStatus $status): ?Article
    {
        $model = BlogPost::find($id);

        if (!$model) {
            return null;
        }

        $updates = ['status' => $status->value];

        // Auto-set published_at when publishing for the first time
        if ($status === ArticleStatus::Published && $model->published_at === null) {
            $updates['published_at'] = now();
        }

        $model->update($updates);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        $model = BlogPost::find($id);

        return $model ? (bool) $model->delete() : false;
    }

    private function toEntity(BlogPost $model): Article
    {
        return new Article(
            id: $model->id,
            title: $model->title,
            slug: $model->slug,
            content: $model->content,
            authorId: $model->author_id,
            status: ArticleStatus::from($model->status),
            category: $model->category,
            imagePath: $model->image_path,
            publishedAt: $model->published_at
                ? \DateTimeImmutable::createFromMutable($model->published_at->toDateTime())
                : null,
            createdAt: $model->created_at
                ? \DateTimeImmutable::createFromMutable($model->created_at->toDateTime())
                : null,
        );
    }
}
