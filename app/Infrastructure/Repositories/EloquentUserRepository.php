<?php
namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Domain\Entities\User;
use App\Models\User as UserModel; // Assuming Eloquent model exists

class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        $model = UserModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $model = UserModel::where('email', $email)->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function save(User $user): User
    {
        $model = UserModel::updateOrCreate(
            ['id' => $user->id ?? null],
            [
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ]
        );
        return $this->toEntity($model);
    }

    public function delete(int $id): void
    {
        UserModel::destroy($id);
    }

    private function toEntity(UserModel $model): User
    {
        return new User(
            $model->id,
            $model->name,
            $model->email,
            $model->role
        );
    }
}
?>
