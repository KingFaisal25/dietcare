<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Program;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::withCount('orders')->get();
        return response()->json($programs);
    }

    public function show($id)
    {
        $program = Program::findOrFail($id);
        return response()->json($program);
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:programs,slug,' . $id,
            'description'       => 'required|string',
            'price'             => 'required|numeric|min:0',
            'duration_days'     => 'required|integer|min:1',
            'max_consultations' => 'required|integer|min:1',
            'features'          => 'nullable|array',
            'features.*'        => 'string|max:255',
            'is_active'         => 'boolean',
        ]);

        // Ensure slug is properly formatted
        $validated['slug'] = Str::slug($validated['slug']);

        $program->update($validated);

        // Clear public caches
        Cache::forget('public_programs');
        Cache::forget("program_{$program->slug}");
        // In case slug changed, also clear the old slug cache
        Cache::forget("program_{$request->input('slug')}");

        return response()->json([
            'message' => 'Program updated successfully',
            'program' => $program->fresh(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:programs,slug',
            'description'       => 'required|string',
            'price'             => 'required|numeric|min:0',
            'duration_days'     => 'required|integer|min:1',
            'max_consultations' => 'required|integer|min:1',
            'features'          => 'nullable|array',
            'features.*'        => 'string|max:255',
            'is_active'         => 'boolean',
        ]);

        // Ensure slug is properly formatted
        $validated['slug'] = Str::slug($validated['slug']);

        $program = Program::create($validated);

        // Clear public caches
        Cache::forget('public_programs');

        return response()->json([
            'message' => 'Program created successfully',
            'program' => $program,
        ], 201);
    }

    public function destroy($id)
    {
        $program = Program::findOrFail($id);
        $program->delete();

        // Clear public caches
        Cache::forget('public_programs');
        Cache::forget("program_{$program->slug}");

        return response()->json([
            'message' => 'Program deleted successfully',
        ]);
    }
}
