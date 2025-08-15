import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Layout from "@layout/Layout";
import ProductCardModern from "@components/product/ProductCardModern";
import ProductServices from "@services/ProductServices";
import PromotionServices from "@services/PromotionServices";
import CategoryServices from "@services/CategoryServices";
import AttributeServices from "@services/AttributeServices";
import useGetSetting from "@hooks/useGetSetting";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";
import PageLoader from "@components/preloader/PageLoader";

const CategoryPage = ({ category, products, attributes, subcategories }) => {
  const router = useRouter();
  const { storeCustomizationSetting } = useGetSetting();
  const { tr, lang, showingTranslateValue } = useUtilsFunction();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [allProducts, setAllProducts] = useState(products); // Always keep the original products
  const productsPerPage = 24;

  // Fetch active promotions for category products
  const { data: activePromotions } = useQuery({
    queryKey: ["active-promotions-for-category", category?._id],
    queryFn: async () => await PromotionServices.getActivePromotions(),
    enabled: !!category?._id,
  });

  // Merge products with promotion data
  const productsWithPromotions = useMemo(() => {
    if (!filteredProducts || !activePromotions) return filteredProducts || [];
    
    // Create a map of promotional units for quick lookup
    const promotionalUnitsMap = new Map();
    
    activePromotions.forEach(promotion => {
      if (promotion.type === 'fixed_price' && promotion.isActive !== false && promotion.productUnit) {
        const productId = promotion.productUnit.product?._id || promotion.productUnit.product?.id;
        if (productId) {
          if (!promotionalUnitsMap.has(productId)) {
            promotionalUnitsMap.set(productId, []);
          }
          promotionalUnitsMap.get(productId).push(promotion);
        }
      }
    });
    
    // Enhance products with promotion data
    const enhancedProducts = filteredProducts.map(product => {
      const productId = product._id || product.id;
      const productPromotions = promotionalUnitsMap.get(productId);
      
      if (productPromotions && productPromotions.length > 0) {
        // Use the first promotion as the primary one
        const primaryPromotion = productPromotions[0];
        const promotionalUnit = primaryPromotion.productUnit;
        
        return {
          ...product,
          promotion: {
            ...primaryPromotion,
            originalPrice: promotionalUnit.price,
            promotionalPrice: primaryPromotion.value,
            savings: promotionalUnit.price - primaryPromotion.value,
            savingsPercent: promotionalUnit.price > 0 ? ((promotionalUnit.price - primaryPromotion.value) / promotionalUnit.price) * 100 : 0,
            unit: promotionalUnit,
            productUnit: promotionalUnit
          }
        };
      }
      
      return product;
    });
    
    return enhancedProducts;
  }, [filteredProducts, activePromotions]);

  // Fetch products for a subcategory from backend
  const fetchProductsForSubcategory = async (subcategory) => {
    console.log(`Fetching products for subcategory: ${subcategory.name} (${subcategory._id})`);
    setLoading(true);
    try {
      const res = await ProductServices.getShowingStoreProducts({ category: subcategory._id, limit: 50000, page: 1 });
      if (res && Array.isArray(res.products)) {
        console.log(`Found ${res.products.length} products for subcategory: ${subcategory.name}`);
        setFilteredProducts(res.products);
      } else {
        console.log(`No products found in API response for subcategory: ${subcategory.name}, using fallback filtering`);
        // fallback to client-side filtering
        const filtered = allProducts?.filter(product => 
          product.categories?.some(cat => cat._id === subcategory._id) || 
          product.category?._id === subcategory._id
        ) || [];
        console.log(`Fallback filtering found ${filtered.length} products`);
        setFilteredProducts(filtered);
      }
    } catch (err) {
      console.error(`Error fetching products for subcategory ${subcategory.name}:`, err);
      // fallback to client-side filtering
      const filtered = allProducts?.filter(product => 
        product.categories?.some(cat => cat._id === subcategory._id) || 
        product.category?._id === subcategory._id
      ) || [];
      console.log(`Error fallback filtering found ${filtered.length} products`);
      setFilteredProducts(filtered);
    }
    setLoading(false);
    setCurrentPage(1);
  };

  // Handle subcategory tab click
  const handleSubcategoryTab = (subcat) => {
    console.log('Tab clicked:', subcat ? subcat.name : 'All');
    setActiveSubcategory(subcat);
    if (subcat) {
      console.log(`Switching to subcategory: ${subcat.name}`);
      fetchProductsForSubcategory(subcat);
    } else {
      // All tab: show all products from parent category (combined from all subcategories)
      console.log(`Switching to All tab, showing ${allProducts?.length || 0} products`);
      setFilteredProducts(allProducts);
      setCurrentPage(1);
    }
  };

  // On mount, always show all products for the parent category
  useEffect(() => {
    console.log(`Component mounted with ${products?.length || 0} products for category: ${category?.name}`);
    console.log(`Category has ${subcategories?.length || 0} subcategories`);
    
    // Store the original combined products
    setAllProducts(products);
    
    // Show all products initially (All tab)
    setFilteredProducts(products);
    setActiveSubcategory(null);
    setCurrentPage(1);
  }, [products, category, subcategories]);
  
  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts?.slice(indexOfFirstProduct, indexOfLastProduct) || [];
  const totalPages = Math.ceil((filteredProducts?.length || 0) / productsPerPage);
  
  // Determine if this is a parent category (has subcategories) or a subcategory
  const isParentCategory = subcategories && subcategories.length > 0;

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (router.isFallback) {
    return <PageLoader />;
  }

  if (!category) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-800">Category Not Found</h1>
          <p className="text-gray-600 mt-2">The category you're looking for doesn't exist.</p>
          <Link href="/categories" className="text-green-600 hover:text-green-700 mt-4 inline-block">
            Browse All Categories
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{showingTranslateValue(category.name)} | {storeCustomizationSetting?.store?.name || "SAPT Markets"}</title>
        <meta 
          name="description" 
          content={showingTranslateValue(category.description) || `Shop ${showingTranslateValue(category.name)} products`}
        />
      </Head>

      <Layout>
        <div className="mx-auto max-w-screen-2xl px-4 py-2 sm:px-10">
          {/* Category Header Banner */}
          {category.headerImage && (
            <div className="w-full mb-4">
              <div className="relative w-full h-[150px] md:h-[250px] rounded-lg overflow-hidden">
                <Image 
                  src={category.headerImage}
                  alt={showingTranslateValue(category.name)}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 z-[1]"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center z-10">
                  <div className="text-white px-8 max-w-2xl">
                    <h1 className="text-xl md:text-3xl font-bold mb-2">
                      {showingTranslateValue(category.name)}
                    </h1>
                    {category.description && (
                      <p className="text-sm md:text-base mb-3">
                        {showingTranslateValue(category.description)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-green-600 text-sm">
                  {tr('Home', 'الرئيسية')}
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <Link href="/categories" className="ml-1 text-gray-700 hover:text-green-600 text-sm">
                    {tr('Categories', 'الفئات')}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-500 text-sm">
                    {showingTranslateValue(category.name)}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Category Info (if no header image) */}
          {!category.headerImage && (
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {showingTranslateValue(category.name)}
              </h1>
              {category.description && (
                <p className="text-gray-600">
                  {showingTranslateValue(category.description)}
                </p>
              )}
            </div>
          )}

          {/* Subcategories as Tabs */}
          {isParentCategory && (
            <div className="mb-8">
              <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-2 bg-gray-50 p-2 rounded-lg">
                  {/* All Products Tab */}
                  <button
                    onClick={() => handleSubcategoryTab(null)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !activeSubcategory
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {category.icon && (
                      <Image
                        src={category.icon}
                        alt="All"
                        width={20}
                        height={20}
                        className="mr-2 object-contain"
                      />
                    )}
                    {tr('All', 'الكل')} {showingTranslateValue(category.name)} ({allProducts?.length || 0})
                  </button>

                  {/* Subcategory Tabs */}
                  {subcategories.map((subcat) => (
                    <button
                      key={subcat._id}
                      onClick={() => handleSubcategoryTab(subcat)}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeSubcategory?._id === subcat._id
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600'
                      }`}
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
                      {showingTranslateValue(subcat.name)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeSubcategory 
                  ? showingTranslateValue(activeSubcategory.name) 
                  : tr('Products', 'المنتجات')
                }
              </h2>
              <p className="text-sm text-gray-600">
                {tr('Showing', 'عرض')} {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts?.length || 0)} {tr('of', 'من')} {filteredProducts?.length || 0} {tr('products', 'منتج')}
              </p>
            </div>

            {loading ? (
              <CMSkeleton count={24} height={200} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {currentProducts && currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <ProductCardModern
                      key={product._id}
                      product={product}
                      attributes={attributes}
                      compact={false}
                      showQuantitySelector={true}
                      showFavorite={true}
                      promotion={product.promotion}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      {tr('No Products Found', 'لا توجد منتجات')}
                    </h3>
                    <p className="text-gray-500">
                      {activeSubcategory
                        ? tr(
                            `No products are available in ${showingTranslateValue(activeSubcategory.name)} at the moment.`,
                            `لا توجد منتجات متاحة في ${showingTranslateValue(activeSubcategory.name)} حالياً.`
                          )
                        : tr(
                            'No products are available in this category at the moment.',
                            'لا توجد منتجات متاحة في هذه الفئة حالياً.'
                          )
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l border ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages).keys()].map((number) => {
                    const pageNumber = number + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-3 py-1 border-t border-b ${
                            currentPage === pageNumber
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-green-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => 
                      paginate(currentPage < totalPages ? currentPage + 1 : totalPages)
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-r border ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { slug } = context.params;

  try {
    // Get category by slug or ID
    const categories = await CategoryServices.getShowingCategory();
    
    // Helper function to find category in nested structure
    const findCategoryInNested = (cats, targetSlug) => {
      for (const cat of cats) {
        if (cat.slug === targetSlug || cat._id === targetSlug) {
          return cat;
        }
        if (cat.children && cat.children.length > 0) {
          const found = findCategoryInNested(cat.children, targetSlug);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategoryInNested(categories, slug);
    
    if (!category) {
      return {
        notFound: true,
      };
    }

    console.log(`Found category:`, {
      id: category._id,
      name: category.name,
      parentId: category.parentId,
      hasChildren: category.children && category.children.length > 0,
      childrenCount: category.children ? category.children.length : 0
    });

    // Get subcategories from the category's children property
    let subcategories = category.children || [];
    
    // Show all active subcategories without filtering by product presence
    const subcategoriesWithProducts = subcategories;
    
    // For parent categories, we need to fetch products from ALL subcategories combined
    let allProducts = [];
    
    // Check if this is a parent category (has children) or a subcategory
    const isParentCategory = subcategories.length > 0;
    
    if (isParentCategory) {
      // This is a parent category - the backend will automatically fetch products from all subcategories
      console.log(`Fetching products for parent category: ${category.name} with ${subcategories.length} subcategories`);
      console.log(`Using backend's getAllChildCategoryIds functionality for category: ${category._id}`);
      console.log(`Subcategories found:`, subcategories.map(sub => ({ id: sub._id, name: sub.name })));
      
      try {
        const productsData = await ProductServices.getShowingStoreProducts({
          category: category._id,
          limit: 50000,
          page: 1,
        });
        
        console.log(`Backend response:`, productsData);
        
        if (productsData.products && productsData.products.length > 0) {
          console.log(`Backend returned ${productsData.products.length} products for parent category: ${category.name}`);
          allProducts = productsData.products;
        } else {
          console.log(`No products returned from backend for parent category: ${category.name}`);
          console.log(`This might indicate an issue with the backend's getAllChildCategoryIds function or product-category relationships`);
          
          // Let's test what products exist in the database
          try {
            console.log(`Testing direct product fetch for debugging...`);
            const testProducts = await ProductServices.getShowingStoreProducts({
              limit: 10,
              page: 1,
            });
            console.log(`Total products in database: ${testProducts.products ? testProducts.products.length : 0}`);
            if (testProducts.products && testProducts.products.length > 0) {
              console.log(`Sample products:`, testProducts.products.slice(0, 3).map(p => ({
                id: p._id,
                title: p.title,
                category: p.category,
                categories: p.categories
              })));
            }
          } catch (testErr) {
            console.error(`Error in test product fetch:`, testErr);
          }
        }
      } catch (err) {
        console.error(`Error fetching products for parent category ${category._id}:`, err);
      }
    } else {
      // This is a subcategory or a leaf category - fetch products directly
      console.log(`Fetching products for category: ${category.name}`);
      const productsData = await ProductServices.getShowingStoreProducts({
        category: category._id,
        limit: 50000,
        page: 1,
      });
      allProducts = productsData.products || [];
      console.log(`Found ${allProducts.length} products in category: ${category.name}`);
    }

    // Remove duplicates (in case a product belongs to multiple subcategories)
    const uniqueProducts = [];
    const seenIds = new Set();
    
    for (const product of allProducts) {
      if (!seenIds.has(product._id)) {
        seenIds.add(product._id);
        uniqueProducts.push(product);
      }
    }

    // Get attributes
    const attributes = await AttributeServices.getShowingAttributes();

    return {
      props: {
        category,
        products: uniqueProducts,
        attributes: attributes || [],
        subcategories: subcategoriesWithProducts || [],
      },
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return {
      notFound: true,
    };
  }
};

export default CategoryPage; 