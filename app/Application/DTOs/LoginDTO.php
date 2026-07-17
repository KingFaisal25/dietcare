<?php

namespace App\Application\DTOs;

/**
 * Data Transfer Object for login requests.
 */
readonly class LoginDTO
{
    public function __construct(
        public string $login,
        public string $password,
        public bool $remember = false,
    ) {}

    /**
     * Create from validated request data.
     */
    public static function fromArray(array $data): self
    {
        return new self(
            login: $data['login'],
            password: $data['password'],
            remember: $data['remember'] ?? false,
        );
    }

    /**
     * Determine whether the login field is an email or username.
     */
    public function loginField(): string
    {
        return filter_var($this->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
    }
}
