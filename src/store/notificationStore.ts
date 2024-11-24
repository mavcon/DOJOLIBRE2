import { create } from 'zustand';
import { INotification } from '../types/notification';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  addNotification: (notification: INotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  getUnreadCount: (userId: string) => number;
}

// Mock notifications for development
const MOCK_NOTIFICATIONS: INotification[] = [
  {
    id: '1',
    userId: '1',
    type: 'message',
    title: 'New Message',
    message: 'Jane Smith sent you a message',
    read: false,
    createdAt: new Date(),
    link: '/messages',
    metadata: {
      senderId: '2',
      messageId: '123',
    },
  },
  {
    id: '2',
    userId: '1',
    type: 'follow',
    title: 'New Follower',
    message: 'Mike Ross started following you',
    read: false,
    createdAt: new Date(Date.now() - 3600000),
    link: '/profile/mikeross',
    metadata: {
      senderId: '3',
    },
  },
  {
    id: '3',
    userId: '1',
    type: 'check-in',
    title: 'Check-in Confirmed',
    message: 'Successfully checked in at Downtown Toronto Dojo',
    read: true,
    createdAt: new Date(Date.now() - 7200000),
    link: '/locations',
    metadata: {
      locationId: '1',
    },
  },
  {
    id: '4',
    userId: '1',
    type: 'billing',
    title: 'Payment Successful',
    message: 'Your monthly membership has been renewed',
    read: true,
    createdAt: new Date(Date.now() - 86400000),
    link: '/profile',
    metadata: {
      billingId: 'bill_123',
    },
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.read).length,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Show browser notification if supported
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
      });
    }
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (notificationId) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== notificationId);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },

  getUnreadCount: (userId) => {
    return get().notifications.filter((n) => n.userId === userId && !n.read).length;
  },
}));