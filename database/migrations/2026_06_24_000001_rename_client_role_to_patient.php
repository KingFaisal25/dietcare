<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Rename the Spatie Permission role 'client' → 'patient' to align
 * with the Domain\Enums\UserRole::Patient enum value.
 *
 * This updates both the `roles` table and the `model_has_roles` pivot
 * so existing users seamlessly migrate.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Rename the role row itself
        DB::table('roles')
            ->where('name', 'client')
            ->update(['name' => 'patient', 'updated_at' => now()]);

        // Clear Spatie's permission cache so the new name is picked up
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        DB::table('roles')
            ->where('name', 'patient')
            ->update(['name' => 'client', 'updated_at' => now()]);

        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
