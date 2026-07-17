<?php

namespace App\Domain\Entities;

use App\Domain\Enums\ArticleStatus;

/**
 * Domain Entity representing a Blog Article.
 *
 * Maps to the BlogPost Eloquent model but contains
 * only domain logic without framework dependencies.
 */
class Article
{
    public function __construct(
        public readonly int $id,
        public readonly string $title,
        public readonly string $slug,
        public readonly string $content,
        public readonly int $authorId,
        public readonly ArticleStatus $status,
        public readonly ?string $category = null,
        public readonly ?string $imagePath = null,
        public readonly ?\DateTimeImmutable $publishedAt = null,
        public readonly ?\DateTimeImmutable $createdAt = null,
    ) {}

    /**
     * Check if the article is publicly visible.
     */
    public function isPublished(): bool
    {
        return $this->status === ArticleStatus::Published;
    }

    /**
     * Check if the article is still a draft.
     */
    public function isDraft(): bool
    {
        return $this->status === ArticleStatus::Draft;
    }

    /**
     * Check if the article can be published.
     */
    public function isPublishable(): bool
    {
        return $this->status === ArticleStatus::Draft
            && !empty($this->title)
            && !empty($this->content);
    }

    /**
     * Check if the article belongs to a given author.
     */
    public function isAuthoredBy(int $userId): bool
    {
        return $this->authorId === $userId;
    }

    /**
     * Generate an excerpt from the content.
     */
    public function excerpt(int $length = 160): string
    {
        $plain = strip_tags($this->content);

        if (mb_strlen($plain) <= $length) {
            return $plain;
        }

        return mb_substr($plain, 0, $length) . '…';
    }
}
