<?php

namespace App\Http\Controllers\Nutritionist;

use App\Http\Controllers\Controller;
use App\Models\ClientMessage;
use App\Models\NutritionistProgram;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * GET /nutritionist/clients/{clientId}/messages
     * Returns all messages for the nutritionist program with this client.
     */
    public function index(Request $request, int $clientId)
    {
        $program = NutritionistProgram::query()
            ->where('nutritionist_id', $request->user()->id)
            ->where('client_id', $clientId)
            ->latest('start_date')
            ->firstOrFail();

        $messages = ClientMessage::query()
            ->where('nutritionist_program_id', $program->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (ClientMessage $m) => [
                'id'          => $m->id,
                'sender_role' => $m->sender_role,
                'message'     => $m->message,
                'read_at'     => $m->read_at?->toISOString(),
                'created_at'  => $m->created_at->toISOString(),
            ]);

        // Mark unread client messages as read
        ClientMessage::query()
            ->where('nutritionist_program_id', $program->id)
            ->where('sender_role', 'client')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'data'    => $messages,
        ]);
    }

    /**
     * POST /nutritionist/clients/{clientId}/messages
     * Sends a message from the nutritionist to the client.
     */
    public function store(Request $request, int $clientId)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $program = NutritionistProgram::query()
            ->where('nutritionist_id', $request->user()->id)
            ->where('client_id', $clientId)
            ->latest('start_date')
            ->firstOrFail();

        $msg = ClientMessage::create([
            'nutritionist_program_id' => $program->id,
            'sender_role'             => 'nutritionist',
            'message'                 => $request->input('message'),
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'          => $msg->id,
                'sender_role' => $msg->sender_role,
                'message'     => $msg->message,
                'read_at'     => null,
                'created_at'  => $msg->created_at->toISOString(),
            ],
        ], 201);
    }
}
