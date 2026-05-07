<?php

namespace App\Contracts\AI;

interface AIServiceInterface
{
    /**
     * Generate text/JSON from a prompt.
     *
     * @param string $systemPrompt
     * @param string $userPrompt
     * @param array $options (model, temperature, etc.)
     * @return array { content, tokens_used, cost_usd }
     */
    public function chat(string $systemPrompt, string $userPrompt, array $options = []): array;

    /**
     * Analyze an image (Vision).
     *
     * @param string $systemPrompt
     * @param string $base64Image
     * @param array $options
     * @return array { content, tokens_used, cost_usd }
     */
    public function analyzeImage(string $systemPrompt, string $base64Image, array $options = []): array;

    /**
     * Stream a chat response.
     *
     * @param array $messages
     * @param array $options
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function streamChat(array $messages, array $options = []): \Symfony\Component\HttpFoundation\StreamedResponse;
}
