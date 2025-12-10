'use client';

import Header from './Header';
import Sidebar from './Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ltr:md:pl-64 rtl:md:pr-64">
          <Header />
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
