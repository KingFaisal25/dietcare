<?php

namespace App\Contracts\Repositories;

interface FoodRepositoryInterface
{
    public function all(): array;
    public function findById(int $id);
    public function findByNameId(string $nameId);
    public function create(array $attributes);
    public function update(int $id, array $attributes);
    public function delete(int $id): bool;
}
