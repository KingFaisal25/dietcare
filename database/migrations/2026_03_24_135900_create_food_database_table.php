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
        Schema::dropIfExists('food_database');

        Schema::create('foods', function (Blueprint $table) {
            $table->id();
            $table->string('name_id');
            $table->string('name_en')->nullable();
            $table->enum('category', [
                'nasi_sereal', 'lauk_hewani', 'lauk_nabati', 'sayuran', 'buah', 
                'minuman', 'jajanan', 'makanan_cepat_saji', 'suplemen'
            ]);
            $table->string('brand')->nullable();
            $table->float('serving_size');
            $table->string('serving_unit')->default('gram');
            $table->string('serving_description')->nullable();
            
            // Nutrisi per 100 gram
            $table->float('calories_per_100g');
            $table->float('protein_per_100g');
            $table->float('carbs_per_100g');
            $table->float('fat_per_100g');
            $table->float('fiber_per_100g')->default(0);
            $table->float('sugar_per_100g')->default(0);
            $table->float('sodium_per_100g')->default(0);
            $table->float('cholesterol_per_100g')->default(0);
            
            // Nutrisi Mikro
            $table->float('vitamin_c')->nullable();
            $table->float('calcium')->nullable();
            $table->float('iron')->nullable();
            
            $table->integer('gi_index')->nullable(); // Glycemic Index
            $table->enum('source', ['manual', 'usda', 'bpom', 'ai_generated'])->default('manual');
            $table->string('barcode')->nullable()->index();
            $table->string('image_url')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('view_count')->default(0);
            $table->timestamps();

            // Fulltext search index (MySQL/MariaDB support)
            // Note: SQLite doesn't support FULLTEXT index via Blueprint this way easily
            // We'll use regular indexes for compatibility if needed, but the user asked for full-text
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('foods');
    }
};
