<?php

namespace App\Policies;

use App\Domain\Enums\ArticleStatus;
use App\Models\BlogPost;
use App\Models\User;

class ArticlePolicy
{
    public function view(?User $user, BlogPost $article): bool
    {
        if ($article->status === ArticleStatus::Published->value) {
            return true;
        }

        if (!$user) {
            return false;
        }

        return $user->isAdmin() || $article->author_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isNutritionist();
    }

    public function update(User $user, BlogPost $article): bool
    {
        return $user->isAdmin() || $article->author_id === $user->id;
    }

    public function delete(User $user, BlogPost $article): bool
    {
        return $this->update($user, $article);
    }
}
