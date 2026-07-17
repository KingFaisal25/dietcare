<?php

namespace Tests\Feature;

use App\Models\ClientProfile;
use App\Models\Consultation;
use App\Models\MealPlan;
use App\Models\NutritionistProfile;
use App\Models\NutritionistProgram;
use App\Models\Order;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $nutritionist;

    protected User $patientA;

    protected User $patientB;

    protected Program $program;

    protected NutritionistProgram $programForPatientA;

    protected NutritionistProgram $programForPatientB;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        Artisan::call('db:seed', ['--class' => 'RolePermissionSeeder']);

        $this->admin = User::factory()->create(['email' => 'admin@test.com']);
        $this->admin->assignRole('admin');

        $this->nutritionist = User::factory()->create(['email' => 'nutritionist@test.com']);
        $this->nutritionist->assignRole('nutritionist');

        NutritionistProfile::create([
            'user_id' => $this->nutritionist->id,
            'slug' => 'test-nutritionist',
            'status' => 'active',
        ]);

        $this->patientA = User::factory()->create(['email' => 'patient-a@test.com']);
        $this->patientA->assignRole('patient');

        $this->patientB = User::factory()->create(['email' => 'patient-b@test.com']);
        $this->patientB->assignRole('patient');

        ClientProfile::create(['user_id' => $this->patientA->id]);
        ClientProfile::create(['user_id' => $this->patientB->id]);

        $this->program = Program::create([
            'name' => 'Test Program',
            'slug' => 'test-program',
            'description' => 'Test Description',
            'price' => 100000,
            'duration_days' => 30,
            'max_consultations' => 2,
            'features' => json_encode(['Feature 1']),
            'is_active' => true,
        ]);

        $orderA = Order::create([
            'order_code' => 'ORD-TEST-A',
            'user_id' => $this->patientA->id,
            'program_id' => $this->program->id,
            'total_amount' => 100000,
            'final_amount' => 100000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $orderB = Order::create([
            'order_code' => 'ORD-TEST-B',
            'user_id' => $this->patientB->id,
            'program_id' => $this->program->id,
            'total_amount' => 100000,
            'final_amount' => 100000,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->programForPatientA = NutritionistProgram::create([
            'order_id' => $orderA->id,
            'client_id' => $this->patientA->id,
            'nutritionist_id' => $this->nutritionist->id,
            'program_id' => $this->program->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
            'status' => 'active',
            'remaining_consultations' => 2,
        ]);

        $this->programForPatientB = NutritionistProgram::create([
            'order_id' => $orderB->id,
            'client_id' => $this->patientB->id,
            'nutritionist_id' => $this->nutritionist->id,
            'program_id' => $this->program->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
            'status' => 'active',
            'remaining_consultations' => 2,
        ]);
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/stats')
            ->assertStatus(200);
    }

    public function test_nutritionist_can_access_nutritionist_routes(): void
    {
        $this->actingAs($this->nutritionist)
            ->getJson('/api/nutritionist/clients')
            ->assertStatus(200);
    }

    public function test_patient_can_access_client_routes(): void
    {
        $this->actingAs($this->patientA)
            ->getJson('/api/client/dashboard')
            ->assertStatus(200);
    }

    public function test_patient_cannot_access_admin_routes(): void
    {
        $this->actingAs($this->patientA)
            ->getJson('/api/admin/dashboard/stats')
            ->assertStatus(403);
    }

    public function test_patient_cannot_access_nutritionist_routes(): void
    {
        $this->actingAs($this->patientA)
            ->getJson('/api/nutritionist/clients')
            ->assertStatus(403);
    }

    public function test_nutritionist_cannot_access_client_routes(): void
    {
        $this->actingAs($this->nutritionist)
            ->getJson('/api/client/dashboard')
            ->assertStatus(403);
    }

    public function test_patient_cannot_view_another_patients_consultation(): void
    {
        $consultation = Consultation::create([
            'nutritionist_program_id' => $this->programForPatientB->id,
            'type' => 'video_call',
            'status' => 'scheduled',
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 30,
        ]);

        $this->assertFalse(
            Gate::forUser($this->patientA)->allows('view', $consultation)
        );
    }

    public function test_patient_cannot_complete_another_patients_consultation(): void
    {
        $consultation = Consultation::create([
            'nutritionist_program_id' => $this->programForPatientB->id,
            'type' => 'video_call',
            'status' => 'scheduled',
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 30,
        ]);

        $this->assertFalse(
            Gate::forUser($this->patientA)->allows('complete', $consultation)
        );

        $this->actingAs($this->patientA)
            ->putJson("/api/consultations/{$consultation->id}/complete")
            ->assertStatus(403);
    }

    public function test_patient_cannot_view_another_patients_meal_plan(): void
    {
        $mealPlan = MealPlan::create([
            'nutritionist_program_id' => $this->programForPatientB->id,
            'day_number' => 1,
            'meal_type' => 'breakfast',
            'menu_name' => 'Oatmeal',
        ]);

        $this->assertFalse(
            Gate::forUser($this->patientA)->allows('view', $mealPlan)
        );
    }

    public function test_nutritionist_can_complete_assigned_consultation(): void
    {
        $consultation = Consultation::create([
            'nutritionist_program_id' => $this->programForPatientA->id,
            'type' => 'video_call',
            'status' => 'scheduled',
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 30,
        ]);

        $this->assertTrue(
            Gate::forUser($this->nutritionist)->allows('complete', $consultation)
        );
    }

    public function test_registration_with_elevated_role_is_forbidden(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Escalator',
            'username' => 'escalator',
            'email' => 'escalator@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin',
        ])->assertStatus(403);

        $this->assertDatabaseMissing('users', ['email' => 'escalator@test.com']);
    }

    public function test_registration_without_role_defaults_to_patient(): void
    {
        Event::fake([Registered::class]);

        $this->postJson('/api/register', [
            'name' => 'New Patient',
            'username' => 'newpatient',
            'email' => 'newpatient@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertStatus(201);

        $user = User::where('email', 'newpatient@test.com')->first();
        $this->assertTrue($user->hasRole('patient'));
    }

    public function test_registration_with_nutritionist_role_is_forbidden(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Fake Nutritionist',
            'username' => 'fakenutritionist',
            'email' => 'fakenutritionist@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'nutritionist',
        ])->assertStatus(403);

        $this->assertDatabaseMissing('users', ['email' => 'fakenutritionist@test.com']);
    }
}
