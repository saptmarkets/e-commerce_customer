import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
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

  // Filter categories to only show those with products
  useEffect(() => {
    const filterCategoriesWithProducts = async () => {
      setLoading(true);
      
      try {
        // Generalized root detection: treat categories without a valid parentId as root
        const isRoot = (cat) => !cat.parentId || cat.parentId === "0" || cat.parentId === "root" || cat.parentId === "ROOT" || cat.parentId === "null" || cat.parentId === null || cat.parentId === undefined;
        const mainCategories = categories?.filter(isRoot) || [];

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
        console.error("Error filtering categories:", error);
        setFilteredCategories([]);
      } finally {
        setLoading(false);
      }
    };

    filterCategoriesWithProducts();
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
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {tr("Shop by Categories", "تسوق حسب الفئات")}
              </h1>
              <p className="text-gray-600">
                {tr(
                  "Discover our wide range of product categories",
                  "اكتشف مجموعتنا الواسعة من فئات المنتجات"
                )}
              </p>
            </div>

            {loading ? (
              <CMSkeleton count={12} height={200} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {filteredCategories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug || category._id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 text-center hover:shadow-md transition-all duration-200 group-hover:border-green-200">
                      {/* Category Icon */}
                      <div className="mb-3 flex justify-center">
                        {category.icon ? (
                          <Image
                            src={category.icon}
                            alt={showingTranslateValue(category.name)}
                            width={60}
                            height={60}
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-15 h-15 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-sm md:text-base font-medium text-gray-800 group-hover:text-green-600 transition-colors duration-200">
                        {showingTranslateValue(category.name)}
                      </h3>
                      
                      {/* Category Description */}
                      {category.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {showingTranslateValue(category.description)}
                        </p>
                      )}
                      
                      {/* Subcategories Count */}
                      {category.children && category.children.length > 0 && (
                        <p className="text-xs text-green-600 mt-2">
                          {lang === "ar"
                            ? `${category.children.length} فئة فرعية`
                            : `${category.children.length} subcategories`
                          }
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Categories Message */}
            {!loading && filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {tr("No Categories Found", "لا توجد فئات")}
                </h3>
                <p className="text-gray-500">
                  {tr(
                    "Categories with products will appear here once they are added.",
                    "ستظهر الفئات التي تحتوي على منتجات هنا بمجرد إضافتها."
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
    const categories = await CategoryServices.getShowingCategory();
    
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