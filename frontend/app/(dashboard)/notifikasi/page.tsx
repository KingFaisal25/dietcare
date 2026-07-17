"use client";

import React, { useState, useEffect } from "react";
import { FiBell, FiMessageSquare, FiCalendar, FiTarget, FiCreditCard, FiCheck, FiTrash2, FiArrowLeft } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotifikasiPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const statusQuery = filter === "unread" ? "?status=unread" : "";
      const res = await api.get(`/notifications${statusQuery}`);
      setNotifications(res.data.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  useEffect(() => {
        if (user?.id) {
            fetchNotifications();
            fetchUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user?.id, filter]);

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "nutritionist_message":
        return <FiMessageSquare className="text-blue-500" />;
      case "consultation_reminder":
        return <FiCalendar className="text-purple-500" />;
      case "meal_reminder":
        return <FiTarget className="text-orange-500" />;
      case "payment_success":
        return <FiCreditCard className="text-green-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/klien-dashboard">
            <Button variant="ghost" size="sm" className="p-2">
              <FiArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Notifikasi</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount} notifikasi belum dibaca
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="ml-auto">
              <FiCheck className="mr-2 h-4 w-4" />
              Tandai semua dibaca
            </Button>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Semua
          </Button>
          <Button
            variant={filter === "unread" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Belum dibaca
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * notifications.indexOf(notif) }}
              >
                <Card
                  className={`p-4 transition-all ${
                    !notif.is_read ? "border-l-4 border-l-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          !notif.is_read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!notif.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notif.id)}
                          className="h-8 w-8 p-0"
                        >
                          <FiCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notif.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FiBell className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Belum ada notifikasi</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              Notifikasi baru tentang pesan ahli gizi, jadwal konsultasi, dan update program akan muncul di sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotifikasiPage;
