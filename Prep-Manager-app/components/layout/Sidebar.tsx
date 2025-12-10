'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  CheckSquare,
  ClipboardList,
  Package,
  Warehouse,
  BarChart3,
  Users,
  X,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, labelKey: 'nav.dashboard', href: '/dashboard', roles: ['prep', 'supervisor', 'manager'] },
  { icon: CheckSquare, labelKey: 'nav.myTasks', href: '/tasks/my-tasks', roles: ['prep', 'supervisor', 'manager'] },
  { icon: ClipboardList, labelKey: 'nav.allTasks', href: '/tasks', roles: ['supervisor', 'manager'] },
  { icon: Package, labelKey: 'nav.products', href: '/products', roles: ['prep', 'supervisor', 'manager'] },
  { icon: Tag, labelKey: 'nav.categories', href: '/categories', roles: ['manager'] },
  { icon: Warehouse, labelKey: 'nav.inventory', href: '/inventory', roles: ['prep', 'supervisor', 'manager'] },
  { icon: BarChart3, labelKey: 'nav.reports', href: '/reports', roles: ['supervisor', 'manager'] },
  { icon: Users, labelKey: 'nav.users', href: '/users', roles: ['manager'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { t } = useLanguage();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      {/* Mobile overlay */}
      {sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-50 h-full w-64 bg-white transition-transform duration-200',
          'ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l',
          // On desktop (md): always visible (translate-x-0)
          // On mobile: hidden by default, show when sidebarCollapsed is true
          'md:ltr:translate-x-0 md:rtl:translate-x-0',
          sidebarCollapsed 
            ? 'ltr:translate-x-0 rtl:translate-x-0' 
            : 'ltr:-translate-x-full rtl:translate-x-full md:ltr:translate-x-0 md:rtl:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">🍽️</div>
            <span className="text-xl font-bold">{t('app.name')}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t(item.labelKey)}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="text-xs text-gray-500">
            Logged in as <span className="font-medium">{user?.role}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
