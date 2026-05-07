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
        Schema::table('nutritionist_programs', function (Blueprint $table) {
            $table->boolean('review_requested')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('nutritionist_programs', function (Blueprint $table) {
            $table->dropColumn('review_requested');
        });
    }
};
