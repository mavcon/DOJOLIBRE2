import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapPin, BarChart2, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const memberLinks = [
  { to: '/performance', icon: BarChart2, label: 'Performance' },
  { to: '/locations', icon: MapPin, label: 'Locations' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
];

const adminLinks = [
  ...memberLinks,
];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const links = user?.role === 'MEMBER' ? memberLinks : adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50',
                isActive && 'bg-indigo-50 text-indigo-700'
              )
            }
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}