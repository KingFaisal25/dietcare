<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add database indexes on columns frequently used in WHERE, JOIN,
 * and ORDER BY clauses to improve query performance.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Orders — queried by user, status, and nutritionist
        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id', 'idx_orders_user_id');
            $table->index('nutritionist_id', 'idx_orders_nutritionist_id');
        });

        // Consultations — queried by schedule
        Schema::table('consultations', function (Blueprint $table) {
            $table->index('scheduled_at', 'idx_consultations_scheduled_at');
        });

        // Notifications — queried by user + read status
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('user_id', 'idx_notifications_user_id');
            $table->index('is_read', 'idx_notifications_is_read');
            $table->index(['user_id', 'is_read'], 'idx_notifications_user_unread');
        });

        // Blog posts — queried by status, author, and published date
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->index('author_id', 'idx_blog_posts_author_id');
            $table->index('status', 'idx_blog_posts_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_user_id');
            $table->dropIndex('idx_orders_nutritionist_id');
        });

        Schema::table('consultations', function (Blueprint $table) {
            $table->dropIndex('idx_consultations_scheduled_at');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_id');
            $table->dropIndex('idx_notifications_is_read');
            $table->dropIndex('idx_notifications_user_unread');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropIndex('idx_blog_posts_author_id');
            $table->dropIndex('idx_blog_posts_status');
        });
    }
};

