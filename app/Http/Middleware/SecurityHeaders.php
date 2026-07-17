<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds security headers to all responses.
 * Covers XSS protection, content-type sniffing, clickjacking, and CSP.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

        // Content Security Policy — adjust as needed for your CDN / third-party scripts
        if (app()->environment('production')) {
            $response->headers->set(
                'Content-Security-Policy',
                implode('; ', [
                    "default-src 'self'",
                    "script-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com https://meet.jit.si 'unsafe-inline'",
                    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
                    "font-src 'self' https://fonts.gstatic.com",
                    "img-src 'self' data: https:",
                    "connect-src 'self' https://api.midtrans.com https://app.sandbox.midtrans.com wss:",
                    "frame-src https://app.midtrans.com https://app.sandbox.midtrans.com https://meet.jit.si",
                ])
            );

            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}
