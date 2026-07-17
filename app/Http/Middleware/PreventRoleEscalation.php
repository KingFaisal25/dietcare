<?php

namespace App\Http\Middleware;

use App\Domain\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks attempts to assign roles above the caller's privilege level.
 * Only admins may assign admin or nutritionist roles.
 */
class PreventRoleEscalation
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestedRole = $request->input('role');

        if ($requestedRole === null || $requestedRole === '') {
            return $next($request);
        }

        $targetRole = UserRole::tryFrom($requestedRole);

        if (!$targetRole) {
            return $next($request);
        }

        $user = $request->user();

        if (!$user) {
            if ($targetRole !== UserRole::Patient) {
                return $this->forbidden();
            }

            return $next($request);
        }

        if (!$user->isAdmin() && in_array($targetRole, [UserRole::Admin, UserRole::Nutritionist], true)) {
            return $this->forbidden();
        }

        $currentRole = UserRole::tryFrom($user->getRoleNames()->first() ?? UserRole::Patient->value)
            ?? UserRole::Patient;

        if (!$user->isAdmin() && $targetRole->isHigherThan($currentRole)) {
            return $this->forbidden();
        }

        return $next($request);
    }

    private function forbidden(): Response
    {
        return response()->json([
            'success' => false,
            'message' => 'Anda tidak diizinkan menetapkan role tersebut.',
        ], 403);
    }
}
