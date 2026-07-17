<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->get('role');
        $search = $request->get('search');

        $users = User::query()
            ->when($role && $role != 'Semua', function($q) use ($role) {
                return $q->role(strtolower($role));
            })
            ->when($search, function($q) use ($search) {
                $escaped = str_replace(['%', '_'], ['\%', '\_'], $search);
                return $q->where(function($sq) use ($escaped) {
                    $sq->where('name', 'like', "%$escaped%")
                       ->orWhere('email', 'like', "%$escaped%");
                });
            })
            ->latest()
            ->paginate(10);

        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::with(['clientProfile', 'nutritionistProfile', 'orders'])->findOrFail($id);
        return response()->json($user);
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:admin,nutritionist,patient',
        ]);

        // Prevent self-role-change
        if ($id == $request->user()->id) {
            return response()->json(['message' => 'Tidak bisa mengubah role Anda sendiri.'], 403);
        }

        $user = User::findOrFail($id);
        $user->syncRoles([$request->role]);

        return response()->json(['message' => 'Role updated successfully']);
    }

    public function deactivate($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'inactive';
        $user->save();

        return response()->json(['message' => 'Account deactivated successfully']);
    }

    public function storeNutritionist(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20'
        ]);

        $password = Str::random(10);
        $username = Str::slug($request->name) . '-' . Str::random(4);

        $user = User::create([
            'name' => $request->name,
            'username' => $username,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($password),
            'email_verified_at' => now(), // Admin-created accounts are pre-verified
        ]);

        $user->assignRole('nutritionist');

        // TODO: Implement NutritionistInvitation mail
        // Mail::to($user->email)->send(new NutritionistInvitation($user, $password));

        return response()->json([
            'message' => 'Ahli gizi berhasil ditambahkan.',
            'temporary_password' => $password, // Show once so admin can share
        ]);
    }
}
