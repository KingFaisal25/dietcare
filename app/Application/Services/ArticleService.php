<?php

namespace App\Application\Services;

use App\Contracts\Repositories\ArticleRepositoryInterface;
use App\Domain\Entities\Article;
use App\Domain\Enums\ArticleStatus;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ArticleService
{
    public function __construct(
        private ArticleRepositoryInterface $articleRepo,
    ) {}

    /**
     * Get published articles with pagination.
     */
    public function getPublished(int $perPage = 15, int $page = 1): array
    {
        return $this->articleRepo->getPublished($perPage, $page);
    }

    /**
     * Get a single article by slug (for public view).
     */
    public function findBySlug(string $slug): ?Article
    {
        $article = $this->articleRepo->findBySlug($slug);

        // Only return published articles for public access
        if ($article && !$article->isPublished()) {
            return null;
        }

        return $article;
    }

    /**
     * Get a single article by ID (for admin/author edit).
     */
    public function findById(int $id): ?Article
    {
        return $this->articleRepo->findById($id);
    }

    /**
     * Get articles authored by a specific user.
     */
    public function getByAuthor(int $authorId): Collection
    {
        return $this->articleRepo->getByAuthorId($authorId);
    }

    /**
     * Get articles in a category.
     */
    public function getByCategory(string $category): Collection
    {
        return $this->articleRepo->getByCategory($category);
    }

    /**
     * Create a new article.
     */
    public function create(array $data): Article
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['status'] = $data['status'] ?? ArticleStatus::Draft->value;

        return $this->articleRepo->create($data);
    }

    /**
     * Update an existing article.
     */
    public function update(int $id, array $data): ?Article
    {
        // Regenerate slug if title changed
        if (isset($data['title']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        return $this->articleRepo->update($id, $data);
    }

    /**
     * Publish a draft article.
     */
    public function publish(int $id): ?Article
    {
        return $this->articleRepo->updateStatus($id, ArticleStatus::Published);
    }

    /**
     * Archive an article.
     */
    public function archive(int $id): ?Article
    {
        return $this->articleRepo->updateStatus($id, ArticleStatus::Archived);
    }

    /**
     * Delete an article.
     */
    public function delete(int $id): bool
    {
        return $this->articleRepo->delete($id);
    }
}
