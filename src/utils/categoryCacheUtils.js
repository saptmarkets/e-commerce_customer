import { useQueryClient } from '@tanstack/react-query';

// Cache keys used across the app
export const CATEGORY_CACHE_KEYS = {
  MAIN: 'category-main',
  FEATURE: 'category-feature',
  DROPDOWN: 'category-dropdown',
  ALL: 'category-all',
  SHOWING: 'category-showing'
};

// Function to invalidate all category-related caches
export const invalidateCategoryCache = (queryClient) => {
  Object.values(CATEGORY_CACHE_KEYS).forEach(key => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
  
  // Also invalidate any queries that contain 'category' in the key
  queryClient.invalidateQueries({ 
    queryKey: ['category'],
    exact: false 
  });
};

// Function to refetch all category data
export const refetchAllCategories = async (queryClient) => {
  Object.values(CATEGORY_CACHE_KEYS).forEach(key => {
    queryClient.refetchQueries({ queryKey: [key] });
  });
};

// Hook to get category cache utilities
export const useCategoryCache = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateCache: () => invalidateCategoryCache(queryClient),
    refetchAll: () => refetchAllCategories(queryClient),
    clearCache: () => {
      Object.values(CATEGORY_CACHE_KEYS).forEach(key => {
        queryClient.removeQueries({ queryKey: [key] });
      });
    }
  };
}; 