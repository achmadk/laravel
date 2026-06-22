<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerifiedOptional
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('security.auth.verify_email')) {
            return $next($request);
        }

        return app(EnsureEmailIsVerified::class)->handle($request, $next);
    }
}
