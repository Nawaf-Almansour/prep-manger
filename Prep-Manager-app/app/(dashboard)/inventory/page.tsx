'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInventory } from '@/hooks/useInventory';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Package } from 'lucide-react';
import { useState } from 'react';
import { getStockStatusColor, canManageInventory } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { InventoryItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function InventoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: inventory, isLoading } = useInventory();

  const canManage = user && canManageInventory(user.role);

  // Ensure we always have an array
  const inventoryArray = Array.isArray(inventory) ? inventory : [];

  const filteredInventory = inventoryArray.filter((item: InventoryItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('inventory.title')}</h1>
            <p className="text-gray-500 mt-1">{t('inventory.subtitle')}</p>
          </div>
          {canManage && user?.role === 'manager' && (
            <Button onClick={() => router.push('/inventory/new')}>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t('inventory.addItem')}
            </Button>
          )}
        </div>

        <div className="max-w-md">
          <Input
            type="text"
            placeholder={t('inventory.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredInventory && filteredInventory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => router.push(`/inventory/${item.id}`)}
              >
                {/* Item Image */}
                <div className="relative h-32 w-full bg-gray-100">
                  {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('inventory.currentStock')}:</span>
                      <span className="font-semibold">
                        {item.currentQuantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('inventory.minThreshold')}:</span>
                      <span className="text-sm">
                        {item.minThreshold} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.status')}:</span>
                      <Badge className={getStockStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {item.status !== 'in_stock' && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-red-600 font-medium">
                        {item.status === 'out_of_stock' 
                          ? `⚠️ ${t('inventory.outOfStockWarning')}` 
                          : `⚠️ ${t('inventory.lowStockWarning')}`
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {t('inventory.noItems')}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
