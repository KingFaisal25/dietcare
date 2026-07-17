<?php

namespace App\Policies;

use App\Models\Consultation;
use App\Models\User;

class ConsultationPolicy
{
    public function view(User $user, Consultation $consultation): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $program = $consultation->nutritionistProgram;

        if (!$program) {
            return false;
        }

        return $program->client_id === $user->id
            || $program->nutritionist_id === $user->id;
    }

    public function update(User $user, Consultation $consultation): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $program = $consultation->nutritionistProgram;

        return $program && $program->nutritionist_id === $user->id;
    }

    public function complete(User $user, Consultation $consultation): bool
    {
        return $this->update($user, $consultation);
    }
}
