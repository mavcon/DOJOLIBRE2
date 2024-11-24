import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageCircle, UserPlus, CreditCard, MapPin, Trash2, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import { INotification } from '../types/notification';
import { MessageDialog } from '../components/messages/MessageDialog';

const notificationIcons = {
  message: MessageCircle,
  follow: UserPlus,
  billing: CreditCard,
  'check-in': MapPin,
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const { users } = useUserStore();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotificationStore();

  const [selectedMessageUser, setSelectedMessageUser] = useState<typeof users[0] | null>(null);

  if (!currentUser) return null;

  const userNotifications = notifications
    .filter((n) => n.userId === currentUser.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.type === 'message' && notification.metadata?.senderId) {
      const sender = users.find(u => u.id === notification.metadata.senderId);
      if (sender) {
        setSelectedMessageUser(sender);
        return;
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <Button onClick={markAllAsRead} variant="outline">
          Mark all as read
        </Button>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-md border dark:border-gray-800">
        <AnimatePresence>
          {userNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p>No notifications yet</p>
            </div>
          ) : (
            userNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`p-4 border-b dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${
                    !notification.read ? 'bg-indigo-50 dark:bg-gray-900' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex items-start gap-4 flex-1"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={`p-2 rounded-full ${
                        !notification.read ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          !notification.read ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          !notification.read ? 'text-indigo-900 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-200'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-indigo-600 dark:text-indigo-400"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {selectedMessageUser && (
        <MessageDialog
          recipient={selectedMessageUser}
          isOpen={!!selectedMessageUser}
          onClose={() => setSelectedMessageUser(null)}
        />
      )}
    </div>
  );
}