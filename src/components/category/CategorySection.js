import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from "next/router";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

//internal import
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";

const CategorySection = ({ title, description, categorySettings }) => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const carouselRef = useRef(null);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [checkingProducts, setCheckingProducts] = useState(false);

  // Helper function to get parent category name
  const getParentCategoryName = (subcategoryId) => {
    if (!allCategoriesRaw) return '';
    const parentCategory = allCategoriesRaw.find(cat => 
      cat._id === subcategoryId || cat._id === subcategoryId?.toString()
    );
    return parentCategory ? showingTranslateValue(parentCategory.name) : '';
  };

  const {
    data: allCategoriesRaw,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["category-all"],
    queryFn: async () => await CategoryServices.getAllCategories(),
  });

  // Check which categories have products
  useEffect(() => {
    const checkCategoriesWithProducts = async () => {
      if (!allCategoriesRaw || allCategoriesRaw.length === 0) return;
      
      setCheckingProducts(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setCheckingProducts(false);
        // Fallback to showing subcategories instead of parent categories
        const subcategories = allCategoriesRaw.filter(cat => 
          cat.status === 'show' && 
          cat.parentId && 
          cat.parentId !== null && 
          cat.parentId !== undefined &&
          cat.parentId !== ''
        );
        setCategoriesWithProducts(subcategories);
      }, 5000); // 5 second timeout
      
      try {
        // Instead of checking parent categories, let's show subcategories which are more likely to have products
        const subcategories = allCategoriesRaw.filter(cat => 
          cat.status === 'show' && 
          cat.parentId && 
          cat.parentId !== null && 
          cat.parentId !== undefined &&
          cat.parentId !== ''
        );
        
        // Check which subcategories have products
        const subcategoriesWithProducts = [];
        
        for (const subcategory of subcategories) {
          try {
            const productsData = await ProductServices.getShowingStoreProducts({
              category: subcategory._id,
              limit: 1,
              page: 1,
            });
            
            if (productsData.products && productsData.products.length > 0) {
              subcategoriesWithProducts.push(subcategory);
            }
            
            // If we have enough subcategories with products, stop checking
            if (subcategoriesWithProducts.length >= itemsPerView) {
              break;
            }
          } catch (err) {
            console.error(`Error checking products for subcategory ${subcategory._id}:`, err);
          }
        }
        
        clearTimeout(timeoutId);
        
        // If we don't have enough subcategories with products, add some without products as fallback
        if (subcategoriesWithProducts.length < Math.min(3, itemsPerView)) {
          const fallbackSubcategories = subcategories.filter(sub => 
            !subcategoriesWithProducts.find(s => s._id === sub._id)
          ).slice(0, Math.min(3, itemsPerView) - subcategoriesWithProducts.length);
          
          subcategoriesWithProducts.push(...fallbackSubcategories);
        }
        
        setCategoriesWithProducts(subcategoriesWithProducts);
      } catch (err) {
        console.error('Error checking subcategories with products:', err);
        clearTimeout(timeoutId);
        // Fallback to showing subcategories
        const subcategories = allCategoriesRaw.filter(cat => 
          cat.status === 'show' && 
          cat.parentId && 
          cat.parentId !== null && 
          cat.parentId !== undefined &&
          cat.parentId !== ''
        );
        setCategoriesWithProducts(subcategories);
      } finally {
        setCheckingProducts(false);
      }
    };
    
    checkCategoriesWithProducts();
  }, [allCategoriesRaw]);

  // Flatten nested category tree to allow matching selected subcategories
  const flattenCategories = (list = []) => {
    const out = [];
    const stack = Array.isArray(list) ? [...list] : [];
    while (stack.length) {
      const node = stack.shift();
      if (!node) continue;
      out.push(node);
      if (Array.isArray(node.children) && node.children.length) {
        stack.push(...node.children);
      }
    }
    return out;
  };

  const flatCategories = flattenCategories(allCategoriesRaw || []);

  // Use selected categories from admin settings or fallback to categories with products
  const selectedCategories = categorySettings?.selectedCategories || [];
  const showAllProducts = categorySettings?.showAllProducts !== false;
  const itemsPerView = categorySettings?.itemsPerView || 6;
  const scrollDirection = categorySettings?.scrollDirection || 'horizontal';

  // Filter and order categories based on admin selection (search in full flattened list)
  const displayCategories = selectedCategories.length > 0 
    ? selectedCategories
        .map(selected => flatCategories.find(cat => cat._id === selected.categoryId))
        .filter(Boolean)
        .slice(0, itemsPerView)
    : (categoriesWithProducts.slice(0, itemsPerView) || []);

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

        {loading || checkingProducts ? (
          <div className="text-center">
            <CMSkeleton count={8} height={20} error={error} loading={loading || checkingProducts} />
            {checkingProducts && !loading && (
              <p className="text-sm text-gray-500 mt-2">Checking subcategories with products...</p>
            )}
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
              
              {displayCategories.length > 0 ? (
                displayCategories.map((category, i) => (
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
                      <div className="w-full h-16 sm:h-20 md:h-24 lg:h-[5.5rem] bg-gradient-to-br from-emerald-50 to-emerald-100 relative overflow-hidden rounded-lg">
                        {category?.icon ? (
                          <Image
                            src={category.icon}
                            alt={showingTranslateValue(category?.name)}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Category Name */}
                      <div className="p-1 sm:p-2 text-center h-8 sm:h-10 md:h-12 flex items-center justify-center">
                        <div>
                          <h3 className="text-responsive-xs font-semibold text-gray-800 group-hover:text-emerald-600 transition duration-200 leading-tight line-clamp-2">
                            {showingTranslateValue(category?.name)}
                          </h3>
                          {category?.parentId && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {getParentCategoryName(category.parentId)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-full text-center py-8">
                  <p className="text-gray-500">No categories found</p>
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