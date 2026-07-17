<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use App\Models\BlogPost;
use App\Models\Order;
use App\Models\NutritionistProgram;
use App\Observers\OrderObserver;
use App\Observers\NutritionistProgramObserver;
use App\Policies\ArticlePolicy;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        RateLimiter::for('api-login', function (Request $request) {
            $key = sprintf('login:%s|%s', $request->ip(), (string) $request->input('login'));
            return [
                Limit::perMinute(5)->by($key),
                Limit::perHour(30)->by($request->ip()),
            ];
        });

        RateLimiter::for('api-password-reset', function (Request $request) {
            $email = (string) $request->input('email');
            return Limit::perMinute(3)->by(sprintf('password-reset:%s|%s', $request->ip(), $email));
        });

        RateLimiter::for('api-public-read', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });

        Gate::policy(BlogPost::class, ArticlePolicy::class);

        // Register OrderObserver — triggers on Order status changes
        Order::observe(OrderObserver::class);

        // Register NutritionistProgramObserver — triggers on program status changes (e.g. completed)
        NutritionistProgram::observe(NutritionistProgramObserver::class);
    }
}

