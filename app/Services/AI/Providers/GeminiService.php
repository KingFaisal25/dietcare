<?php

namespace App\Services\AI\Providers;

use App\Contracts\AI\AIServiceInterface;
use Gemini;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Gemini\Enums\MimeType;
use Gemini\Data\Blob;

class GeminiService implements AIServiceInterface
{
    protected $client;
    protected $defaultModel;

    public function __construct()
    {
        $this->client = Gemini::client(config('services.gemini.key'));
        $this->defaultModel = config('services.gemini.model', 'gemini-1.5-flash');
    }

    public function chat(string $systemPrompt, string $userPrompt, array $options = []): array
    {
        $model = $this->client->generativeModel(model: $options['model'] ?? $this->defaultModel);
        
        $response = $model->generateContent([
            $systemPrompt,
            $userPrompt
        ]);

        return [
            'content' => $response->text(),
            'tokens_used' => 0, // Gemini free tier doesn't always report this clearly via SDK
            'cost_usd' => 0,
        ];
    }

    public function analyzeImage(string $systemPrompt, string $base64Image, array $options = []): array
    {
        $model = $this->client->generativeModel(model: 'gemini-1.5-flash');
        
        $response = $model->generateContent([
            $systemPrompt,
            new Blob(
                mimeType: MimeType::IMAGE_JPEG,
                data: $base64Image
            )
        ]);

        return [
            'content' => $response->text(),
            'tokens_used' => 0,
            'cost_usd' => 0,
        ];
    }

    public function streamChat(array $messages, array $options = []): StreamedResponse
    {
        return new StreamedResponse(function () use ($messages, $options) {
            $model = $this->client->generativeModel(model: $options['model'] ?? $this->defaultModel);
            
            // Convert messages to Gemini format
            $contents = array_map(function($msg) {
                return $msg['content'];
            }, $messages);

            $stream = $model->streamGenerateContent($contents);

            foreach ($stream as $response) {
                $text = $response->text();
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
