<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use App\Services\AI\AIManager;

class ChatbotController extends Controller
{
    protected $ai;

    public function __construct(AIManager $aiManager)
    {
        $this->ai = $aiManager->driver();
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'array', // Last 10 messages for context
        ]);

        $user = Auth::user();
        
        // Rate limiting
        $key = 'chatbot-messages:' . $user->id;
        $maxAttempts = $user->is_paid ? config('chatbot.rate_limit.paid') : config('chatbot.rate_limit.free');
        
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'message' => 'Anda telah mencapai batas pesan harian.',
                'retry_after' => RateLimiter::availableIn($key),
            ], 429);
        }

        RateLimiter::hit($key, 86400); // 24 hours

        // Context Injection
        $clientProfile = $user->clientProfile;
        $systemPrompt = config('chatbot.system_prompt');
        $systemPrompt = str_replace([
            '{user_name}',
            '{program_name}',
            '{calorie_target}',
            '{bmi}',
            '{goal}',
        ], [
            $user->name,
            $user->activeProgram?->name ?? 'Belum terdaftar program',
            $clientProfile->calorie_target ?? 'Belum diatur',
            $clientProfile->current_bmi ?? 'Belum dihitung',
            $clientProfile->goal ?? 'Belum diatur',
        ], $systemPrompt);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        // Add history
        foreach ($request->history ?? [] as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $request->message];

        return $this->ai->streamChat($messages);
    }

    public function getHistory()
    {
        // Assuming we store chat history in a table, but for now we'll just return an empty array
        // or let the frontend handle local storage for history.
        return response()->json([]);
    }

    public function deleteHistory()
    {
        // Logic to delete chat history from database
        return response()->json(['message' => 'History deleted']);
    }
}
