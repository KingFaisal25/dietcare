'use client';

import React, { useState, useEffect } from 'react';
import { FiBell, FiMessageSquare, FiCalendar, FiTarget, FiCreditCard } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { buildBackendUrl } from '@/lib/url';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<'pusher'>;
  }
}

// Setup Echo (Pusher) - Adjust with your .env config
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: buildBackendUrl('/broadcasting/auth'),
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  });
}

interface Notification {
  id: string;
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
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Real-time listener
    if (user?.id && typeof window !== 'undefined' && window.Echo) {
      window.Echo.private(`user.${user.id}`)
        .listen('.notification.sent', (e: { notification: Notification }) => {
          setNotifications((prev) => [e.notification, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
          // Optional: show toast
        });
    }

    return () => {
      if (user?.id && typeof window !== 'undefined' && window.Echo) {
        window.Echo.leave(`user.${user.id}`);
      }
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?status=all');
      setNotifications(res.data.data.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'nutritionist_message': return <FiMessageSquare className="text-blue-500" />;
      case 'consultation_reminder': return <FiCalendar className="text-purple-500" />;
      case 'meal_reminder': return <FiTarget className="text-orange-500" />;
      case 'payment_success': return <FiCreditCard className="text-green-500" />;
      default: return <FiBell className="text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-green-600 transition-colors focus:outline-none"
      >
        <FiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 z-50 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-800">Notifikasi</h3>
              <Link
                href="/notifikasi"
                className="text-xs text-green-600 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Lihat Semua
              </Link>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) markAsRead(notif.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
                      !notif.is_read ? 'bg-green-50/30' : ''
                    }`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className={`p-2 rounded-lg bg-white shadow-sm ring-1 ring-gray-100`}>
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <FiBell size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">Belum ada notifikasi</p>
                </div>
              )}
            </div>

            <Link
              href="/notifikasi"
              onClick={() => setIsOpen(false)}
              className="block w-full border-t border-gray-100 bg-gray-50 py-3 text-center text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              LIHAT SEMUA NOTIFIKASI
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
