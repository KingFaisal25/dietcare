<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    use HasFactory;

    protected $table = 'foods';

    protected $fillable = [
        'name_id',
        'name_en',
        'category',
        'brand',
        'serving_size',
        'serving_unit',
        'serving_description',
        'calories_per_100g',
        'protein_per_100g',
        'carbs_per_100g',
        'fat_per_100g',
        'fiber_per_100g',
        'sugar_per_100g',
        'sodium_per_100g',
        'cholesterol_per_100g',
        'vitamin_c',
        'calcium',
        'iron',
        'gi_index',
        'source',
        'barcode',
        'image_url',
        'is_verified',
        'is_active',
        'view_count',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'serving_size' => 'float',
        'calories_per_100g' => 'float',
        'protein_per_100g' => 'float',
        'carbs_per_100g' => 'float',
        'fat_per_100g' => 'float',
        'fiber_per_100g' => 'float',
        'sugar_per_100g' => 'float',
        'sodium_per_100g' => 'float',
        'cholesterol_per_100g' => 'float',
    ];

    public function diaryEntries()
    {
        return $this->hasMany(FoodDiaryEntry::class);
    }
}
