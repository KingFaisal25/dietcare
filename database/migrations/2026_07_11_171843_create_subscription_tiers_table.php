<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique(); // 'free', 'premium', 'enterprise'
            $table->string('display_name', 100);
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('duration_days')->nullable(); // null = lifetime
            $table->integer('max_consultations')->nullable(); // null = unlimited
            $table->json('features')->nullable(); // ['unlimited_diary', 'export_data', ...]
            $table->integer('ai_meal_plan_quota')->default(0); // per month, 0 = unlimited
            $table->integer('food_diary_history_days')->nullable(); // null = unlimited
            $table->integer('weight_log_history_days')->nullable(); // null = unlimited
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_tiers');
    }
};
