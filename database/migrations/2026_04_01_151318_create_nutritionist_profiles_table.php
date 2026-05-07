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
        Schema::create('nutritionist_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('slug')->unique()->nullable();
            $table->string('title')->nullable(); // Gelar (S.Gz, M.Gz, RD)
            $table->string('str_number')->nullable(); // Nomor STR
            $table->text('bio')->nullable();
            $table->integer('years_experience')->default(0);
            $table->string('city')->nullable();
            $table->json('specializations')->nullable(); // Array of strings
            $table->json('education')->nullable(); // Array of objects
            $table->json('certifications')->nullable(); // Array of objects
            $table->string('photo')->nullable(); // URL foto
            
            // Settings
            $table->boolean('notif_new_message')->default(true);
            $table->boolean('notif_new_consultation')->default(true);
            $table->boolean('notif_reminder')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nutritionist_profiles');
    }
};
