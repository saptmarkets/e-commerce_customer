import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { IoChevronForward } from "react-icons/io5";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";
import { useEffect, useState } from "react";

const CategoryDropdown = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { data, error, isLoading } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
  });
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const filterCategoriesWithProducts = async () => {
      setLoading(true);
      try {
        const isRoot = (cat) => !cat.parentId || cat.parentId === "0" || cat.parentId === "root" || cat.parentId === "ROOT" || cat.parentId === "null" || cat.parentId === null || cat.parentId === undefined;
        const mainCategories = data?.filter(isRoot) || [];
        
        if (mainCategories.length === 0) {
          setFilteredCategories([]);
          setLoading(false);
          return;
        }

        // Collect all category IDs that need to be checked (main categories + subcategories)
        const allCategoryIds = [];
        const categoryMap = new Map(); // To map category IDs back to category objects
        
        mainCategories.forEach(category => {
          allCategoryIds.push(category._id);
          categoryMap.set(category._id, { ...category });
          
          if (category.children && category.children.length > 0) {
            category.children.forEach(subcategory => {
              allCategoryIds.push(subcategory._id);
              categoryMap.set(subcategory._id, { ...subcategory });
            });
          }
        });

        // Check all categories in parallel using Promise.all
        const hasProductsResults = await Promise.all(
          allCategoryIds.map(async (categoryId) => {
            try {
              const hasProducts = await ProductServices.checkCategoryHasProducts(categoryId);
              return { categoryId, hasProducts };
            } catch (error) {
              console.error(`Error checking products for category ${categoryId}:`, error);
              return { categoryId, hasProducts: false };
            }
          })
        );

        // Create a map of category ID to hasProducts result
        const hasProductsMap = new Map();
        hasProductsResults.forEach(result => {
          hasProductsMap.set(result.categoryId, result.hasProducts);
        });

        // Filter categories based on the results
        const categoriesWithProducts = [];
        
        for (const category of mainCategories) {
          const hasMainCategoryProducts = hasProductsMap.get(category._id) || false;
          
          // Check if any subcategories have products
          let hasSubcategoryProducts = false;
          if (category.children && category.children.length > 0) {
            for (const subcategory of category.children) {
              if (hasProductsMap.get(subcategory._id)) {
                hasSubcategoryProducts = true;
                break;
              }
            }
          }

          // Only include category if it has products or its subcategories have products
          if (hasMainCategoryProducts || hasSubcategoryProducts) {
            // Filter subcategories to only include those with products
            if (category.children && category.children.length > 0) {
              const filteredSubcategories = category.children.filter(subcategory => 
                hasProductsMap.get(subcategory._id)
              );
              category.children = filteredSubcategories;
            }
            
            categoriesWithProducts.push(category);
          }
        }

        setFilteredCategories(categoriesWithProducts);
      } catch (error) {
        setFilteredCategories([]);
      } finally {
        setLoading(false);
      }
    };
    if (data) filterCategoriesWithProducts();
  }, [data]);

  const toggleExpand = (categoryId) => {
    setExpanded((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  return (
    <div className="p-4">
      {isLoading || loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-sm">{error?.message || "Error loading categories"}</p>
          <p className="text-gray-500 text-xs mt-1">Please try refreshing the page</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">No categories found</p>
          <p className="text-gray-500 text-xs mt-1">Categories with products will appear here</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredCategories.map((category) => (
            <li key={category._id} className="group">
              <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-50 transition-colors">
                <Link href={`/category/${category.slug || category._id}`} className="flex items-center flex-1 min-w-0">
                  {category.icon && (
                    <Image src={category.icon} alt={showingTranslateValue(category.name)} width={24} height={24} className="mr-2 object-contain" />
                  )}
                  <span className="truncate">{showingTranslateValue(category.name)}</span>
                </Link>
                {category.children && category.children.length > 0 && (
                  <button
                    onClick={() => toggleExpand(category._id)}
                    className="ml-2 p-1 focus:outline-none"
                    aria-label={expanded[category._id] ? "Collapse" : "Expand"}
                  >
                    <IoChevronForward
                      className={`text-gray-400 group-hover:text-green-600 transition-transform duration-200 ${expanded[category._id] ? "rotate-90" : ""}`}
                    />
                  </button>
                )}
              </div>
              {category.children && category.children.length > 0 && expanded[category._id] && (
                <ul className="ml-8 mt-1 space-y-1">
                  {category.children.map((subcat) => (
                    <li key={subcat._id}>
                      <Link href={`/category/${subcat.slug || subcat._id}`} className="flex items-center px-2 py-1 rounded hover:bg-gray-100 text-sm">
                        {subcat.icon && (
                          <Image src={subcat.icon} alt={showingTranslateValue(subcat.name)} width={20} height={20} className="mr-2 object-contain" />
                        )}
                        <span className="truncate">{showingTranslateValue(subcat.name)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryDropdown; 