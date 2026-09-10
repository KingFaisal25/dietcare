<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class FoodAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        "user_id",
        "image_path",
        "status",
        "food_items",
        "total_nutrition",
        "suggestions",
        "analysis_time",
    ];

    protected $casts = [
        "food_items" => "array",
        "total_nutrition" => "array",
        "analysis_time" => "datetime",
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
