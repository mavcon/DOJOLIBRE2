import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, User, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getMenuItems = () => {
    if (user.role === 'MEMBER') {
      return [
        { icon: User, label: 'Profile', onClick: () => navigate('/dashboard/profile') },
        { icon: Settings, label: 'Settings', onClick: () => navigate('/dashboard/settings') },
        { icon: CreditCard, label: 'Billing', onClick: () => navigate('/dashboard/billing') },
        { icon: LogOut, label: 'Logout', onClick: logout },
      ];
    }
    
    // For PARTNER, ADMIN, and SUPER_ADMIN
    return [
      { icon: Settings, label: 'Settings', onClick: () => navigate('/dashboard/settings') },
      { icon: LogOut, label: 'Logout', onClick: logout },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center hover:ring-2 hover:ring-indigo-500 transition-all"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {user.name[0]}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg py-1 z-50 border dark:border-gray-800"
          >
            <div className="px-4 py-2 border-b dark:border-gray-800">
              <p className="text-sm font-medium dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}