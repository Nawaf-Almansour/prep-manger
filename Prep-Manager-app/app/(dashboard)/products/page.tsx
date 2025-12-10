'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Clock, RefreshCw, Search, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatDuration, canManageProducts } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: products, isLoading } = useProducts({ search: searchTerm });

  // Ensure we always have an array
  const productsArray = Array.isArray(products) ? products : [];

  const canEdit = user && canManageProducts(user.role);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('products.title')}</h1>
            <p className="text-gray-500 mt-1">{t('products.subtitle')}</p>
          </div>
          {canEdit && (
            <Button onClick={() => router.push('/products/new')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('products.addProduct')}
            </Button>
          )}
        </div>

        <div className="max-w-md relative">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('products.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ltr:pl-10 rtl:pr-10"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : productsArray.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsArray.map((product: Product) => (
              <Card
                key={product.id}
                className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                {/* Product Image */}
                <div className="relative h-40 w-full bg-gray-100">
                  {product.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{t('products.prepTime')}: {formatDuration(product.prepTimeMinutes)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <RefreshCw className="h-4 w-4" />
                      <span>{t('products.interval')}: {t('products.every')} {product.prepIntervalHours}{t('time.hours')}</span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">{product.ingredients.length}</span> {t('products.ingredientsRequired')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {t('products.noProducts')}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
