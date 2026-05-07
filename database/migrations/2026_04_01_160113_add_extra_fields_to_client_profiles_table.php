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
        Schema::table('client_profiles', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('age');
            $table->string('city')->nullable()->after('birth_date');
            $table->text('dietary_restrictions')->nullable()->after('dietary_preferences');
        });
    }

    public function down(): void
    {
        Schema::table('client_profiles', function (Blueprint $table) {
            $table->dropColumn(['birth_date', 'city', 'dietary_restrictions']);
        });
    }
};
