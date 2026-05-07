<?php

namespace App\Services\AI;

use App\Contracts\AI\AIServiceInterface;
use App\Services\AI\Providers\OpenAIService;
use App\Services\AI\Providers\OpenRouterService;
use App\Services\AI\Providers\GeminiService;
use Exception;

class AIManager
{
    public function driver(?string $driver = null): AIServiceInterface
    {
        $driver = $driver ?: config('services.ai_provider', 'openrouter');

        return match ($driver) {
            'openai' => new OpenAIService(),
            'openrouter' => new OpenRouterService(),
            'gemini' => new GeminiService(),
            default => throw new Exception("AI Provider [{$driver}] not supported."),
        };
    }
}
