<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar_url,
            'role' => $this->getRoleNames()->first(),
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
        ];

        // If user is nutritionist, include nutritionist profile
        if ($this->isNutritionist() && $this->nutritionistProfile) {
            $data['nutritionist_profile'] = $this->nutritionistProfile;
            // If nutritionist has a photo, use that instead of default avatar
            if ($this->nutritionistProfile->photo) {
                $data['avatar'] = $this->nutritionistProfile->photo;
            }
        }

        return $data;
    }
}
