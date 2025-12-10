'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft, Loader2, Package, Upload, X } from 'lucide-react';
import { useInventoryItem, useUpdateInventoryItem, InventoryFormDataWithImage } from '@/hooks/useInventory';
import { useCategories } from '@/hooks/useCategories';
import { InventoryFormData } from '@/types';
import { use } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const inventorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  currentQuantity: z.number().min(0, 'Quantity must be 0 or greater'),
  minThreshold: z.number().min(0, 'Min threshold must be 0 or greater'),
  maxThreshold: z.number().min(1, 'Max threshold must be at least 1'),
  supplier: z.string().optional(),
  cost: z.number().min(0).optional(),
}).refine((data) => data.maxThreshold > data.minThreshold, {
  message: 'Max threshold must be greater than min threshold',
  path: ['maxThreshold'],
});

const units = [
  'kg',
  'g',
  'lb',
  'oz',
  'L',
  'ml',
  'pcs',
  'dozen',
  'cup',
  'tbsp',
  'tsp',
];

export default function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { id } = use(params);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { data: item, isLoading: isLoadingItem } = useInventoryItem(id);
  const { mutate: updateItem, isPending } = useUpdateInventoryItem();
  const { data: categories = [] } = useCategories(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      currentQuantity: 0,
      minThreshold: 10,
      maxThreshold: 100,
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        nameAr: item.nameAr || '',
        category: item.category,
        unit: item.unit,
        currentQuantity: item.currentQuantity,
        minThreshold: item.minThreshold,
        maxThreshold: item.maxThreshold,
        supplier: item.supplier || '',
        cost: item.cost || undefined,
      });
      if (item.image) {
        setImagePreview(item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`);
      }
    }
  }, [item, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(t('validation.invalidImageType'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t('validation.imageTooLarge'));
      return;
    }

    setError('');
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const onSubmit = (data: InventoryFormData) => {
    setError('');
    const submitData: Partial<InventoryFormDataWithImage> = {
      ...data,
      imageFile: imageFile || undefined,
    };
    updateItem({ itemId: id, data: submitData }, {
      onSuccess: () => {
        router.push(`/inventory/${id}`);
      },
      onError: (err: Error & { response?: { data?: { message?: string } } }) => {
        setError(err.response?.data?.message || 'Failed to update inventory item. Please try again.');
      },
    });
  };

  if (isLoadingItem) {
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
    <DashboardLayout allowedRoles={['supervisor', 'manager']}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
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
            <h1 className="text-3xl font-bold">{t('inventory.editItem')}</h1>
            <p className="text-gray-500 mt-1">{t('inventory.updateItemDetails')}</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('inventory.itemDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('inventory.itemName')} *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Tomatoes, Chicken Breast"
                    {...register('name')}
                    disabled={isPending}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameAr">{t('inventory.itemNameAr')}</Label>
                  <Input
                    id="nameAr"
                    type="text"
                    placeholder="مثال: طماطم، صدر دجاج"
                    dir="rtl"
                    {...register('nameAr')}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>{t('productImage')}</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">{t('clickToUpload')}</span>
                      <span className="text-xs text-gray-400 mt-1">{t('imageFormats')}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isPending}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">{t('common.category')} *</Label>
                <select
                  id="category"
                  {...register('category')}
                  disabled={isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t('inventory.selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat.name}>
                      {locale === 'ar' ? cat.nameAr : cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <Label htmlFor="unit">{t('inventory.unitOfMeasurement')} *</Label>
                <select
                  id="unit"
                  {...register('unit')}
                  disabled={isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t('inventory.selectUnit')}</option>
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentQuantity">{t('inventory.currentQuantity')} *</Label>
                  <Input
                    id="currentQuantity"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...register('currentQuantity', { valueAsNumber: true })}
                    disabled={isPending}
                  />
                  {errors.currentQuantity && (
                    <p className="text-sm text-red-600">{errors.currentQuantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minThreshold">{t('inventory.minThreshold')} *</Label>
                  <Input
                    id="minThreshold"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="10"
                    {...register('minThreshold', { valueAsNumber: true })}
                    disabled={isPending}
                  />
                  {errors.minThreshold && (
                    <p className="text-sm text-red-600">{errors.minThreshold.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {t('inventory.lowStockAlertLevel')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxThreshold">{t('inventory.maxThreshold')} *</Label>
                  <Input
                    id="maxThreshold"
                    type="number"
                    step="1"
                    min="1"
                    placeholder="100"
                    {...register('maxThreshold', { valueAsNumber: true })}
                    disabled={isPending}
                  />
                  {errors.maxThreshold && (
                    <p className="text-sm text-red-600">{errors.maxThreshold.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {t('inventory.mustBeGreater')}
                  </p>
                </div>
              </div>

              {/* Supplier & Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supplier">{t('inventory.supplier')}</Label>
                  <Input
                    id="supplier"
                    type="text"
                    placeholder={t('inventory.supplierPlaceholder')}
                    {...register('supplier')}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">{t('inventory.costPerUnit')}</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('cost', { valueAsNumber: true })}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      {t('inventory.updating')}...
                    </>
                  ) : (
                    t('inventory.updateItem')
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-blue-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  {t('inventory.aboutInventory')}
                </p>
                <p className="text-sm text-blue-700">
                  {t('inventory.inventoryTip')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
