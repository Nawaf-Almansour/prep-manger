'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Category } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { data: categories, isLoading } = useCategories(false); // Get all categories including inactive
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
  });

  const categoriesArray = Array.isArray(categories) ? categories : [];

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        nameAr: category.nameAr,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', nameAr: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', nameAr: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.nameAr.trim()) {
      alert(t('categories.validation.nameRequired'));
      return;
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
        alert(t('categories.messages.updateSuccess'));
      } else {
        await createMutation.mutateAsync(formData);
        alert(t('categories.messages.createSuccess'));
      }
      handleCloseDialog();
    } catch {
      alert(
        editingCategory 
          ? t('categories.messages.updateError')
          : t('categories.messages.createError')
      );
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(t('categories.messages.confirmDelete'))) return;

    try {
      await deleteMutation.mutateAsync(category.id);
      alert(t('categories.messages.deleteSuccess'));
    } catch {
      alert(t('categories.messages.deleteError'));
    }
  };

  return (
    <DashboardLayout allowedRoles={['manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('categories.title')}</h1>
            <p className="text-gray-600 mt-1">{t('categories.description')}</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('categories.addCategory')}
          </Button>
        </div>

        {/* Categories Table */}
        <Card className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : categoriesArray.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>{t('categories.noCategories')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">{t('categories.nameEn')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('categories.nameAr')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('common.description')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('common.status')}</th>
                    <th className="text-right py-3 px-4 font-semibold">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesArray.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{category.name}</td>
                      <td className="py-3 px-4">{category.nameAr}</td>
                      <td className="py-3 px-4 text-gray-600">{category.description || '-'}</td>
                      <td className="py-3 px-4">
                        {category.isActive ? (
                          <Badge className="bg-green-100 text-green-800 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {t('common.active')}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 gap-1">
                            <XCircle className="h-3 w-3" />
                            {t('common.inactive')}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(category)}
                            className="gap-1"
                          >
                            <Pencil className="h-3 w-3" />
                            {t('common.edit')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                            {t('common.delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Create/Edit Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* English Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('categories.nameEn')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('categories.nameEnPlaceholder')}
                    required
                  />
                </div>

                {/* Arabic Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('categories.nameAr')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={t('categories.nameArPlaceholder')}
                    required
                    dir="rtl"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('common.description')} ({t('common.optional')})
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('categories.descriptionPlaceholder')}
                    className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {editingCategory ? t('common.save') : t('categories.create')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
