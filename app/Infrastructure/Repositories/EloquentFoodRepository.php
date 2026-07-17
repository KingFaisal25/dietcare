<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\FoodRepositoryInterface;
use App\Models\Food; // Assuming existing Eloquent model

class EloquentFoodRepository implements FoodRepositoryInterface
{
    public function all(): array
    {
        return Food::all()->toArray();
    }

    public function findById(int $id)
    {
        return Food::find($id);
    }

    public function findByNameId(string $nameId)
    {
        return Food::where('name_id', $nameId)->first();
    }

    public function create(array $attributes)
    {
        return Food::create($attributes);
    }

    public function update(int $id, array $attributes)
    {
        $food = $this->findById($id);
        if ($food) {
            $food->update($attributes);
        }
        return $food;
    }

    public function delete(int $id): bool
    {
        $food = $this->findById($id);
        if ($food) {
            return $food->delete();
        }
        return false;
    }
}
