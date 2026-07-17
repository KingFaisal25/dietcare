<?php

namespace App\Contracts\Repositories;

use App\Domain\Entities\Article;
use App\Domain\Enums\ArticleStatus;
use Illuminate\Support\Collection;

interface ArticleRepositoryInterface
{
    /**
     * Find an article by ID.
     */
    public function findById(int $id): ?Article;

    /**
     * Find an article by slug.
     */
    public function findBySlug(string $slug): ?Article;

    /**
     * Get published articles with optional pagination.
     */
    public function getPublished(int $perPage = 15, int $page = 1): array;

    /**
     * Get articles by author.
     */
    public function getByAuthorId(int $authorId): Collection;

    /**
     * Get articles by category.
     */
    public function getByCategory(string $category): Collection;

    /**
     * Create a new article.
     */
    public function create(array $attributes): Article;

    /**
     * Update an existing article.
     */
    public function update(int $id, array $attributes): ?Article;

    /**
     * Update article status.
     */
    public function updateStatus(int $id, ArticleStatus $status): ?Article;

    /**
     * Delete an article.
     */
    public function delete(int $id): bool;
}
