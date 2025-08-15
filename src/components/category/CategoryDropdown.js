import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { IoChevronForward } from "react-icons/io5";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";
import { useCallback, useMemo, useState } from "react";

const isValidName = (nameValue) => {
  if (nameValue === null || nameValue === undefined) return false;
  const asString = typeof nameValue === "string" ? nameValue : String(nameValue);
  const trimmed = asString.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase() === "false") return false;
  return true;
};

const CategoryDropdown = () => {
  const { showingTranslateValue } = useUtilsFunction();

  // Fetch main categories only for better performance
  const { data, error, isLoading } = useQuery({
    queryKey: ["category-dropdown"],
    queryFn: async () => await CategoryServices.getMainCategories(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Track expand/collapse state and lazy-loaded children per category
  const [expanded, setExpanded] = useState({}); // { [categoryId]: boolean }
  const [loadingByCategory, setLoadingByCategory] = useState({}); // { [categoryId]: boolean }
  const [childrenWithProducts, setChildrenWithProducts] = useState({}); // { [categoryId]: Subcategory[] }

  const toggleExpand = useCallback(
    async (category) => {
      const categoryId = category._id;
      const willExpand = !expanded[categoryId];
      setExpanded((prev) => ({ ...prev, [categoryId]: willExpand }));

      // On first expand, lazily check this category and its subcategories
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
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error loading categories: {error.message}
      </div>
    );
  }

  if (!displayedMainCategories || displayedMainCategories.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No categories available
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayedMainCategories.map((category) => {
        const categoryId = category._id;
        const isExpanded = expanded[categoryId];
        const isLoadingChildren = loadingByCategory[categoryId];
        const children = childrenWithProducts[categoryId] || [];

        return (
          <div key={categoryId} className="border-b border-gray-100 last:border-b-0">
            {/* Main Category */}
            <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 transition-colors">
              <Link
                href={`/category/${categoryId}`}
                className="flex items-center flex-1 min-w-0 group"
              >
                {category.icon && (
                  <div className="w-6 h-6 mr-3 flex-shrink-0 relative">
                    <Image
                      src={category.icon}
                      alt={showingTranslateValue(category.name)}
                      fill
                      className="object-contain"
                      sizes="24px"
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
                  <IoChevronForward
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Subcategories */}
            {isExpanded && (
              <div className="ml-4 border-l border-gray-200 pl-4">
                {isLoadingChildren ? (
                  <div className="py-2">
                    <div className="animate-pulse">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {children.map((subcategory) => (
                      <Link
                        key={subcategory._id}
                        href={`/category/${subcategory._id}`}
                        className="block py-2 px-2 hover:bg-gray-50 rounded transition-colors group"
                      >
                        <div className="flex items-center">
                          {subcategory.icon && (
                            <div className="w-5 h-5 mr-2 flex-shrink-0 relative">
                              <Image
                                src={subcategory.icon}
                                alt={showingTranslateValue(subcategory.name)}
                                fill
                                className="object-contain"
                                sizes="20px"
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
  );
};

export default CategoryDropdown; 