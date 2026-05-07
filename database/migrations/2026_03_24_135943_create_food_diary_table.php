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
        // Drop old table if exists
        Schema::dropIfExists('food_diary');

        Schema::create('food_diary_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('food_id')->nullable()->constrained('foods')->onDelete('set null');
            $table->string('food_name_snapshot'); // Snapshot in case food is deleted/edited
            $table->enum('meal_type', [
                'breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'other'
            ]);
            $table->float('quantity_gram');
            $table->float('calories');
            $table->float('protein');
            $table->float('carbs');
            $table->float('fat');
            $table->float('fiber')->default(0);
            $table->date('eaten_at');
            $table->string('image_path')->nullable(); // For AI photo scan
            $table->enum('source', ['manual', 'barcode', 'ai_photo', 'meal_plan'])->default('manual');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'eaten_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_diary_entries');
    }
};
