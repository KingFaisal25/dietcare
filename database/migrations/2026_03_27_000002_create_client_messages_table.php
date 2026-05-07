<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nutritionist_program_id')->constrained()->onDelete('cascade');
            $table->enum('sender_role', ['client', 'nutritionist']);
            $table->text('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['nutritionist_program_id', 'sender_role']);
            $table->index(['sender_role', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_messages');
    }
};
