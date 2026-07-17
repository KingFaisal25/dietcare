"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiMessageSquare, FiCalendar, FiTarget, FiCreditCard, FiCheck, FiTrash2, FiX } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/notifications?status=all");
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
    }, [user?.id]);

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[var(--background)] text-neutral-500 transition-all hover:text-brand-600 hover:bg-brand-50"
        aria-label="Notifications"
      >
        <FiBell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-0 mt-2 w-80 z-50 overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifikasi</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <FiCheck />
                    Tandai semua baca
                  </button>
                )}
                <Link
                  href="/notifikasi"
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsOpen(false)}
                >
                  Lihat semua
                </Link>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group flex items-start gap-3 p-4 transition-colors ${
                        !notif.is_read ? "bg-emerald-50/30 dark:bg-emerald-950/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700">
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
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase font-medium">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {!notif.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-emerald-500 hover:text-emerald-600 transition-opacity"
                            aria-label="Mark as read"
                          >
                            <FiCheck className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                          aria-label="Delete notification"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <FiBell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Belum ada notifikasi</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Notifikasi baru akan muncul di sini
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <Link
              href="/notifikasi"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Lihat semua notifikasi
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
