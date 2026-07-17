<?php

namespace App\Application\Services;

use App\Application\DTOs\LoginDTO;
use App\Application\DTOs\RegisterDTO;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\AuthServiceInterface;
use App\Domain\Entities\User;
use App\Domain\Enums\UserRole;
use App\Models\User as UserModel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService implements AuthServiceInterface
{
    public function __construct(
        private UserRepositoryInterface $userRepo,
    ) {}

    /**
     * @inheritDoc
     */
    public function login(array $credentials): array
    {
        $dto = LoginDTO::fromArray($credentials);

        $loginCredentials = [
            $dto->loginField() => $dto->login,
            'password' => $dto->password,
        ];

        if (!Auth::attempt($loginCredentials, $dto->remember)) {
            throw new \App\Exceptions\AuthenticationException('Invalid credentials.');
        }

        $eloquentUser = Auth::user();

        // Check if account is active
        if (($eloquentUser->status ?? 'active') !== 'active') {
            Auth::logout();
            throw new \App\Exceptions\AuthenticationException('Your account has been deactivated.');
        }

        // Regenerate session to prevent session fixation
        request()->session()->regenerate();

        $role = UserRole::tryFrom($eloquentUser->getRoleNames()->first() ?? 'patient')
            ?? UserRole::Patient;

        $user = $this->mapToEntity($eloquentUser, $role);

        return [
            'user' => $user,
            'redirect' => $role->dashboardPath(),
        ];
    }

    /**
     * @inheritDoc
     */
    public function register(array $data): User
    {
        $dto = RegisterDTO::fromArray($data);

        $eloquentUser = UserModel::create([
            'name' => $dto->name,
            'email' => $dto->email,
            'password' => Hash::make($dto->password),
            'username' => $dto->username,
            'phone' => $dto->phone,
        ]);

        // Assign role via Spatie
        $role = UserRole::tryFrom($dto->role) ?? UserRole::Patient;
        $eloquentUser->assignRole($role->value);

        return $this->mapToEntity($eloquentUser, $role);
    }

    /**
     * @inheritDoc
     */
    public function logout(): void
    {
        Auth::guard('web')->logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    /**
     * @inheritDoc
     */
    public function currentUser(): ?User
    {
        $eloquentUser = Auth::user();

        if (!$eloquentUser) {
            return null;
        }

        $role = UserRole::tryFrom($eloquentUser->getRoleNames()->first() ?? 'patient')
            ?? UserRole::Patient;

        return $this->mapToEntity($eloquentUser, $role);
    }

    /**
     * @inheritDoc
     */
    public function check(): bool
    {
        return Auth::check();
    }

    /**
     * Map an Eloquent User model to a domain User entity.
     */
    private function mapToEntity(UserModel $model, UserRole $role): User
    {
        return new User(
            id: $model->id,
            name: $model->name,
            email: $model->email,
            role: $role,
            username: $model->username ?? null,
            phone: $model->phone ?? null,
            avatar: $model->avatar ?? null,
            emailVerifiedAt: $model->email_verified_at
                ? \DateTimeImmutable::createFromMutable($model->email_verified_at)
                : null,
            status: $model->status ?? 'active',
        );
    }
}
