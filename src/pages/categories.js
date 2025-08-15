import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "@layout/Layout";
import CategoryTopBanner from "@components/banner/CategoryTopBanner";
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";
import useGetSetting from "@hooks/useGetSetting";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Categories = ({ categories }) => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, tr, lang } = useUtilsFunction();
  const [loading, setLoading] = useState(true);
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Show all active categories (as provided by backend), grouped by main with children nested
  useEffect(() => {
    setLoading(true);
    try {
      // Categories are already filtered to main categories by the backend
      setFilteredCategories(categories || []);
    } catch (e) {
      console.error('Error in useEffect:', e);
      setFilteredCategories([]);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  return (
    <>
      <Head>
        <title>{tr("Categories", "الفئات")} | {storeCustomizationSetting?.store?.name || "SAPT Markets"}</title>
        <meta 
          name="description" 
          content={tr(
            "Browse all product categories. Find exactly what you're looking for.",
            "تصفح جميع فئات المنتجات. ابحث عن كل ما تحتاجه بسهولة."
          )}
        />
      </Head>

      <Layout>
        <div className="mx-auto max-w-screen-2xl px-4 py-2 sm:px-10">
          {/* Category Top Banner */}
          <CategoryTopBanner />
          
          <div className="flex flex-col">
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                {tr("Shop by Categories", "تسوق حسب الفئات")}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {tr(
                  "Discover our wide range of product categories",
                  "اكتشف مجموعتنا الواسعة من فئات المنتجات"
                )}
              </p>
            </div>

            {loading ? (
              <CMSkeleton count={12} height={200} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {filteredCategories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/category/${category._id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 text-center hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 group-hover:border-emerald-200 group-hover:-translate-y-1">
                      {/* Category Icon */}
                      <div className="mb-3 flex justify-center">
                        {category.icon ? (
                          <div className="relative group">
                            <img
                              src={category.icon}
                              alt={showingTranslateValue(category.name)}
                              width={80}
                              height={80}
                              className="object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105"
                            />
                            {/* Hover overlay effect */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-300"></div>
                          </div>
                        ) : (
                          <div className="w-15 h-15 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 mb-2">
                        {showingTranslateValue(category.name)}
                      </h3>
                      
                      {/* Category Description */}
                      {category.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2 font-medium">
                          {showingTranslateValue(category.description)}
                        </p>
                      )}
                      
                      {/* Subcategory Count */}
                      {category.children && category.children.length > 0 && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200 transition-colors duration-300">
                            {category.children.length} {category.children.length === 1 ? 'subcategory' : 'subcategories'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {tr('No Categories Found', 'لا توجد فئات')}
                </h3>
                <p className="text-gray-500">
                  {tr(
                    'No categories are available at the moment.',
                    'لا توجد فئات متاحة حالياً.'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps = async () => {
  try {
    // Try to get categories from the same source as homepage
    let categories;
    
    // First try the processed categories (like homepage)
    try {
      const processedCategories = await CategoryServices.getShowingCategory();
      
      // Filter to main categories only
      categories = processedCategories.filter(cat => 
        cat.status === 'show' && (!cat.parentId || cat.parentId === null || cat.parentId === "")
      );
    } catch (error) {
      categories = await CategoryServices.getMainCategories();
    }
    
    return {
      props: {
        categories: categories || [],
      },
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      props: {
        categories: [],
      },
    };
  }
};

export default Categories; 