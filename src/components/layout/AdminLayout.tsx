import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminNav } from '../admin/AdminNav';
import { TopBar } from './TopBar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        <AdminNav />
        <Outlet />
      </main>
    </div>
  );
}