<?php

namespace App\Domain\Enums;

/**
 * Enum representing the publication statuses of a blog article.
 */
enum ArticleStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Published => 'Dipublikasikan',
            self::Archived => 'Diarsipkan',
        };
    }

    public function isVisible(): bool
    {
        return $this === self::Published;
    }
}
