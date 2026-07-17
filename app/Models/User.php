<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'phone',
        'avatar',
        'notification_settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'notification_settings' => 'array',
    ];

    /**
     * Get the user's role name.
     */
    public function getRoleAttribute()
    {
        return $this->getRoleNames()->first();
    }

    // RELATIONS
    public function clientProfile()
    {
        return $this->hasOne(ClientProfile::class, 'user_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    public function nutritionistPrograms()
    {
        return $this->hasMany(NutritionistProgram::class, 'nutritionist_id');
    }

    public function nutritionistProfile()
    {
        return $this->hasOne(NutritionistProfile::class);
    }

    public function nutritionistSchedules()
    {
        return $this->hasMany(NutritionistSchedule::class);
    }

    public function clientPrograms()
    {
        return $this->hasMany(NutritionistProgram::class, 'client_id');
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'user_id');
    }

    public function foodDiaries()
    {
        return $this->hasMany(FoodDiaryEntry::class, 'user_id');
    }

    public function scheduleSettings()
    {
        return $this->hasMany(NutritionistScheduleSetting::class, 'nutritionist_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(NutritionistReview::class, 'nutritionist_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(NutritionistReview::class, 'client_id');
    }

    // ACCESSORS
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar && Storage::disk('public')->exists($this->avatar)) {
            return Storage::disk('public')->url($this->avatar);
        }
        // Return default avatar
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=e8f8f0&color=0d6e42';
    }

    // ROLE CHECKS
    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isNutritionist()
    {
        return $this->hasRole('nutritionist');
    }

    public function isClient()
    {
        return $this->hasRole('patient');
    }

    /**
     * Convert the model instance to an array.
     */
    public function toArray()
    {
        $attributes = parent::toArray();
        $attributes['avatar'] = $this->avatar_url;
        return $attributes;
    }
}
