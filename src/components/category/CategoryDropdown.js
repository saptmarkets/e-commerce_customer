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

  // Fetch categories only; no expensive per-category checks up-front
  const { data, error, isLoading } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Compute main (root) categories once from fetched data
  const mainCategories = useMemo(() => {
    const isRoot = (cat) =>
      !cat?.parentId ||
      cat.parentId === "0" ||
      cat.parentId === "root" ||
      cat.parentId === "ROOT" ||
      cat.parentId === "null" ||
      cat.parentId === null ||
      cat.parentId === undefined;

    return (data || []).filter(isRoot);
  }, [data]);

  // Track expand/collapse state and lazy-loaded children per category
  const [expanded, setExpanded] = useState({}); // { [categoryId]: boolean }
  const [loadingByCategory, setLoadingByCategory] = useState({}); // { [categoryId]: boolean }
  const [childrenWithProducts, setChildrenWithProducts] = useState({}); // { [categoryId]: Subcategory[] }
  const [hiddenMainIds, setHiddenMainIds] = useState(new Set()); // categories hidden after lazy check

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
          const [hasMainProducts, subResults] = await Promise.all([
            // Check main category has products
            ProductServices.checkCategoryHasProducts(categoryId).catch(() => false),
            // Check children
            Promise.all(
              (category.children || []).map(async (sub) => {
            try {
                  const hasProducts = await ProductServices.checkCategoryHasProducts(sub._id);
                  return { sub, hasProducts };
                } catch (err) {
                  return { sub, hasProducts: false };
            }
          })
            ),
          ]);

          const filteredSubs = (subResults || [])
            .filter((r) => r.hasProducts)
            .map((r) => r.sub);

          // If neither main nor any subs have products, hide this main category
          if (!hasMainProducts && filteredSubs.length === 0) {
            setHiddenMainIds((prev) => new Set(prev).add(categoryId));
          }

          setChildrenWithProducts((prev) => ({ ...prev, [categoryId]: filteredSubs }));
        } finally {
          setLoadingByCategory((prev) => ({ ...prev, [categoryId]: false }));
        }
      }
    },
    [expanded, childrenWithProducts, loadingByCategory]
  );

  const displayedMainCategories = useMemo(() => {
    return mainCategories.filter((cat) => {
      if (hiddenMainIds.has(cat._id)) return false;
      const displayName = showingTranslateValue(cat.name);
      return isValidName(displayName);
    });
  }, [mainCategories, hiddenMainIds, showingTranslateValue]);

  return (
    <div className="p-4">
      {isLoading ? (
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
      ) : displayedMainCategories.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">No categories found</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {displayedMainCategories.map((category) => (
            <li key={category._id} className="group">
              <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-50 transition-colors">
                <Link href={`/category/${category._id}`} className="flex items-center flex-1 min-w-0">
                  {category.icon && (
                    <Image src={category.icon} alt={showingTranslateValue(category.name)} width={24} height={24} className="mr-2 object-contain" />
                  )}
                  <span className="truncate">{showingTranslateValue(category.name)}</span>
                </Link>
                {category.children && category.children.length > 0 && (
                  <button
                    onClick={() => toggleExpand(category)}
                    className="ml-2 p-1 focus:outline-none"
                    aria-label={expanded[category._id] ? "Collapse" : "Expand"}
                  >
                    <IoChevronForward
                      className={`text-gray-400 group-hover:text-green-600 transition-transform duration-200 ${
                        expanded[category._id] ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {category.children && category.children.length > 0 && expanded[category._id] && (
                <div className="ml-8 mt-1">
                  {loadingByCategory[category._id] ? (
                    <div className="flex items-center py-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                      Loading subcategories...
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {(childrenWithProducts[category._id] ?? []).map((subcat) => (
                    <li key={subcat._id}>
                          <Link
                            href={`/category/${subcat._id}`}
                            className="flex items-center px-2 py-1 rounded hover:bg-gray-100 text-sm"
                          >
                        {subcat.icon && (
                              <Image
                                src={subcat.icon}
                                alt={showingTranslateValue(subcat.name)}
                                width={20}
                                height={20}
                                className="mr-2 object-contain"
                              />
                        )}
                        <span className="truncate">{showingTranslateValue(subcat.name)}</span>
                      </Link>
                    </li>
                  ))}

                      {Array.isArray(childrenWithProducts[category._id]) && childrenWithProducts[category._id].length === 0 && (
                        <li className="px-2 py-1 text-xs text-gray-500">No subcategories with products</li>
                      )}
                </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryDropdown; 