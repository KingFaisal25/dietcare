<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NutritionistProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'slug',
        'title',
        'str_number',
        'bio',
        'years_experience',
        'city',
        'specializations',
        'education',
        'certifications',
        'photo',
        'avg_rating',
        'total_reviews',
        'notif_new_message',
        'notif_new_consultation',
        'notif_reminder',
    ];

    protected $casts = [
        'specializations' => 'array',
        'education' => 'array',
        'certifications' => 'array',
        'notif_new_message' => 'boolean',
        'notif_new_consultation' => 'boolean',
        'notif_reminder' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
