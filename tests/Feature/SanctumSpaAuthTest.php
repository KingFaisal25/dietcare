<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SanctumSpaAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Artisan::call('db:seed', ['--class' => 'RolePermissionSeeder']);
    }

    public function test_admin_can_login_via_spa_session(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@dietcare.com',
            'username' => 'admin',
            'password' => Hash::make('password123'),
        ]);
        $admin->assignRole('admin');

        $this->get('/sanctum/csrf-cookie');
        $csrf = $this->getJson('/api/csrf')->json('token');

        $response = $this->withHeader('X-XSRF-TOKEN', $csrf)
            ->postJson('/api/login', [
            'login' => 'admin',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.role', 'admin');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_nutritionist_can_login_via_spa_session(): void
    {
        $nutritionist = User::factory()->create([
            'email' => 'nadia@dietcare.com',
            'username' => 'nadia_sgz',
            'password' => Hash::make('password123'),
        ]);
        $nutritionist->assignRole('nutritionist');

        $this->get('/sanctum/csrf-cookie');
        $csrf = $this->getJson('/api/csrf')->json('token');

        $response = $this->withHeader('X-XSRF-TOKEN', $csrf)
            ->postJson('/api/login', [
            'login' => 'nadia@dietcare.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.role', 'nutritionist');

        $this->assertAuthenticatedAs($nutritionist);
    }

    public function test_patient_can_login_via_spa_session(): void
    {
        $patient = User::factory()->create([
            'email' => 'budi@gmail.com',
            'username' => 'budi',
            'password' => Hash::make('password123'),
        ]);
        $patient->assignRole('patient');

        $this->get('/sanctum/csrf-cookie');
        $csrf = $this->getJson('/api/csrf')->json('token');

        $response = $this->withHeader('X-XSRF-TOKEN', $csrf)
            ->postJson('/api/login', [
            'login' => 'budi',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.role', 'patient');

        $this->assertAuthenticatedAs($patient);
    }

    public function test_csrf_token_endpoint_returns_valid_token(): void
    {
        $this->get('/sanctum/csrf-cookie');

        $response = $this->getJson('/api/csrf');

        $response->assertStatus(200)
            ->assertJsonStructure(['token']);

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_csrf_cookie_endpoint_is_accessible(): void
    {
        $this->get('/sanctum/csrf-cookie')->assertNoContent();
    }

    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@dietcare.com',
            'username' => 'admin',
            'password' => Hash::make('password123'),
        ]);
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->getJson('/api/me')
            ->assertStatus(200)
            ->assertJsonPath('data.role', 'admin');
    }
}
