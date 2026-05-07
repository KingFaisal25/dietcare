<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NutritionistReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'nutritionist_program_id',
        'nutritionist_id',
        'client_id',
        'rating',
        'review',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function nutritionistProgram()
    {
        return $this->belongsTo(NutritionistProgram::class);
    }

    public function nutritionist()
    {
        return $this->belongsTo(User::class, 'nutritionist_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
