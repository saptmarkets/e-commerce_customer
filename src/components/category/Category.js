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
import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";

const Category = () => {
  const { categoryDrawerOpen, closeCategoryDrawer } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { t } = useTranslation("common");

  // Use getShowingCategory like the backup version for immediate loading
  const { data: categories, error, isLoading } = useQuery({
    queryKey: ["category-show"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Filter to only show main categories (no parentId or top-level)
  const mainCategories = categories?.filter(
    (cat) => !cat.parentId || cat.parentId === "62c827b5a427b63741da9175"
  ) || [];

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
            {isLoading ? (
              <Loading loading={isLoading} />
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500 text-sm mb-2">Error loading categories</p>
                <p className="text-gray-500 text-xs">{error?.message || 'Unknown error'}</p>
              </div>
            ) : mainCategories && mainCategories.length > 0 ? (
              mainCategories.map((category) => (
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
