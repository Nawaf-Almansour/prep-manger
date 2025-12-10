'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventoryItem } from '@/hooks/useInventory';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Package, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { use } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function InventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const { id } = use(params);
  const { data: item, isLoading } = useInventoryItem(id);

  const canEdit = user?.role === 'supervisor' || user?.role === 'manager';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800">{t('inventory.inStock')}</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('inventory.lowStock')}</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">{t('inventory.outOfStock')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStockPercentage = () => {
    if (!item) return 0;
    return Math.round((item.currentQuantity / item.maxThreshold) * 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vegetable':
        return '🥬';
      case 'meat':
        return '🥩';
      case 'dairy':
        return '🥛';
      case 'grain':
        return '🌾';
      case 'spice':
        return '🌶️';
      case 'sauce':
        return '🥫';
      default:
        return '📦';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">{t('inventory.itemNotFound')}</p>
          <Button onClick={() => router.push('/inventory')} className="mt-4">
            {t('inventory.backToInventory')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">{getCategoryIcon(item.category)}</span>
                {item.name}
              </h1>
              <p className="text-gray-500 mt-1 capitalize">{item.category}</p>
            </div>
          </div>
          {canEdit && (
            <Button className="gap-2" onClick={() => router.push(`/inventory/${id}/edit`)}>
              <Edit className="h-4 w-4" />
              {t('common.edit')}
            </Button>
          )}
        </div>

        {/* Item Image */}
        {item.image && (
          <Card className="overflow-hidden">
            <div className="relative h-64 w-full bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        )}

        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('inventory.currentStatus')}</p>
                {getStatusBadge(item.status)}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">
                  {item.currentQuantity} {item.unit}
                </p>
                <p className="text-sm text-gray-500">{t('inventory.currentStock')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle>{t('inventory.stockLevels')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('inventory.stockLevel')}</span>
                <span className="text-sm text-gray-500">{getStockPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    getStockPercentage() > 50
                      ? 'bg-green-500'
                      : getStockPercentage() > 20
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(getStockPercentage(), 100)}%` }}
                />
              </div>
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  <p className="text-sm font-medium text-gray-700">{t('inventory.minThreshold')}</p>
                </div>
                <p className="text-2xl font-bold">
                  {item.minThreshold} {item.unit}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('inventory.lowStockAlertLevel')}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  <p className="text-sm font-medium text-gray-700">{t('inventory.currentStock')}</p>
                </div>
                <p className="text-2xl font-bold">
                  {item.currentQuantity} {item.unit}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('inventory.availableNow')}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-medium text-gray-700">{t('inventory.maxThreshold')}</p>
                </div>
                <p className="text-2xl font-bold">
                  {item.maxThreshold} {item.unit}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('inventory.maximumCapacity')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {item.status === 'low_stock' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">{t('inventory.lowStockAlert')}</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t('inventory.lowStockMessage')} ({item.currentQuantity} {item.unit}) {t('inventory.isBelowMin')} ({item.minThreshold} {item.unit}). {t('inventory.considerRestocking')}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {item.status === 'out_of_stock' && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">{t('inventory.outOfStock')}</p>
                  <p className="text-sm text-red-700 mt-1">
                    {t('inventory.outOfStockMessage')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Item Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t('inventory.itemDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('inventory.itemId')}</p>
                <p className="font-mono text-sm mt-1">{item.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('inventory.unitOfMeasurement')}</p>
                <p className="font-medium mt-1">{item.unit}</p>
              </div>
              {item.nameAr && (
                <div>
                  <p className="text-sm text-gray-500">{t('inventory.itemNameAr')}</p>
                  <p className="font-medium mt-1" dir="rtl">{item.nameAr}</p>
                </div>
              )}
              {item.supplier && (
                <div>
                  <p className="text-sm text-gray-500">{t('inventory.supplier')}</p>
                  <p className="font-medium mt-1">{item.supplier}</p>
                </div>
              )}
              {item.cost !== undefined && item.cost !== null && (
                <div>
                  <p className="text-sm text-gray-500">{t('inventory.costPerUnit')}</p>
                  <p className="font-medium mt-1">${item.cost.toFixed(2)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">{t('products.lastUpdated')}</p>
                <p className="font-medium mt-1">
                  {item.lastUpdated ? new Date(item.lastUpdated).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('inventory.created')}</p>
                <p className="font-medium mt-1">
                  {new Date(item.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {canEdit && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              {t('inventory.restockItem')}
            </Button>
            <Button variant="outline" className="flex-1">
              {t('inventory.adjustQuantity')}
            </Button>
            <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50">
              {t('inventory.deleteItem')}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
