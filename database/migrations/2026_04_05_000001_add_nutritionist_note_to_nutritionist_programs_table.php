<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nutritionist_programs', function (Blueprint $table) {
            $table->text('nutritionist_note')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('nutritionist_programs', function (Blueprint $table) {
            $table->dropColumn('nutritionist_note');
        });
    }
};
