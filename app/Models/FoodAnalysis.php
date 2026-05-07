<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'image_path',
        'image_url',
        'food_diary_id',
        'ai_result',
        'total_calories',
        'total_protein',
        'total_carbs',
        'total_fat',
        'confidence_avg',
        'meal_type',
        'eaten_at',
    ];

    protected $casts = [
        'ai_result' => 'array',
        'eaten_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
