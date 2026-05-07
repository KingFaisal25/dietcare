<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meal_plan_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nutritionist_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->unsignedInteger('day_number')->nullable();
            $table->text('notes')->nullable();
            $table->json('meals');
            $table->json('totals')->nullable();
            $table->timestamps();

            $table->index(['nutritionist_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meal_plan_templates');
    }
};
