<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Centralised service provider for all Repository and Service bindings.
 *
 * Replaces the per-domain FoodRepositoryServiceProvider pattern with
 * a single provider that maps every contract interface to its
 * concrete Eloquent/infrastructure implementation.
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * All repository interface → implementation bindings.
     *
     * @var array<class-string, class-string>
     */
    private array $repositories = [
        // ── Existing ───────────────────────────────────────────
        \App\Contracts\Repositories\FoodRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentFoodRepository::class,

        \App\Contracts\Repositories\FoodDiaryRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentFoodDiaryRepository::class,

        \App\Contracts\Repositories\UserRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentUserRepository::class,

        \App\Contracts\Repositories\ProgramRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentProgramRepository::class,

        // ── New ────────────────────────────────────────────────
        \App\Contracts\Repositories\ProfileRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentProfileRepository::class,

        \App\Contracts\Repositories\MealPlanRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentMealPlanRepository::class,

        \App\Contracts\Repositories\ConsultationRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentConsultationRepository::class,

        \App\Contracts\Repositories\OrderRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentOrderRepository::class,

        \App\Contracts\Repositories\ArticleRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentArticleRepository::class,

        \App\Contracts\Repositories\NotificationRepositoryInterface::class
            => \App\Infrastructure\Repositories\EloquentNotificationRepository::class,
    ];

    /**
     * All service interface → implementation bindings.
     *
     * @var array<class-string, class-string>
     */
    private array $services = [
        \App\Contracts\Services\AuthServiceInterface::class
            => \App\Application\Services\AuthService::class,

        \App\Contracts\Services\NotificationServiceInterface::class
            => \App\Application\Services\NotificationService::class,

        \App\Contracts\Services\PaymentServiceInterface::class
            => \App\Infrastructure\Services\MidtransPaymentService::class,
    ];

    /**
     * Register all repository and service bindings.
     */
    public function register(): void
    {
        foreach ($this->repositories as $interface => $implementation) {
            $this->app->bind($interface, $implementation);
        }

        foreach ($this->services as $interface => $implementation) {
            $this->app->bind($interface, $implementation);
        }
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
