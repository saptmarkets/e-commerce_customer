import useTranslation from "next-translate/useTranslation";
import { useContext, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";
import Link from "next/link";
import Image from "next/image";

const isValidName = (nameValue) => {
  if (nameValue === null || nameValue === undefined) return false;
  const asString = typeof nameValue === "string" ? nameValue : String(nameValue);
  const trimmed = asString.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase() === "false") return false;
  return true;
};

const Category = () => {
  const { categoryDrawerOpen } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation("common");

  // Fetch main categories only for better performance
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["category-main"],
    queryFn: async () => await CategoryServices.getMainCategories(),
    staleTime: 30 * 1000, // 30 seconds - much shorter for real-time updates
    cacheTime: 2 * 60 * 1000, // 2 minutes - shorter cache time
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch when component mounts
  });

  const [expanded, setExpanded] = useState({});
  const [loadingByCategory, setLoadingByCategory] = useState({});
  const [childrenWithProducts, setChildrenWithProducts] = useState({});

  const toggleExpand = useCallback(
    async (category) => {
      const categoryId = category._id;
      const willExpand = !expanded[categoryId];
      setExpanded((prev) => ({ ...prev, [categoryId]: willExpand }));
          
      if (
        willExpand &&
        childrenWithProducts[categoryId] === undefined &&
        !loadingByCategory[categoryId]
      ) {
        setLoadingByCategory((prev) => ({ ...prev, [categoryId]: true }));
        try {
          // Get subcategories for this category
          const subcategories = await CategoryServices.getSubcategories(categoryId);
          
          // Check which subcategories have products
          const subResults = await Promise.all(
            subcategories.map(async (sub) => {
              try {
                const hasProducts = await ProductServices.checkCategoryHasProducts(sub._id);
                return { sub, hasProducts };
              } catch (err) {
                return { sub, hasProducts: false };
              }
            })
          );

          const filteredSubs = subResults
            .filter((r) => r.hasProducts)
            .map((r) => r.sub);

          setChildrenWithProducts((prev) => ({ ...prev, [categoryId]: filteredSubs }));
        } finally {
          setLoadingByCategory((prev) => ({ ...prev, [categoryId]: false }));
        }
      }
    },
    [expanded, childrenWithProducts, loadingByCategory]
  );

  const displayedMainCategories = useMemo(() => {
    return (data || []).filter(cat => 
      cat && isValidName(cat.name) && cat.status === "show"
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4">
        Error loading categories: {error.message}
      </div>
    );
  }

  if (!displayedMainCategories || displayedMainCategories.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4">
        No categories available
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t("Categories", "الفئات")}
      </h3>
      
      <div className="space-y-2">
        {displayedMainCategories.map((category) => {
          const categoryId = category._id;
          const isExpanded = expanded[categoryId];
          const isLoadingChildren = loadingByCategory[categoryId];
          const children = childrenWithProducts[categoryId] || [];

          return (
            <div key={categoryId} className="border border-gray-200 rounded-lg">
              {/* Main Category */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                <Link
                  href={`/category/${categoryId}`}
                  className="flex items-center flex-1 min-w-0 group"
                >
                  {category.icon && (
                    <div className="w-8 h-8 mr-3 flex-shrink-0 relative">
                      <Image
                        src={category.icon}
                        alt={showingTranslateValue(category.name)}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors truncate">
                    {showingTranslateValue(category.name)}
                  </span>
                </Link>

                {/* Expand/Collapse Button */}
                {children.length > 0 && (
                  <button
                    onClick={() => toggleExpand(category)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {isLoadingChildren ? (
                    <div className="p-3">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 space-y-1">
                      {children.map((subcategory) => (
                        <Link
                          key={subcategory._id}
                          href={`/category/${subcategory._id}`}
                          className="block py-2 px-3 hover:bg-white rounded transition-colors group"
                        >
                          <div className="flex items-center">
                            {subcategory.icon && (
                              <div className="w-6 h-6 mr-2 flex-shrink-0 relative">
                                <Image
                                  src={subcategory.icon}
                                  alt={showingTranslateValue(subcategory.name)}
                                  fill
                                  className="object-contain"
                                  sizes="24px"
                                />
                              </div>
                            )}
                            <span className="text-sm text-gray-600 group-hover:text-green-600 transition-colors truncate">
                              {showingTranslateValue(subcategory.name)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Category;
