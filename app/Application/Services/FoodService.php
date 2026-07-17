<?php

namespace App\Application\Services;

use App\Contracts\Repositories\FoodRepositoryInterface;
use App\Domain\Entities\Food;

class FoodService
{
    private FoodRepositoryInterface $foodRepo;

    public function __construct(FoodRepositoryInterface $foodRepo)
    {
        $this->foodRepo = $foodRepo;
    }

    /**
     * Get all foods as domain entities.
     */
    public function getAll(): array
    {
        $models = $this->foodRepo->all();
        return array_map(function ($model) {
            return new Food(
                $model['id'],
                $model['name_id'],
                $model['category'],
                (float) $model['calories_per_100g'],
                (float) $model['protein_per_100g'],
                (float) $model['carbs_per_100g'],
                (float) $model['fat_per_100g'],
                isset($model['fiber_per_100g']) ? (float) $model['fiber_per_100g'] : 0,
                (int) $model['serving_size'],
                $model['source'] ?? 'manual'
            );
        }, $models);
    }

    public function findByName(string $nameId): ?Food
    {
        $model = $this->foodRepo->findByNameId($nameId);
        if (!$model) {
            return null;
        }
        return new Food(
            $model->id,
            $model->name_id,
            $model->category,
            (float) $model->calories_per_100g,
            (float) $model->protein_per_100g,
            (float) $model->carbs_per_100g,
            (float) $model->fat_per_100g,
            isset($model->fiber_per_100g) ? (float) $model->fiber_per_100g : 0,
            (int) $model->serving_size,
            $model->source ?? 'manual'
        );
    }
}
