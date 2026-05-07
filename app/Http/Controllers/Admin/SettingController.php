<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\SystemConfig;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index()
    {
        $settings = SystemConfig::all()->groupBy('group');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.value' => 'required|scalar|max:1000',
            'settings.*.group' => 'required|string|in:general,payment,notification,email',
        ]);

        $settings = $request->get('settings');
        
        foreach($settings as $key => $data) {
            // Only allow alphanumeric keys with underscores
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $key)) {
                continue;
            }
            // Ensure value converts cleanly if it's enum, int or float
            $value = is_bool($data['value']) ? ($data['value'] ? 'true' : 'false') : (string) $data['value'];
            SystemConfig::setValue($key, $value, $data['group']);
        }

        // Clear settings cache
        Cache::forget('system_settings');

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function testEmail(Request $request)
    {
        // Test mail sending logic
        return response()->json(['message' => 'Test email sent']);
    }
}
