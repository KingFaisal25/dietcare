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
        Schema::create('anonymous_usages', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 100)->index(); // Browser session ID
            $table->string('ip_address', 50)->nullable();
            $table->string('feature', 50); // 'ai_meal_plan', 'bmi_calculator', etc.
            $table->integer('usage_count')->default(1);
            $table->timestamp('last_used_at');
            $table->timestamps();

            // Index untuk quick lookup
            $table->index(['session_id', 'feature', 'last_used_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anonymous_usages');
    }
};
