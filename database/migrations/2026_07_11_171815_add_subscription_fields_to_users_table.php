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
        Schema::table('users', function (Blueprint $table) {
            $table->string('subscription_tier', 50)->default('free')->after('remember_token');
            $table->timestamp('subscription_started_at')->nullable()->after('subscription_tier');
            $table->timestamp('subscription_expires_at')->nullable()->after('subscription_started_at');
            $table->integer('ai_meal_plan_quota')->default(3)->after('subscription_expires_at');
            $table->date('ai_meal_plan_reset_date')->nullable()->after('ai_meal_plan_quota');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_tier',
                'subscription_started_at',
                'subscription_expires_at',
                'ai_meal_plan_quota',
                'ai_meal_plan_reset_date',
            ]);
        });
    }
};
