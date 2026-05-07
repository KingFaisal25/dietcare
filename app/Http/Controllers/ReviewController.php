<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Review;
use App\Models\NutritionistProgram;
use App\Models\NutritionistProfile;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Submit a review for a completed program.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nutritionist_program_id' => 'required|exists:nutritionist_programs,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|min:20',
        ]);

        $program = NutritionistProgram::findOrFail($request->nutritionist_program_id);

        // Check if user is the client of this program
        if ($program->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if program is completed
        if ($program->status !== 'completed') {
            return response()->json(['message' => 'Program is not completed yet'], 400);
        }

        // Check if already reviewed
        if (Review::where('nutritionist_program_id', $program->id)->exists()) {
            return response()->json(['message' => 'You have already reviewed this program'], 400);
        }

        return DB::transaction(function () use ($request, $program) {
            $review = Review::create([
                'nutritionist_program_id' => $program->id,
                'client_id' => $request->user()->id,
                'nutritionist_id' => $program->nutritionist_id,
                'rating' => $request->rating,
                'title' => $request->title,
                'content' => $request->content,
            ]);

            // Update nutritionist profile rating
            $this->updateNutritionistRating($program->nutritionist_id);

            return response()->json($review, 201);
        });
    }

    /**
     * Get reviews for a nutritionist (public).
     */
    public function nutritionistReviews($nutritionistId)
    {
        $reviews = Review::where('nutritionist_id', $nutritionistId)
            ->where('is_approved', true)
            ->with(['client', 'nutritionistProgram.program'])
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Admin: List all reviews.
     */
    public function adminIndex()
    {
        $reviews = Review::with(['client', 'nutritionist', 'nutritionistProgram.program'])
            ->latest()
            ->paginate(20);

        return response()->json($reviews);
    }

    /**
     * Admin: Approve review.
     */
    public function approve($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_approved' => true]);

        return response()->json(['message' => 'Review approved']);
    }

    /**
     * Admin: Feature review.
     */
    public function feature($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_featured' => !$review->is_featured]);

        return response()->json(['message' => $review->is_featured ? 'Review featured' : 'Review unfeatured']);
    }

    /**
     * Helper: Update nutritionist profile avg_rating and total_reviews.
     */
    private function updateNutritionistRating($nutritionistId)
    {
        $profile = NutritionistProfile::where('user_id', $nutritionistId)->first();
        if ($profile) {
            $stats = Review::where('nutritionist_id', $nutritionistId)
                ->where('is_approved', true)
                ->selectRaw('avg(rating) as avg_rating, count(*) as total_reviews')
                ->first();

            $profile->update([
                'avg_rating' => round($stats->avg_rating, 2),
                'total_reviews' => $stats->total_reviews,
            ]);
        }
    }
}
