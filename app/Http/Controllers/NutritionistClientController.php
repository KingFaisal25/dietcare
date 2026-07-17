<?php

namespace App\Http\Controllers;

use App\Application\Services\ClientManagementService;
use Illuminate\Http\Request;

class NutritionistClientController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ClientManagementService $clientManagementService
    ) {}

    public function index(Request $request)
    {
        $nutritionistId = $request->user()->id;
        $data = $this->clientManagementService->getActiveClientsData($nutritionistId);

        return $this->success('Daftar klien aktif berhasil diambil.', $data);
    }

    public function show(Request $request, int $id)
    {
        $nutritionistId = $request->user()->id;
        $details = $this->clientManagementService->getClientDetails($nutritionistId, $id);

        if (!$details) {
            return $this->error('Klien tidak ditemukan atau tidak berada di bawah pendampingan Anda.', 404);
        }

        return $this->success('Detail klien berhasil diambil.', $details);
    }

    public function saveNote(Request $request, int $id)
    {
        $request->validate([
            'note' => ['nullable', 'string', 'max:10000'],
        ]);

        $nutritionistId = $request->user()->id;
        $savedNote = $this->clientManagementService->saveClientNote($nutritionistId, $id, $request->input('note'));

        if ($savedNote === null && $request->input('note') !== null) {
            return $this->error('Gagal menyimpan catatan.', 404);
        }

        return $this->success('Catatan berhasil disimpan.', [
            'nutritionist_note' => $savedNote,
        ]);
    }

    public function getMessages(Request $request, int $id)
    {
        $nutritionistId = $request->user()->id;
        $messages = $this->clientManagementService->getClientMessages($nutritionistId, $id);

        if ($messages === null) {
            return $this->error('Klien tidak ditemukan.', 404);
        }

        return $this->success('Pesan berhasil diambil.', $messages);
    }

    public function sendMessage(Request $request, int $id)
    {
        $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $nutritionistId = $request->user()->id;
        $msg = $this->clientManagementService->sendClientMessage($nutritionistId, $id, $request->input('message'));

        if ($msg === null) {
            return $this->error('Klien tidak ditemukan.', 404);
        }

        return $this->success('Pesan berhasil dikirim.', $msg);
    }
}

