<?php

namespace App\Http\Controllers\Nutritionist;

use App\Http\Controllers\Controller;
use App\Application\Services\ClientManagementService;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct(
        private ClientManagementService $clientManagementService
    ) {}

    public function index()
    {
        $nutritionistId = Auth::id();
        $data = $this->clientManagementService->getActiveClientsData($nutritionistId);

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }
}

