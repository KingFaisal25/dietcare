<?php

namespace App\Policies;

use App\Models\MealPlan;
use App\Models\User;

class MealPlanPolicy
{
    public function view(User $user, MealPlan $mealPlan): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $program = $mealPlan->nutritionistProgram;

        if (!$program) {
            return false;
        }

        return $program->client_id === $user->id
            || $program->nutritionist_id === $user->id;
    }

    public function update(User $user, MealPlan $mealPlan): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $program = $mealPlan->nutritionistProgram;

        return $program && $program->nutritionist_id === $user->id;
    }

    public function delete(User $user, MealPlan $mealPlan): bool
    {
        return $this->update($user, $mealPlan);
    }
}
