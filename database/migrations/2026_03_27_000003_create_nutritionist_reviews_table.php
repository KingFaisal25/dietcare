<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nutritionist_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nutritionist_program_id')->constrained()->onDelete('cascade');
            $table->foreignId('nutritionist_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->unsignedTinyInteger('rating');
            $table->text('review')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique('nutritionist_program_id');
            $table->index(['nutritionist_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nutritionist_reviews');
    }
};
