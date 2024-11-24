import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';

export function NotificationBell() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const unreadCount = useNotificationStore((state) => 
    currentUser ? state.getUnreadCount(currentUser.id) : 0
  );

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative text-gray-600 dark:text-gray-400 transition-all duration-200 hover:text-indigo-600 dark:hover:text-indigo-400"
    >
      <Bell className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
          >
            {unreadCount}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}