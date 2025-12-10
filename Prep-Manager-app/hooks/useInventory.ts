import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { InventoryItem, InventoryFormData, ApiResponse } from '@/types';

export interface InventoryFormDataWithImage extends InventoryFormData {
  imageFile?: File;
}

export const useInventory = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/inventory');
      // Handle nested structure: response.data.items
      if (response.data?.items && Array.isArray(response.data.items)) {
        // Transform _id to id for frontend compatibility
        return response.data.items.map((item: InventoryItem & { _id?: string }) => ({
          ...item,
          id: item._id || item.id,
        }));
      }
      return Array.isArray(response) ? response : (response.data || []);
    },
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      const response = await api.get('/inventory/low-stock');
      // Handle nested structure: response.data.items
      if (response.data?.items && Array.isArray(response.data.items)) {
        // Transform _id to id for frontend compatibility
        return response.data.items.map((item: InventoryItem & { _id?: string }) => ({
          ...item,
          id: item._id || item.id,
        }));
      }
      return Array.isArray(response) ? response : (response.data || []);
    },
  });
};

export const useInventoryItem = (itemId: string) => {
  return useQuery({
    queryKey: ['inventory', itemId],
    queryFn: async () => {
      const response = await api.get(`/inventory/${itemId}`);
      console.log('🔍 Inventory Item API Response:', response);
      // Handle nested structure: response.data.item or response.item
      const responseData = response as unknown as { data?: { item?: InventoryItem }; item?: InventoryItem };
      const item = responseData.data?.item || responseData.item || response.data?.data || response.data || response;
      console.log('🔍 Inventory Item:', item);
      // Transform _id to id for frontend compatibility
      if (item && typeof item === 'object') {
        return {
          ...item,
          id: item._id || item.id,
        };
      }
      return item;
    },
    enabled: !!itemId,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InventoryFormDataWithImage) => {
      const { imageFile, ...itemData } = data;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('name', itemData.name);
        if (itemData.nameAr) formData.append('nameAr', itemData.nameAr);
        formData.append('category', itemData.category);
        formData.append('unit', itemData.unit);
        formData.append('currentQuantity', String(itemData.currentQuantity));
        formData.append('minThreshold', String(itemData.minThreshold));
        formData.append('maxThreshold', String(itemData.maxThreshold));
        if (itemData.supplier) formData.append('supplier', itemData.supplier);
        if (itemData.cost !== undefined) formData.append('cost', String(itemData.cost));
        
        return await api.post<never, ApiResponse<InventoryItem>>('/inventory', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      return await api.post<never, ApiResponse<InventoryItem>>('/inventory', itemData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: Partial<InventoryFormDataWithImage> }) => {
      const { imageFile, ...itemData } = data;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        if (itemData.name) formData.append('name', itemData.name);
        if (itemData.nameAr) formData.append('nameAr', itemData.nameAr);
        if (itemData.category) formData.append('category', itemData.category);
        if (itemData.unit) formData.append('unit', itemData.unit);
        if (itemData.currentQuantity !== undefined) formData.append('currentQuantity', String(itemData.currentQuantity));
        if (itemData.minThreshold !== undefined) formData.append('minThreshold', String(itemData.minThreshold));
        if (itemData.maxThreshold !== undefined) formData.append('maxThreshold', String(itemData.maxThreshold));
        if (itemData.supplier) formData.append('supplier', itemData.supplier);
        if (itemData.cost !== undefined) formData.append('cost', String(itemData.cost));
        
        return await api.patch<never, ApiResponse<InventoryItem>>(`/inventory/${itemId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      return await api.patch<never, ApiResponse<InventoryItem>>(`/inventory/${itemId}`, itemData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useRestockInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await api.patch<never, ApiResponse<InventoryItem>>(`/inventory/${itemId}/restock`, { quantity });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
