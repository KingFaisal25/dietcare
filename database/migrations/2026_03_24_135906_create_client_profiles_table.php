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
        Schema::create('client_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            
            $table->decimal('height_cm', 5, 2)->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->integer('age')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'active', 'very_active'])->nullable();
            
            $table->json('medical_conditions')->nullable();
            $table->json('allergies')->nullable();
            $table->json('dietary_preferences')->nullable();
            
            $table->enum('target_type', ['lose', 'gain', 'maintain'])->nullable();
            $table->decimal('target_weight_kg', 5, 2)->nullable();
            
            // Calculated fields
            $table->decimal('bmi', 5, 2)->nullable();
            $table->decimal('bmr', 8, 2)->nullable();
            $table->decimal('tdee', 8, 2)->nullable();
            $table->integer('calorie_target')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_profiles');
    }
};
