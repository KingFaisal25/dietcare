<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'nutritionist_program_id',
        'day_number',
        'meal_type',
        'menu_name',
        'ingredients',
        'calories',
        'protein_g',
        'carb_g',
        'fat_g',
        'notes',
    ];

    protected $casts = [
        'ingredients' => 'array',
        'calories' => 'decimal:2',
        'protein_g' => 'decimal:2',
        'carb_g' => 'decimal:2',
        'fat_g' => 'decimal:2',
    ];

    public function nutritionistProgram()
    {
        return $this->belongsTo(NutritionistProgram::class);
    }
}
