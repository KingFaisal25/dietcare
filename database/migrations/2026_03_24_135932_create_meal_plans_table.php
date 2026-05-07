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
        Schema::create('meal_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nutritionist_program_id')->constrained()->onDelete('cascade');
            
            $table->integer('day_number');
            $table->enum('meal_type', ['breakfast', 'snack_morning', 'lunch', 'snack_afternoon', 'dinner']);
            $table->string('menu_name');
            $table->json('ingredients')->nullable();
            
            $table->decimal('calories', 8, 2)->nullable();
            $table->decimal('protein_g', 8, 2)->nullable();
            $table->decimal('carb_g', 8, 2)->nullable();
            $table->decimal('fat_g', 8, 2)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['nutritionist_program_id', 'day_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_plans');
    }
};
