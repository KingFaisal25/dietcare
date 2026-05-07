<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\PaymentService;
use App\Models\Order;
use App\Models\Program;
use App\Models\User;
use App\Models\PromoCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Midtrans\Snap as MidtransSnap;
use Mockery;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $paymentService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock Midtrans Config to avoid issues with missing config
        config(['payment.midtrans.server_key' => 'test-key']);
        config(['payment.midtrans.is_production' => false]);
        
        $this->paymentService = new PaymentService();
    }

    public function test_create_transaction_success()
    {
        $user = User::factory()->create(['role' => 'client']);
        Auth::login($user);

        $nutritionist = User::factory()->create(['role' => 'nutritionist']);
        $program = Program::create([
            'name' => 'Test Program',
            'slug' => 'test-program',
            'description' => 'Test',
            'price' => 100000,
            'duration_days' => 30,
            'max_consultations' => 4
        ]);

        // Mock Midtrans Snap
        $mockSnapToken = 'test-snap-token';
        $mockSnap = Mockery::mock('alias:Midtrans\Snap');
        $mockSnap->shouldReceive('getSnapToken')->once()->andReturn($mockSnapToken);

        $order = $this->paymentService->createTransaction($program, $nutritionist);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertEquals('pending', $order->status);
        $this->assertEquals(100000, $order->total_amount);
        $this->assertEquals($mockSnapToken, $order->midtrans_token);
        
        Mockery::close();
    }

    public function test_create_transaction_with_promo_code()
    {
        $user = User::factory()->create(['role' => 'client']);
        Auth::login($user);

        $nutritionist = User::factory()->create(['role' => 'nutritionist']);
        $program = Program::create([
            'name' => 'Test Program',
            'slug' => 'test-program',
            'description' => 'Test',
            'price' => 100000,
            'duration_days' => 30,
            'max_consultations' => 4
        ]);

        $promo = PromoCode::create([
            'code' => 'DISCOUNT20',
            'discount_type' => 'percent',
            'discount_value' => 20,
            'valid_until' => now()->addDay(),
            'is_active' => true
        ]);

        // Mock Midtrans Snap
        $mockSnapToken = 'test-snap-token-promo';
        $mockSnap = Mockery::mock('alias:Midtrans\Snap');
        $mockSnap->shouldReceive('getSnapToken')->once()->andReturn($mockSnapToken);

        $order = $this->paymentService->createTransaction($program, $nutritionist, 'DISCOUNT20');

        $this->assertEquals(100000, $order->total_amount);
        $this->assertEquals(20000, $order->discount_amount);
        $this->assertEquals(80000, $order->final_amount);
        $this->assertEquals($promo->id, $order->promo_code_id);
        
        Mockery::close();
    }
}
