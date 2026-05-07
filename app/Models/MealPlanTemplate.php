<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealPlanTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'nutritionist_id',
        'name',
        'day_number',
        'notes',
        'meals',
        'totals',
    ];

    protected $casts = [
        'meals' => 'array',
        'totals' => 'array',
    ];

    public function nutritionist()
    {
        return $this->belongsTo(User::class, 'nutritionist_id');
    }
}
