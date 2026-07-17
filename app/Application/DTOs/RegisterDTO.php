<?php

namespace App\Application\DTOs;

/**
 * Data Transfer Object for user registration requests.
 */
readonly class RegisterDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public ?string $username = null,
        public ?string $phone = null,
        public string $role = 'patient',
    ) {}

    /**
     * Create from validated request data.
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'],
            username: $data['username'] ?? null,
            phone: $data['phone'] ?? null,
            role: $data['role'] ?? 'patient',
        );
    }
}
