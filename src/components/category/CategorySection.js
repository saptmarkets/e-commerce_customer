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

    // Force refresh every 2 minutes to ensure fresh data
    const interval = setInterval(() => {
      refetchAll();
    }, 2 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
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

  // Calculate display categories based on showAllProducts flag
  const displayCategories = showAllProducts
    ? (allCategoriesRaw || [])
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
                  // Force immediate refetch
                  refetch();
                }}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                title="Refresh categories and clear cache"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Force Refresh
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
            {/* Carousel Navigation - Hidden on mobile */}
            <button 
              onClick={scrollLeft}
              className="mobile-hide absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md text-emerald-700 hover:bg-gray-50 focus:outline-none md:-left-5"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button 
              onClick={scrollRight}
              className="mobile-hide absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md text-emerald-700 hover:bg-gray-50 focus:outline-none md:-right-5"
              aria-label="Scroll right"
            >
              <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Carousel Container */}
            <div 
              ref={carouselRef}
              className={`flex ${scrollDirection === 'vertical' ? 'flex-col' : 'overflow-x-auto'} py-2 px-1 snap-x scrollbar-hide scroll-smooth`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {showAllProducts && (
                <div className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[130px] lg:w-[129px] mx-1 sm:mx-2 snap-start">
                  <div 
                    className="flex flex-col cursor-pointer bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 hover:border-emerald-500 overflow-hidden group touch-target"
                    onClick={() => router.push('/products')}
                  >
                    {/* Square Image container - responsive */}
                    <div className="w-full h-16 sm:h-20 md:h-24 lg:h-[5.5rem] bg-gradient-to-br from-emerald-50 to-emerald-100 relative overflow-hidden rounded-lg">
                      <Image
                        src="/logo/logo-color.svg"
                        alt="All Products"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Category Name */}
                    <div className="p-1 sm:p-2 text-center h-8 sm:h-10 md:h-12 flex items-center justify-center">
                      <h3 className="text-responsive-xs font-semibold text-gray-800 group-hover:text-emerald-600 transition duration-200 leading-tight line-clamp-2">
                        All Products
                      </h3>
                    </div>
                  </div>
                </div>
              )}
              
              {displayCategories.map((category, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-[130px] lg:w-[129px] mx-1 sm:mx-2 snap-start"
                >
                  <div 
                    className="flex flex-col cursor-pointer bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-500 transition duration-300 overflow-hidden group touch-target"
                    onClick={() =>
                      handleCategoryClick(
                        category._id,
                        showingTranslateValue(category?.name)
                      )
                    }
                  >
                    {/* Square Image container - responsive */}
                    <div className="w-full h-16 sm:h-20 md:h-24 lg:h-[5.5rem] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden rounded-lg">
                      {category.icon ? (
                        <Image
                          src={category?.icon}
                          alt={showingTranslateValue(category?.name)}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <Image
                          src="https://res.cloudinary.com/dxjobesyt/image/upload/v1752706908/placeholder_kvepfp_wkyfut.png"
                          alt={showingTranslateValue(category?.name)}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                    
                    {/* Category Name */}
                    <div className="p-1 sm:p-2 text-center h-8 sm:h-10 md:h-12 flex items-center justify-center">
                      <h3 className="text-responsive-xs font-semibold text-gray-800 group-hover:text-emerald-600 transition duration-200 leading-tight line-clamp-2">
                        {showingTranslateValue(category?.name)}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySection; 