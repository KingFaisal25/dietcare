<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use App\Models\Program;
use App\Models\NutritionistProfile;
use App\Models\NutritionistProgram;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup roles and permissions
        Artisan::call('db:seed', ['--class' => 'RolePermissionSeeder']);
        
        $this->admin = User::factory()->create(['email' => 'admin@test.com']);
        $this->admin->assignRole('admin');

        $this->nutritionist = User::factory()->create(['email' => 'nutritionist@test.com']);
        $this->nutritionist->assignRole('nutritionist');
        
        NutritionistProfile::create([
            'user_id' => $this->nutritionist->id,
            'slug' => 'test-nutritionist',
            'status' => 'active'
        ]);

        $this->client = User::factory()->create(['email' => 'client@test.com']);
        $this->client->assignRole('patient');

        $this->program = Program::create([
            'name' => 'Test Program',
            'slug' => 'test-program',
            'description' => 'Test Description',
            'price' => 100000,
            'duration_days' => 30,
            'max_consultations' => 2,
            'features' => json_encode(['Feature 1']),
            'is_active' => true
        ]);
    }

    public function test_admin_can_access_stats()
    {
        Order::create([
            'order_code' => 'ORD-TEST-001',
            'user_id' => $this->client->id,
            'program_id' => $this->program->id,
            'total_amount' => 100000,
            'final_amount' => 100000,
            'status' => 'paid',
            'paid_at' => now()
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'revenue_this_month',
                'growth_percent',
                'active_clients',
                'today_transactions' => ['count', 'amount'],
                'active_nutritionists'
            ]);
    }

    public function test_admin_can_access_revenue_chart()
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/revenue-chart');

        $response->assertStatus(200)
            ->assertJsonStructure(['labels', 'data']);
    }

    public function test_admin_can_access_recent_transactions()
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/recent-transactions');

        $response->assertStatus(200);
    }

    public function test_admin_can_access_workload()
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/workload');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => $this->nutritionist->name]);
    }

    public function test_non_admin_cannot_access_dashboard()
    {
        $response = $this->actingAs($this->client)
            ->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(403);
    }
}
