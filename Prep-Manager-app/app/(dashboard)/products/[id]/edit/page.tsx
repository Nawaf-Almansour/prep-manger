'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft, Loader2, Package, Plus, Trash2, Upload, X } from 'lucide-react';
import { useProduct, useUpdateProduct, ProductFormDataWithImage } from '@/hooks/useProducts';
import { useInventory } from '@/hooks/useInventory';
import { useCategories } from '@/hooks/useCategories';
import { ProductFormData } from '@/types';
import { use } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().optional(),
  prepTimeMinutes: z.number().min(1, 'Prep time must be at least 1 minute'),
  prepIntervalHours: z.number().min(1, 'Interval must be at least 1 hour'),
  ingredients: z.array(
    z.object({
      ingredientId: z.string().min(1, 'Ingredient is required'),
      name: z.string().min(1, 'Name is required'),
      quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
      unit: z.enum(['kg', 'g', 'l', 'ml', 'pcs', 'cup', 'tbsp', 'tsp']),
    })
  ).min(1, 'At least one ingredient is required'),
  isActive: z.boolean(),
});

const units = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'l', label: 'Liters (l)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'cup', label: 'Cups' },
  { value: 'tbsp', label: 'Tablespoons (tbsp)' },
  { value: 'tsp', label: 'Teaspoons (tsp)' },
];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { id } = use(params);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const { mutate: updateProduct, isPending } = useUpdateProduct(id);
  const { data: inventoryItems } = useInventory();
  const { data: categories } = useCategories(true); // Get only active categories

  const inventoryArray = Array.isArray(inventoryItems) ? inventoryItems : [];
  const categoriesArray = Array.isArray(categories) ? categories : [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      ingredients: [{ ingredientId: '', name: '', quantity: 0, unit: 'kg' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category,
        description: product.description || '',
        prepTimeMinutes: product.prepTimeMinutes,
        prepIntervalHours: product.prepIntervalHours,
        ingredients: product.ingredients && product.ingredients.length > 0 
          ? product.ingredients 
          : [{ ingredientId: '', name: '', quantity: 0, unit: 'kg' }],
        isActive: product.isActive,
      });
      if (product.image) {
        setImagePreview(product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`);
      }
    }
  }, [product, reset]);

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

  const handleIngredientChange = (index: number, ingredientId: string) => {
    const selectedItem = inventoryArray.find(item => item.id === ingredientId);
    if (selectedItem) {
      setValue(`ingredients.${index}.name`, selectedItem.name);
    }
  };

  const onSubmit = (data: ProductFormData) => {
    setError('');
    
    // Validate category exists
    const categoryExists = categoriesArray.some(cat => cat.name === data.category);
    if (!categoryExists) {
      setError(t('products.validation.categoryNotFound'));
      return;
    }
    
    const submitData: ProductFormDataWithImage = {
      ...data,
      imageFile: imageFile || undefined,
    };
    
    updateProduct(submitData, {
      onSuccess: () => {
        router.push(`/products/${id}`);
      },
      onError: (err: Error & { response?: { data?: { message?: string } } }) => {
        setError(err.response?.data?.message || 'Failed to update product. Please try again.');
      },
    });
  };

  if (isLoadingProduct) {
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
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">{t('products.productNotFound')}</p>
          <Button onClick={() => router.push('/products')} className="mt-4">
            {t('products.backToProducts')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['supervisor', 'manager']}>
      <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold">{t('products.editProduct')}</h1>
            <p className="text-gray-500 mt-1">{t('products.updateProductDetails')}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('products.basicInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('products.productName')} *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Caesar Salad, Chocolate Cake"
                  {...register('name')}
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
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
                  <option value="">{t('products.selectCategory')}</option>
                  {categoriesArray.map((category) => (
                    <option key={category.id} value={category.name}>
                      {locale === 'ar' ? category.nameAr : category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
                {categoriesArray.length === 0 && (
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t('products.validation.noCategoriesAvailable')}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('common.description')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('products.descriptionPlaceholder')}
                  rows={3}
                  {...register('description')}
                  disabled={isPending}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Prep Time & Interval */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prepTimeMinutes">{t('products.prepTimeMinutes')} *</Label>
                  <Input
                    id="prepTimeMinutes"
                    type="number"
                    placeholder="30"
                    {...register('prepTimeMinutes', { valueAsNumber: true })}
                    disabled={isPending}
                  />
                  {errors.prepTimeMinutes && (
                    <p className="text-sm text-red-600">{errors.prepTimeMinutes.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {t('products.prepTimeHelp')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prepIntervalHours">{t('products.prepIntervalHours')} *</Label>
                  <Input
                    id="prepIntervalHours"
                    type="number"
                    placeholder="4"
                    {...register('prepIntervalHours', { valueAsNumber: true })}
                    disabled={isPending}
                  />
                  {errors.prepIntervalHours && (
                    <p className="text-sm text-red-600">{errors.prepIntervalHours.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {t('products.prepIntervalHelp')}
                  </p>
                </div>
              </div>

              {/* Is Active */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isPending}
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  {t('products.activeStatus')}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Required Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>{t('products.requiredIngredients')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ingredient */}
                    <div className="space-y-2">
                      <Label htmlFor={`ingredients.${index}.ingredientId`}>
                        {t('products.ingredient')} *
                      </Label>
                      <select
                        {...register(`ingredients.${index}.ingredientId`, {
                          onChange: (e) => handleIngredientChange(index, e.target.value)
                        })}
                        disabled={isPending}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">{t('products.selectIngredient')}</option>
                        {inventoryArray.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      {errors.ingredients?.[index]?.ingredientId && (
                        <p className="text-sm text-red-600">
                          {errors.ingredients[index]?.ingredientId?.message}
                        </p>
                      )}
                      <input type="hidden" {...register(`ingredients.${index}.name`)} />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor={`ingredients.${index}.quantity`}>
                        {t('common.quantity')} *
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1"
                        {...register(`ingredients.${index}.quantity`, { 
                          valueAsNumber: true 
                        })}
                        disabled={isPending}
                      />
                      {errors.ingredients?.[index]?.quantity && (
                        <p className="text-sm text-red-600">
                          {errors.ingredients[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    {/* Unit */}
                    <div className="space-y-2">
                      <Label htmlFor={`ingredients.${index}.unit`}>
                        {t('common.unit')} *
                      </Label>
                      <select
                        {...register(`ingredients.${index}.unit`)}
                        disabled={isPending}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {units.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                      {errors.ingredients?.[index]?.unit && (
                        <p className="text-sm text-red-600">
                          {errors.ingredients[index]?.unit?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isPending}
                      className="text-red-600 hover:bg-red-50 mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {/* Add Ingredient Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ ingredientId: '', name: '', quantity: 0, unit: 'kg' })}
                disabled={isPending}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('products.addIngredient')}
              </Button>

              {errors.ingredients?.root && (
                <p className="text-sm text-red-600">
                  {errors.ingredients.root.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                  {t('products.updating')}...
                </>
              ) : (
                t('products.updateProduct')
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
      </div>
    </DashboardLayout>
  );
}
