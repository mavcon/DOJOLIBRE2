import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, BarChart2, MessageCircle, Bell, Building2, Users, History, Settings, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../lib/theme';
import { ProfileDropdown } from './ProfileDropdown';

const memberLinks = [
  { to: '/dashboard/performance', icon: BarChart2, label: 'Performance' },
  { to: '/dashboard/locations', icon: MapPin, label: 'Locations' },
  { to: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const partnerLinks = [
  { to: '/dashboard/locations', icon: Building2, label: 'My Locations' },
  { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const adminLinks = [
  { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/dashboard/users', icon: Users, label: 'Users' },
  { to: '/dashboard/locations', icon: MapPin, label: 'Locations' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const superAdminLinks = [
  ...adminLinks,
  { to: '/dashboard/plans', icon: CreditCard, label: 'Plans' },
  { to: '/dashboard/changelog', icon: History, label: 'Changelog' },
];

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  if (!user) return null;

  const getNavLinks = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return superAdminLinks;
      case 'ADMIN':
        return adminLinks;
      case 'PARTNER':
        return partnerLinks;
      default:
        return memberLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/DOJOLIBRE_LOGO2.svg" 
              alt="DOJOLIBRE"
              className="h-8 w-8 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            />
            <span 
              className="text-xl font-bold italic text-gray-900 dark:text-white cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              DOJOLIBRE
            </span>
          </div>

          <nav className="flex items-center gap-4">
            {navLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:text-indigo-600 dark:hover:text-indigo-400',
                  location.pathname === link.to && 'text-indigo-600 dark:text-indigo-400'
                )}
              >
                <link.icon className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
                <span className="hidden md:inline">
                  {link.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex items-center">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}