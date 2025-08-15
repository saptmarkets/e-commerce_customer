import requests from "./httpServices";

const CategoryServices = {
  getShowingCategory: async () => {
    return requests.get("/category/show");
  },
  getAllCategories: async () => {
    return requests.get("/category/all");
  },
  // Get categories with product counts for better filtering
  getCategoriesWithProductCounts: async () => {
    try {
      const categories = await requests.get("/category/show");
      return categories;
    } catch (error) {
      console.error("Error fetching categories with product counts:", error);
      return [];
    }
  },
  // Get main categories (parent categories) for homepage display
  getMainCategories: async () => {
    try {
      // Use /category/all to get raw categories without processing
      const categories = await requests.get("/category/all");
      // Filter to only show main categories (no parentId or top-level)
      const mainCategories = categories.filter(cat => 
        cat.status === 'show' && (!cat.parentId || cat.parentId === null || cat.parentId === "")
      );
      console.log('🔍 getMainCategories: Found', mainCategories.length, 'main categories');
      mainCategories.forEach(cat => {
        console.log(`  - ${cat.name?.en || 'Unknown'} (${cat._id}): Icon: ${cat.icon ? 'Yes' : 'No'}`);
      });
      return mainCategories;
    } catch (error) {
      console.error("Error fetching main categories:", error);
      return [];
    }
  },
  // Get subcategories for a specific parent category
  getSubcategories: async (parentId) => {
    try {
      const categories = await requests.get("/category/show");
      const parentCategory = categories.find(cat => cat._id === parentId);
      return parentCategory?.children || [];
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return [];
    }
  }
};

export default CategoryServices;
