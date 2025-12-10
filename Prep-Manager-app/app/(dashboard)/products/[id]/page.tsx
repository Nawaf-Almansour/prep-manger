'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Clock, RefreshCw, Package, Loader2, ChefHat, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { formatDuration } from '@/lib/utils';
import { RequiredIngredient } from '@/types';
import { use, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import SchedulePreparationDialog from '@/components/products/SchedulePreparationDialog';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit = user?.role === 'supervisor' || user?.role === 'manager';

  const handleDelete = () => {
    if (!product?.id) return;
    
    deleteProduct(product.id, {
      onSuccess: () => {
        router.push('/products');
      },
      onError: (error) => {
        console.error('Delete error:', error);
        alert('Failed to delete product. Please try again.');
      },
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appetizer':
        return '🥗';
      case 'main':
        return '🍽️';
      case 'dessert':
        return '🍰';
      case 'beverage':
        return '🥤';
      case 'sauce':
        return '🥫';
      case 'side':
        return '🍟';
      case 'salad':
        return '🥙';
      case 'bakery':
        return '🥖';
      default:
        return '🍴';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      appetizer: 'Appetizer',
      main: 'Main Course',
      dessert: 'Dessert',
      beverage: 'Beverage',
      sauce: 'Sauce',
      side: 'Side Dish',
      salad: 'Salad',
      bakery: 'Bakery',
      other: 'Other',
    };
    return labels[category] || category;
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

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">{t('products.productNotFound')}</p>
          <Button onClick={() => router.push('/products')} className="mt-4">
            {t('products.backToProducts')}
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
                <span className="text-4xl">{getCategoryIcon(product.category)}</span>
                {product.name}
              </h1>
              <p className="text-gray-500 mt-1">{getCategoryLabel(product.category)}</p>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button className="gap-2" onClick={() => router.push(`/products/${id}/edit`)}>
                <Edit className="h-4 w-4" />
                {t('common.edit')}
              </Button>
              <Badge className={product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {product.isActive ? t('common.active') : t('common.inactive')}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Image */}
        {product.image && (
          <Card className="overflow-hidden">
            <div className="relative h-64 w-full bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        )}

        {/* Description */}
        {product.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700">{product.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Preparation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('products.preparationTime')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatDuration(product.prepTimeMinutes)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('products.timeRequired')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('products.preparationInterval')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {t('products.every')} {product.prepIntervalHours}{t('time.hours')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('products.howOftenPrepared')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Required Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('products.requiredIngredients')} ({Array.isArray(product.ingredients) ? product.ingredients.length : 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(product.ingredients) && product.ingredients.length > 0 ? (
              <div className="space-y-3">
                {product.ingredients.map((ingredient: RequiredIngredient, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{ingredient.name}</p>
                        <p className="text-sm text-gray-500">{t('products.ingredientId')}: {ingredient.ingredientId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {ingredient.quantity} {ingredient.unit}
                      </p>
                      <p className="text-xs text-gray-500">{t('products.requiredAmount')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">{t('products.noIngredients')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t('products.productInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('products.productId')}</p>
                <p className="font-mono text-sm mt-1">{product.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.status')}</p>
                <p className="font-medium mt-1">{product.isActive ? t('common.active') : t('common.inactive')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('products.createdBy')}</p>
                <p className="font-medium mt-1">{product.createdBy || 'System'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.category')}</p>
                <p className="font-medium mt-1">{getCategoryLabel(product.category)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.createdAt')}</p>
                <p className="font-medium mt-1">
                  {new Date(product.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('products.lastUpdated')}</p>
                <p className="font-medium mt-1">
                  {new Date(product.updatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {canEdit && (
          <div className="flex gap-3">
            <SchedulePreparationDialog
              productId={product.id || id}
              productName={product.name}
              prepTimeMinutes={product.prepTimeMinutes}
              trigger={
                <Button variant="outline" className="flex-1">
                  {t('products.schedulePreparation')}
                </Button>
              }
            />
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push(`/products/${id}/tasks`)}
            >
              {t('products.viewTasks')}
            </Button>
            {!showDeleteConfirm ? (
              <Button 
                variant="outline" 
                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('products.deleteProduct')}
              </Button>
            ) : (
              <div className="flex-1 flex gap-2">
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('common.deleting')}...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common.confirmDelete')}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-blue-600">
                <ChefHat className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  {t('products.aboutThisProduct')}
                </p>
                <p className="text-sm text-blue-700">
                  {t('products.productSummary')} {product.ingredients?.length || 0} {t('products.ingredientsAndTakes')}{' '}
                  {formatDuration(product.prepTimeMinutes)} {t('products.toPrepare')}. {t('products.shouldBePrepared')}{' '}
                  {product.prepIntervalHours} {t('products.hoursToMaintain')}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
