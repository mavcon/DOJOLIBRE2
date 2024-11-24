import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, MapPin, BarChart2, Mail, History, Settings, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const adminLinks = [
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/locations', icon: MapPin, label: 'Locations' },
];

const superAdminLinks = [
  ...adminLinks,
  { to: '/admin/plans', icon: CreditCard, label: 'Plans' },
  { to: '/admin/invites', icon: Mail, label: 'Invites' },
  { to: '/admin/changelog', icon: History, label: 'Changelog' },
];

export function AdminNav() {
  const user = useAuthStore(state => state.user);
  const links = user?.role === 'SUPER_ADMIN' ? superAdminLinks : adminLinks;

  return (
    <nav className="flex items-center gap-4 mb-6 border-b dark:border-gray-800 pb-4">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              isActive && 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
            )
          }
        >
          <link.icon className="w-4 h-4" />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}