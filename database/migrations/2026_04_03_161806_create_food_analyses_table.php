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
        Schema::create('food_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('image_path');
            $table->string('image_url');
            $table->foreignId('food_diary_id')->nullable();
            $table->json('ai_result');
            $table->integer('total_calories');
            $table->integer('total_protein');
            $table->integer('total_carbs');
            $table->integer('total_fat');
            $table->float('confidence_avg');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']);
            $table->timestamp('eaten_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_analyses');
    }
};
