<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable("food_analyses")) {
            Schema::create("food_analyses", function (Blueprint $table) {
                $table->id();
                $table->foreignId("user_id")->constrained("users")->onDelete("cascade");
                $table->string("image_path");
                $table->string("status")->default("processing");
                $table->json("food_items")->nullable();
                $table->json("total_nutrition")->nullable();
                $table->text("suggestions")->nullable();
                $table->timestamp("analysis_time")->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists("food_analyses");
    }
};
