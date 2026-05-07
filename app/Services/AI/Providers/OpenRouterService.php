<?php

namespace App\Services\AI\Providers;

use App\Contracts\AI\AIServiceInterface;
use OpenAI;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OpenRouterService implements AIServiceInterface
{
    protected $client;
    protected $defaultModel;

    public function __construct()
    {
        $this->client = OpenAI::factory()
            ->withApiKey(config('services.openrouter.key'))
            ->withBaseUri('https://openrouter.ai/api/v1')
            ->make();
        
        $this->defaultModel = config('services.openrouter.model', 'google/gemma-7b-it:free');
    }

    public function chat(string $systemPrompt, string $userPrompt, array $options = []): array
    {
        $response = $this->client->chat()->create([
            'model' => $options['model'] ?? $this->defaultModel,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt],
            ],
            'response_format' => $options['response_format'] ?? null,
            'temperature' => $options['temperature'] ?? 0.7,
        ]);

        return [
            'content' => $response->choices[0]->message->content,
            'tokens_used' => $response->usage->totalTokens,
            'cost_usd' => 0, // Free models have no cost on OpenRouter
        ];
    }

    public function analyzeImage(string $systemPrompt, string $base64Image, array $options = []): array
    {
        // Many free OpenRouter models don't support Vision, 
        // fallback to paid models or other provider if needed.
        $response = $this->client->chat()->create([
            'model' => $options['model'] ?? 'google/gemini-flash-1.5', // OpenRouter's cheap vision model
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        ['type' => 'text', 'text' => $systemPrompt],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => "data:image/jpeg;base64,{$base64Image}",
                            ],
                        ],
                    ],
                ],
            ],
            'response_format' => ['type' => 'json_object'],
        ]);

        return [
            'content' => $response->choices[0]->message->content,
            'tokens_used' => $response->usage->totalTokens,
            'cost_usd' => ($response->usage->promptTokens * 0.075 / 1000000) + ($response->usage->completionTokens * 0.3 / 1000000), // Gemini 1.5 Flash on OpenRouter is very cheap
        ];
    }

    public function streamChat(array $messages, array $options = []): StreamedResponse
    {
        return new StreamedResponse(function () use ($messages, $options) {
            $stream = $this->client->chat()->createStreamed([
                'model' => $options['model'] ?? $this->defaultModel,
                'messages' => $messages,
                'temperature' => $options['temperature'] ?? 0.7,
            ]);

            foreach ($stream as $response) {
                $text = $response->choices[0]->delta->content;
                if ($text) {
                    echo "data: " . json_encode(['text' => $text]) . "\n\n";
                    ob_flush();
                    flush();
                }
            }
            echo "data: [DONE]\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
