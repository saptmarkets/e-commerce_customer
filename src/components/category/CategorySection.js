import React, { useRef } from 'react';
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

const CategorySection = ({ title, description, categorySettings }) => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const carouselRef = useRef(null);

  const {
    data: allCategoriesRaw,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["category-main"],
    queryFn: async () => await CategoryServices.getMainCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
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