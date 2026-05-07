<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NutritionistProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'client_id',
        'nutritionist_id',
        'program_id',
        'start_date',
        'end_date',
        'status',
        'review_requested',
        'remaining_consultations',
        'nutritionist_note',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'review_requested' => 'boolean',
    ];

    // ── Relations ───────────────────────────────────
    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function nutritionist()
    {
        return $this->belongsTo(User::class, 'nutritionist_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function mealPlans()
    {
        return $this->hasMany(MealPlan::class);
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    public function messages()
    {
        return $this->hasMany(ClientMessage::class);
    }

    public function reviews()
    {
        return $this->hasMany(NutritionistReview::class);
    }
}
