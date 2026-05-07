<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ClientNutritionController;
use App\Http\Controllers\FoodSearchController;
use App\Http\Controllers\NutritionistClientController;
use App\Http\Controllers\NutritionCalculatorController;
use App\Http\Controllers\NutritionistMealPlanController;
use App\Http\Controllers\NutritionistScheduleController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\ProgramDetailController;
use App\Http\Controllers\ReportController;

use App\Http\Controllers\Api\FoodController;
use App\Http\Controllers\Api\DiaryController;
use App\Http\Controllers\Shop\ShopProductController;
use App\Http\Controllers\Shop\ShopOrderController;

// Public Routes (No Auth Needed)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:api-login');

// Food Database Public Search
Route::get('/foods/search', [FoodController::class, 'search']);
Route::get('/foods/barcode/{barcode}', [FoodController::class, 'findByBarcode']);

Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware(['guest', 'throttle:api-password-reset'])->name('password.email');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware(['guest', 'throttle:api-password-reset'])->name('password.update');

// Public Calculator (No Auth Needed)
Route::post('/calculate/bmi', [NutritionCalculatorController::class, 'calculateBMI']);

// Public Program Routes (No Auth Needed)
Route::prefix('public/programs')->group(function () {
    Route::middleware('throttle:api-public-read')->group(function () {
        Route::get('/', [ProgramDetailController::class, 'index']);
        Route::get('/{slug}', [ProgramDetailController::class, 'show']);
    });
});

// Midtrans Webhook (No Auth — Midtrans server calls this directly)
// Keamanan dijamin oleh validasi signature key di PaymentService
Route::post('/payment/webhook', [PaymentController::class, 'callback'])->name('payment.callback');

// Public Routes
Route::post('/public/promo/check', [\App\Http\Controllers\PromoCodeController::class, 'check']);
Route::middleware('throttle:api-public-read')->group(function () {
    Route::get('/public/nutritionists', [\App\Http\Controllers\PublicNutritionistController::class, 'index']);
    Route::get('/public/nutritionists/{slug}', [\App\Http\Controllers\PublicNutritionistController::class, 'show']);
    Route::get('/public/nutritionists/{id}/reviews', [\App\Http\Controllers\ReviewController::class, 'nutritionistReviews']);
    Route::get('/nutritionists/{id}/schedule', [\App\Http\Controllers\PublicNutritionistController::class, 'schedule']);

    // Public Blog (published articles only)
    Route::get('/public/blogs', [\App\Http\Controllers\PublicBlogController::class, 'index']);
    Route::get('/public/blogs/{slug}', [\App\Http\Controllers\PublicBlogController::class, 'show']);

    // Public Shop — product listing & detail (no auth required)
    Route::get('/shop/products', [ShopProductController::class, 'index']);
    Route::get('/shop/products/{slug}', [ShopProductController::class, 'show']);
});

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile Routes
    Route::prefix('client/profile')->group(function () {
        Route::get('/', [\App\Http\Controllers\ClientProfileController::class, 'show']);
        Route::put('/', [\App\Http\Controllers\ClientProfileController::class, 'update']);
        Route::post('/photo', [\App\Http\Controllers\ClientProfileController::class, 'uploadPhoto']);
        Route::put('/password', [\App\Http\Controllers\ClientProfileController::class, 'updatePassword']);
        Route::put('/notifications', [\App\Http\Controllers\ClientProfileController::class, 'updateNotifications']);
        Route::put('/nutrition-data', [\App\Http\Controllers\ClientProfileController::class, 'updateNutritionData']);
    });

    // Review Routes
    Route::post('/client/reviews', [\App\Http\Controllers\ReviewController::class, 'store']);

    // Food Diary Routes
    Route::prefix('diary')->group(function () {
        Route::get('/', [DiaryController::class, 'index']);
        Route::post('/', [DiaryController::class, 'store']);
        Route::put('/{id}', [DiaryController::class, 'update']);
        Route::delete('/{id}', [DiaryController::class, 'destroy']);
        Route::get('/weekly-summary', [DiaryController::class, 'weeklySummary']);
        Route::get('/streak', [DiaryController::class, 'streak']);
    });

    // Food Suggestions
    Route::post('/foods/suggest', [FoodController::class, 'suggest']);

    // Food Photo Recognition
    Route::post('/food-analysis/analyze', [\App\Http\Controllers\Api\FoodAnalysisController::class, 'analyzePhoto']);

    // AI Nutrition Chatbot Routes
    Route::prefix('chatbot')->group(function () {
        Route::post('/message', [\App\Http\Controllers\Api\ChatbotController::class, 'sendMessage']);
        Route::get('/history', [\App\Http\Controllers\Api\ChatbotController::class, 'getHistory']);
        Route::delete('/history', [\App\Http\Controllers\Api\ChatbotController::class, 'deleteHistory']);
    });

    // Notification Routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index']);
        Route::patch('/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
        Route::patch('/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
        Route::get('/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
    });

    // Payment Routes (All authenticated users)
    Route::prefix('payment')->group(function () {
        Route::post('/create', [PaymentController::class, 'create']);
    });

    // ── Shop / E-commerce (Authenticated Users) ────────────────────────
    Route::prefix('shop')->group(function () {
        Route::post('/orders', [ShopOrderController::class, 'store']);
        Route::get('/orders', [ShopOrderController::class, 'myOrders']);
        Route::get('/orders/{orderNumber}/track', [ShopOrderController::class, 'track']);
    });

    // Consultation Routes (All authenticated users)
    Route::prefix('consultations')->group(function () {
        Route::post('/schedule', [ConsultationController::class, 'schedule']);
        Route::put('/{id}/complete', [ConsultationController::class, 'complete']);
        Route::get('/upcoming', [ConsultationController::class, 'upcoming']);
    });

    // AI Meal Plan Generator Routes
    Route::prefix('meal-plan')->group(function () {
        Route::post('/generate', [\App\Http\Controllers\Api\MealPlanController::class, 'generate']);
        Route::get('/status/{id}', [\App\Http\Controllers\Api\MealPlanController::class, 'status']);
        Route::get('/history', [\App\Http\Controllers\Api\MealPlanController::class, 'history']);
        Route::get('/{id}', [\App\Http\Controllers\Api\MealPlanController::class, 'show']);
    });


    // Admin Only Routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Admin Profile
        Route::put('/profile', [\App\Http\Controllers\Admin\AdminProfileController::class, 'update']);

        // Dashboard
        Route::get('/dashboard/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);
        Route::get('/dashboard/revenue-chart', [\App\Http\Controllers\Admin\DashboardController::class, 'revenueChart']);
        Route::get('/dashboard/recent-transactions', [\App\Http\Controllers\Admin\DashboardController::class, 'recentTransactions']);
        Route::get('/dashboard/alerts', [\App\Http\Controllers\Admin\DashboardController::class, 'alerts']);
        Route::get('/dashboard/workload', [\App\Http\Controllers\Admin\DashboardController::class, 'workload']);

        // Users
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
        Route::get('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'show']);
        Route::put('/users/{id}/role', [\App\Http\Controllers\Admin\UserController::class, 'updateRole']);
        Route::post('/users/{id}/deactivate', [\App\Http\Controllers\Admin\UserController::class, 'deactivate']);
        Route::post('/users/nutritionist', [\App\Http\Controllers\Admin\UserController::class, 'storeNutritionist']);

        // Orders
        Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index']);
        Route::get('/orders/export', [\App\Http\Controllers\Admin\OrderController::class, 'export']);
        Route::get('/orders/{id}', [\App\Http\Controllers\Admin\OrderController::class, 'show']);
        Route::put('/orders/{id}/assign', [\App\Http\Controllers\Admin\OrderController::class, 'assignNutritionist']);
        Route::post('/orders/{id}/cancel', [\App\Http\Controllers\Admin\OrderController::class, 'cancelOrder']);

        // Programs
        Route::get('/programs', [\App\Http\Controllers\Admin\ProgramController::class, 'index']);
        Route::get('/programs/{id}', [\App\Http\Controllers\Admin\ProgramController::class, 'show']);
        Route::put('/programs/{id}', [\App\Http\Controllers\Admin\ProgramController::class, 'update']);
        Route::put('/programs/{id}/packages', [\App\Http\Controllers\Admin\ProgramController::class, 'updatePackages']);

        // Blog
        Route::prefix('blogs')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\BlogController::class, 'index']);
            Route::get('/{id}', [\App\Http\Controllers\Admin\BlogController::class, 'show']);
            Route::post('/', [\App\Http\Controllers\Admin\BlogController::class, 'store']);
            Route::post('/{id}', [\App\Http\Controllers\Admin\BlogController::class, 'update']); // supports _method=PUT spoofing
            Route::put('/{id}', [\App\Http\Controllers\Admin\BlogController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Admin\BlogController::class, 'destroy']);
        });

        // Settings
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index']);
        Route::put('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update']);
        Route::post('/settings/test-email', [\App\Http\Controllers\Admin\SettingController::class, 'testEmail']);

        // ── Shop Admin ────────────────────────────────────────────────
        Route::prefix('shop')->group(function () {
            // Products
            Route::get('/products', [ShopProductController::class, 'adminIndex']);
            Route::post('/products', [ShopProductController::class, 'store']);
            Route::put('/products/{id}', [ShopProductController::class, 'update']);
            Route::delete('/products/{id}', [ShopProductController::class, 'destroy']);
            Route::patch('/products/{id}/recommend', [ShopProductController::class, 'toggleRecommend']);
            // Orders
            Route::get('/orders', [ShopOrderController::class, 'adminIndex']);
            Route::get('/orders/{id}', [ShopOrderController::class, 'adminShow']);
            Route::patch('/orders/{id}/status', [ShopOrderController::class, 'updateStatus']);
        });

        // Admin Review Management
        Route::get('/reviews', [\App\Http\Controllers\ReviewController::class, 'adminIndex']);
        Route::put('/reviews/{id}/approve', [\App\Http\Controllers\ReviewController::class, 'approve']);
        Route::put('/reviews/{id}/feature', [\App\Http\Controllers\ReviewController::class, 'feature']);

        Route::get('/promo', [\App\Http\Controllers\PromoCodeController::class, 'index']);
        Route::post('/promo', [\App\Http\Controllers\PromoCodeController::class, 'store']);
        Route::put('/promo/{id}', [\App\Http\Controllers\PromoCodeController::class, 'update']);
        Route::delete('/promo/{id}', [\App\Http\Controllers\PromoCodeController::class, 'destroy']);
        Route::get('/promo/{id}/usage', [\App\Http\Controllers\PromoCodeController::class, 'usage']);
    });

    // Nutritionist Only Routes
    Route::prefix('nutritionist')->middleware('nutritionist')->group(function () {
        Route::get('/profile', [\App\Http\Controllers\NutritionistProfileController::class, 'getProfile']);
        Route::put('/profile', [\App\Http\Controllers\NutritionistProfileController::class, 'updateProfile']);
        Route::post('/profile/photo', [\App\Http\Controllers\NutritionistProfileController::class, 'uploadPhoto']);
        Route::put('/profile/password', [\App\Http\Controllers\NutritionistProfileController::class, 'updatePassword']);
        Route::put('/schedule-settings', [\App\Http\Controllers\NutritionistProfileController::class, 'updateSchedule']);

        Route::get('/clients', [NutritionistClientController::class, 'index']);
        Route::get('/clients/{id}', [NutritionistClientController::class, 'show']);
        Route::post('/clients/{id}/note', [NutritionistClientController::class, 'saveNote']);
        Route::get('/clients/{id}/messages', [NutritionistClientController::class, 'getMessages']);
        Route::post('/clients/{id}/messages', [NutritionistClientController::class, 'sendMessage']);
        Route::post('/meal-plan', [NutritionistMealPlanController::class, 'store']);
        Route::get('/meal-plan/templates', [NutritionistMealPlanController::class, 'templates']);
        Route::post('/meal-plan/templates', [NutritionistMealPlanController::class, 'storeTemplate']);
        Route::get('/schedule', [NutritionistScheduleController::class, 'show']);
        Route::put('/schedule', [NutritionistScheduleController::class, 'update']);
    });

    // Client Only Routes
    Route::prefix('client')->middleware('client')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Client\DashboardController::class, 'index']);
        Route::post('/onboarding', [NutritionCalculatorController::class, 'onboarding']);
        Route::put('/profile/recalculate', [NutritionCalculatorController::class, 'recalculate']);
        Route::get('/profile', [NutritionCalculatorController::class, 'getProfile']);
        Route::get('/progress/alert', [NutritionCalculatorController::class, 'progressAlert']);
        Route::get('/meal-plan', [ClientNutritionController::class, 'mealPlan']);
        Route::get('/food-diary', [ClientNutritionController::class, 'foodDiary']);
        Route::post('/food-diary', [ClientNutritionController::class, 'storeFoodDiary']);
        Route::delete('/food-diary/{id}', [ClientNutritionController::class, 'deleteFoodDiary']);
        Route::get('/diary/summary', [ClientNutritionController::class, 'diarySummary']);
        Route::get('/report', [ReportController::class, 'getReport']);
        Route::get('/report/pdf', [ReportController::class, 'downloadPdf']);
    });
});
