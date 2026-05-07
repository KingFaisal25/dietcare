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
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nutritionist_program_id')->constrained()->onDelete('cascade');
            
            $table->enum('type', ['chat', 'video_call', 'whatsapp']);
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->index(['nutritionist_program_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
