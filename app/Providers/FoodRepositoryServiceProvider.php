<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Contracts\Repositories\FoodRepositoryInterface;
use App\Infrastructure\Repositories\EloquentFoodRepository;

class FoodRepositoryServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(FoodRepositoryInterface::class, EloquentFoodRepository::class);
    }
}
