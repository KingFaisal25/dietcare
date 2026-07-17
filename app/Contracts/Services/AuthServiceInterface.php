<?php

namespace App\Contracts\Services;

use App\Domain\Entities\User;

interface AuthServiceInterface
{
    /**
     * Authenticate a user with credentials and start a session.
     *
     * @param  array{login: string, password: string}  $credentials
     * @return array{user: User, redirect: string}
     *
     * @throws \App\Exceptions\AuthenticationException
     */
    public function login(array $credentials): array;

    /**
     * Register a new user account.
     *
     * @param  array{name: string, email: string, password: string, username?: string, phone?: string}  $data
     */
    public function register(array $data): User;

    /**
     * Log out the current user and invalidate their session.
     */
    public function logout(): void;

    /**
     * Get the currently authenticated user.
     */
    public function currentUser(): ?User;

    /**
     * Check if the current user is authenticated.
     */
    public function check(): bool;
}
