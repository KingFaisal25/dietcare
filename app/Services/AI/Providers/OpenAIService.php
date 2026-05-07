<?php

namespace App\Services\AI\Providers;

use App\Contracts\AI\AIServiceInterface;
use OpenAI;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OpenAIService implements AIServiceInterface
{
    protected $client;
    protected $defaultModel;

    public function __construct()
    {
        $this->client = OpenAI::client(config('services.openai.key'));
        $this->defaultModel = config('services.openai.model', 'gpt-4o');
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
            'cost_usd' => ($response->usage->promptTokens * 5 / 1000000) + ($response->usage->completionTokens * 15 / 1000000), // gpt-4o pricing approx
        ];
    }

    public function analyzeImage(string $systemPrompt, string $base64Image, array $options = []): array
    {
        $response = $this->client->chat()->create([
            'model' => $options['model'] ?? 'gpt-4o',
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
            'cost_usd' => ($response->usage->promptTokens * 5 / 1000000) + ($response->usage->completionTokens * 15 / 1000000),
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
