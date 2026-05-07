'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FiBell, FiCheckCircle, FiCalendar, FiMessageSquare, FiTarget, FiCreditCard } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef<IntersectionObserver>();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/notifications?status=${filter}&page=${page}`);
      const newNotifications = res.data.data;
      
      if (page === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }
      
      setHasMore(res.data.current_page < res.data.last_page);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, page]);

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pusat Notifikasi</h1>
          <p className="text-gray-500 text-sm">Update terbaru mengenai program dan konsultasi gizi Anda</p>
        </div>
        <Button onClick={markAllAsRead} variant="outline" size="sm">
          <FiCheckCircle className="mr-2" /> Tandai Semua Dibaca
        </Button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`px-6 py-2 text-sm rounded-md transition-all font-medium ${
              filter === f ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'unread' ? 'Belum Dibaca' : 'Sudah Dibaca'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div 
              key={notif.id}
              ref={index === notifications.length - 1 ? lastElementRef : null}
            >
            <Card 
              className={`p-5 transition-all hover:shadow-md cursor-pointer border-l-4 ${
                !notif.is_read ? 'border-l-green-600 bg-green-50/10' : 'border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-bold ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium uppercase whitespace-nowrap">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {notif.message}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant={notif.is_read ? 'default' : 'success'}>
                      {notif.is_read ? 'Sudah Dibaca' : 'Baru'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
            </div>
          ))
        ) : (
          <Card className="p-12 text-center">
            <FiBell size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-800">Belum Ada Notifikasi</h3>
            <p className="text-gray-500 mt-1">Notifikasi akan muncul di sini ketika ada aktivitas terbaru</p>
          </Card>
        )}
        
        {isLoading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
