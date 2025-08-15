import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from "next/router";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

//internal import
import CategoryServices from "@services/CategoryServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useCategoryCache } from "@utils/categoryCacheUtils";

const CategorySection = ({ title, description, categorySettings }) => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const carouselRef = useRef(null);
  const { invalidateCache, refetchAll } = useCategoryCache();

  // Force refresh when component mounts or window gains focus
  useEffect(() => {
    const handleFocus = () => {
      // Refetch data when window gains focus (user returns to tab)
      refetchAll();
    };

    window.addEventListener('focus', handleFocus);
    
    // Also refetch on mount to ensure fresh data
    refetchAll();

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchAll]);

  const {
    data: allCategoriesRaw,
    error,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["category-main"],
    queryFn: async () => await CategoryServices.getMainCategories(),
    staleTime: 30 * 1000, // 30 seconds - much shorter for real-time updates
    cacheTime: 2 * 60 * 1000, // 2 minutes - shorter cache time
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Use selected categories from admin settings or fallback to main categories
  const selectedCategories = categorySettings?.selectedCategories || [];
  const showAllProducts = categorySettings?.showAllProducts !== false;
  const itemsPerView = categorySettings?.itemsPerView || 6;
  const scrollDirection = categorySettings?.scrollDirection || 'horizontal';

  // Filter and order categories based on admin selection or show main categories
  const displayCategories = selectedCategories.length > 0 
    ? selectedCategories
        .map(selected => allCategoriesRaw?.find(cat => cat._id === selected.categoryId))
        .filter(Boolean)
        .slice(0, itemsPerView)
    : (allCategoriesRaw || []).slice(0, itemsPerView);

  const handleCategoryClick = (id, categoryName) => {
    router.push(`/category/${id}`);
    setIsLoading(!isLoading);
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-50 section-responsive">
      <div className="max-w-screen-2xl mx-auto responsive-padding">
        {(title || description) && (
          <div className="mb-4 sm:mb-6 text-center">
            {title && (
              <h2 className="heading-responsive text-gray-800 mb-2 sm:mb-3">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-responsive-base text-gray-600 text-center max-w-xl mx-auto">
                {description}
              </p>
              )}
            {/* Refresh button for categories */}
            <div className="mt-2">
              <button
                onClick={() => {
                  invalidateCache();
                  refetchAll();
                }}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                title="Refresh categories and clear cache"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh & Clear Cache
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <CMSkeleton count={8} height={20} error={error} loading={loading} />
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            {displayCategories && displayCategories.length > itemsPerView && (
              <>
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft className="text-gray-600" />
                </button>
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  aria-label="Scroll right"
                >
                  <FaChevronRight className="text-gray-600" />
                </button>
              </>
            )}

            {/* Categories Grid/Carousel */}
            <div
              ref={carouselRef}
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 ${
                scrollDirection === 'horizontal' && displayCategories && displayCategories.length > itemsPerView
                  ? 'overflow-x-auto scrollbar-hide'
                  : ''
              }`}
            >
              {displayCategories && displayCategories.length > 0 ? (
                displayCategories.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => handleCategoryClick(category._id, showingTranslateValue(category.name))}
                    className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300">
                      {category.icon ? (
                        <div className="w-16 h-16 mx-auto mb-3 relative">
                          <Image
                            src={category.icon}
                            alt={showingTranslateValue(category.name)}
                            fill
                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                            sizes="64px"
                            unoptimized={false}
                            priority={false}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300">
                          <svg className="w-8 h-8 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                      <h3 className="text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors duration-300 line-clamp-2">
                        {showingTranslateValue(category.name)}
                      </h3>
                      {category.children && category.children.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {category.children.length} {category.children.length === 1 ? 'subcategory' : 'subcategories'}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No categories available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySection; 