<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nutritionist_schedule_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nutritionist_id')->constrained('users')->onDelete('cascade');
            $table->unsignedTinyInteger('weekday');
            $table->enum('availability', ['active', 'slow', 'off'])->default('active');
            $table->timestamps();

            $table->unique(['nutritionist_id', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nutritionist_schedule_settings');
    }
};
