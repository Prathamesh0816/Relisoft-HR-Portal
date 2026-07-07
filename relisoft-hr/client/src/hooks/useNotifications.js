import { useEffect } from 'react';
import useAppStore from '../store/appStore.js';
import { notificationAPI } from '../services/api.js';

export const useNotifications = () => {
  const { notifications, setNotifications, unreadCount, setUnreadCount } = useAppStore();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 20 });
      setNotifications(data.data || data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationAPI.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetchNotifications };
};
