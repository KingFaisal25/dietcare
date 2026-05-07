<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $nutritionistRole = Role::firstOrCreate(['name' => 'nutritionist']);
        $clientRole = Role::firstOrCreate(['name' => 'client']);

        // Define Permissions
        $permissions = [
            // Admin Permissions
            'manage_users', 'manage_programs', 'manage_orders', 'view_reports', 'manage_articles',
            
            // Nutritionist Permissions
            'manage_clients', 'create_meal_plan', 'manage_consultations', 'write_article',

            // Client Permissions
            'view_own_profile', 'purchase_program', 'log_food_diary', 'log_weight', 'schedule_consultation'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign Permissions to Roles
        $adminRole->givePermissionTo([
            'manage_users', 'manage_programs', 'manage_orders', 'view_reports', 'manage_articles'
        ]);

        $nutritionistRole->givePermissionTo([
            'manage_clients', 'create_meal_plan', 'manage_consultations', 'write_article'
        ]);

        $clientRole->givePermissionTo([
            'view_own_profile', 'purchase_program', 'log_food_diary', 'log_weight', 'schedule_consultation'
        ]);
    }
}
