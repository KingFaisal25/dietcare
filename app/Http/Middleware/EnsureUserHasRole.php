<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Unified role-checking middleware.
 * Usage in routes: ->middleware('role:admin') or ->middleware('role:admin,nutritionist')
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Support Spatie's hasRole
        foreach ($roles as $role) {
            if ($user->hasRole(trim($role))) {
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki akses untuk fitur ini.',
        ], 403);
    }
}
