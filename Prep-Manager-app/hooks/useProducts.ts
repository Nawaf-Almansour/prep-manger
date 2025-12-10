import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Product, ProductFormData, ApiResponse } from '@/types';

export const useProducts = (params?: { search?: string; isActive?: boolean; category?: string }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
      if (params?.category) queryParams.append('category', params.category);
      
      const response = await api.get(`/products?${queryParams.toString()}`);
      console.log('🔍 Products API Response:', response);
      // Handle nested structure: response.data.products
      if (response.data?.products && Array.isArray(response.data.products)) {
        // Transform _id to id for frontend compatibility
        const products = response.data.products.map((product: Product & { _id?: string }) => ({
          ...product,
          id: product._id || product.id,
        }));
        console.log('🔍 Transformed Products:', products);
        return products;
      }
      // Handle direct products array (axios interceptor unwraps data)
      const responseData = response as unknown as { products?: Product[]; data?: { products?: Product[] } };
      if (responseData.products && Array.isArray(responseData.products)) {
        const products = responseData.products.map((product: Product & { _id?: string }) => ({
          ...product,
          id: product._id || product.id,
        }));
        console.log('🔍 Direct Products:', products);
        return products;
      }
      return Array.isArray(response) ? response : (response.data || []);
    },
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}`);
      
      // Handle different response structures
      const product = response.data?.data || response.data?.product || response.data || response;
      
      // Transform _id to id for frontend compatibility
      if (product && typeof product === 'object') {
        // Ensure ingredients is always an array
        const ingredientsArray = Array.isArray(product.ingredients) 
          ? product.ingredients 
          : Array.isArray(product.requiredIngredients)
          ? product.requiredIngredients
          : [];
          
        const transformedProduct = {
          ...product,
          id: product._id || product.id || productId,
          ingredients: ingredientsArray,
        };
        return transformedProduct;
      }
      return product;
    },
    enabled: !!productId,
  });
};

export interface ProductFormDataWithImage extends ProductFormData {
  imageFile?: File;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductFormDataWithImage) => {
      const { imageFile, ...productData } = data;
      
      // If there's an image file, use FormData
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('name', productData.name);
        formData.append('category', productData.category);
        if (productData.description) formData.append('description', productData.description);
        formData.append('prepTimeMinutes', String(productData.prepTimeMinutes));
        formData.append('prepIntervalHours', String(productData.prepIntervalHours));
        formData.append('isActive', String(productData.isActive));
        formData.append('ingredients', JSON.stringify(productData.ingredients));
        
        const response = await api.post<never, ApiResponse<Product>>('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response;
      }
      
      // No image, send JSON
      const response = await api.post<never, ApiResponse<Product>>('/products', productData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductFormDataWithImage) => {
      const { imageFile, ...productData } = data;
      
      // If there's an image file, use FormData
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('name', productData.name);
        formData.append('category', productData.category);
        if (productData.description) formData.append('description', productData.description);
        formData.append('prepTimeMinutes', String(productData.prepTimeMinutes));
        formData.append('prepIntervalHours', String(productData.prepIntervalHours));
        formData.append('isActive', String(productData.isActive));
        formData.append('ingredients', JSON.stringify(productData.ingredients));
        
        const response = await api.put(`/products/${productId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }
      
      // No image, send JSON
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.delete(`/products/${productId}/permanent`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
