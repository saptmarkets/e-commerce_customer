import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import { IoHomeOutline, IoBagOutline, IoGiftOutline, IoInformationCircleOutline, IoDocumentTextOutline, IoShieldCheckmarkOutline, IoHelpCircleOutline, IoPersonCircleOutline } from "react-icons/io5";

//internal import
import Loading from "@components/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";

const Category = () => {
  const { categoryDrawerOpen, closeCategoryDrawer } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation("common");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use getMainCategories instead of getShowingCategory for better performance
  const { data, error, isLoading, isFetched } = useQuery({
    queryKey: ["category-main"],
    queryFn: async () => await CategoryServices.getMainCategories(),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    const filterCategoriesWithProducts = async () => {
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('🔍 Processing categories:', data.length);
        
        const categoriesWithProducts = [];
        for (const category of data) {
          try {
            const hasMainCategoryProducts = await ProductServices.checkCategoryHasProducts(category._id);
            let hasSubcategoryProducts = false;
            
            if (category.children && category.children.length > 0) {
              for (const subcategory of category.children) {
                const hasSubProducts = await ProductServices.checkCategoryHasProducts(subcategory._id);
                if (hasSubProducts) {
                  hasSubcategoryProducts = true;
                  break;
                }
              }
            }
            
            if (hasMainCategoryProducts || hasSubcategoryProducts) {
              if (category.children && category.children.length > 0) {
                const filteredSubcategories = [];
                for (const subcategory of category.children) {
                  const hasSubProducts = await ProductServices.checkCategoryHasProducts(subcategory._id);
                  if (hasSubProducts) {
                    filteredSubcategories.push(subcategory);
                  }
                }
                category.children = filteredSubcategories;
              }
              categoriesWithProducts.push(category);
            }
          } catch (err) {
            console.error('Error processing category:', category._id, err);
            // Still add the category if we can't check products
            categoriesWithProducts.push(category);
          }
        }
        
        console.log('✅ Final categories with products:', categoriesWithProducts.length);
        setFilteredCategories(categoriesWithProducts);
      } catch (error) {
        console.error('Error filtering categories:', error);
        // Fallback: show all categories if filtering fails
        setFilteredCategories(data || []);
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      filterCategoriesWithProducts();
    } else if (isFetched && !isLoading) {
      // If query is done but no data, stop loading
      setLoading(false);
    }
  }, [data, isFetched, isLoading]);

  // Define internal pages as a fallback if @utils/data is not correctly structured or found
  const pages = [
    { titleKey: "HOME", href: "/", icon: <IoHomeOutline className="text-lg ml-2" /> },
    { titleKey: "Products", href: "/products", icon: <IoBagOutline className="text-lg ml-2" /> },
    { titleKey: "Promotions", href: "/promotions", icon: <IoGiftOutline className="text-lg ml-2" /> },
    { titleKey: "About Us", href: "/about-us", icon: <IoInformationCircleOutline className="text-lg ml-2" /> },
    { titleKey: "Terms & Conditions", href: "/terms-and-conditions", icon: <IoDocumentTextOutline className="text-lg ml-2" /> },
    { titleKey: "Privacy Policy", href: "/privacy-policy", icon: <IoShieldCheckmarkOutline className="text-lg ml-2" /> },
    { titleKey: "FAQ", href: "/faq", icon: <IoHelpCircleOutline className="text-lg ml-2" /> },
    { titleKey: "My account", href: "/user/dashboard", icon: <IoPersonCircleOutline className="text-lg ml-2" /> },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-white cursor-pointer scrollbar-hide">
      {categoryDrawerOpen && (
        <div className="w-full flex justify-between items-center h-16 px-6 py-4 bg-green-600 text-white border-b border-gray-100">
          <h2 className="font-semibold font-serif text-lg m-0 text-heading flex align-center">
            <Link href="/" className="mr-10">
              <Image
                width={60}
                height={22}
                src="/logo/logo-light.svg"
                alt="logo"
              />
            </Link>
          </h2>
          <button
            onClick={closeCategoryDrawer}
            className="flex text-lg items-center justify-center w-6 h-6 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 focus:outline-none transition-all duration-200 hover:scale-110"
            aria-label="close"
          >
            <IoClose className="text-sm" />
          </button>
        </div>
      )}
      <div className="w-full max-h-full">
        {/* New Pages Section */}
        <div className="relative grid gap-2 mt-2">
          {/* Removed Pages header */}
          <div className="relative grid gap-1 p-6">
            {pages.map((item) => (
              <Link
                key={item.titleKey}
                href={item.href}
                className="p-2 flex font-serif items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600"
                onClick={closeCategoryDrawer}
              >
                <span className="flex items-center w-full">
                  {item.icon}
                  <span className="text-sm font-medium w-full hover:text-emerald-600">
                    {t(item.titleKey)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories Section (Always Open) */}
        <div className="relative grid gap-2 mt-2">
          <div className="w-full flex items-center justify-between border-b px-8 py-3 bg-transparent">
            <h2 className="font-semibold font-serif text-lg m-0 text-heading flex align-center">
              {t("Categories")}
            </h2>
          </div>
          
          {/* Categories List - Always Visible */}
          <div className="relative grid gap-2 p-6" id="category-list">
            {loading ? (
              <Loading loading={loading} />
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500 text-sm mb-2">Error loading categories</p>
                <p className="text-gray-500 text-xs">{error?.message || 'Unknown error'}</p>
              </div>
            ) : filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <Link
                  key={category._id}
                  href={`/category/${category._id}`}
                  className="p-3 flex items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600 transition-colors duration-200"
                  onClick={closeCategoryDrawer}
                >
                  {category.icon ? (
                    <div className="w-6 h-6 mr-3 flex-shrink-0 relative">
                      <Image
                        src={category.icon}
                        alt={showingTranslateValue(category?.name)}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 mr-3 flex-shrink-0 bg-gray-200 rounded"></div>
                  )}
                  
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    {showingTranslateValue(category?.name)}
                  </span>
                  
                  {/* Arrow indicator for categories with subcategories */}
                  {category.children && category.children.length > 0 && (
                    <IoChevronForward className="text-gray-400 text-lg" />
                  )}
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No categories available</p>
                <p className="text-gray-400 text-xs mt-1">Try refreshing the page</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
