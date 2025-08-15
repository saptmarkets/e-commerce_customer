import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useRef } from "react";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Controller, Navigation, Pagination } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";

//internal import
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Loading from "@components/preloader/Loading";

const CategoryCarousel = () => {
  const router = useRouter();

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const { showingTranslateValue } = useUtilsFunction();
  const { isLoading, setIsLoading } = useContext(SidebarContext);

  const {
    data,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["category-carousel"],
    queryFn: async () => await CategoryServices.getMainCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // console.log("data", data, "error", error, "isFetched", isFetched);

  const handleCategoryClick = (id, category) => {
    router.push(`/category/${id}`);
    setIsLoading(!isLoading);
  };

  return (
    <>
      <Swiper
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        dir="ltr"
        autoplay={{
          delay: 4000, // Increased delay to match other carousels
          disableOnInteraction: false,
        }}
        spaceBetween={6}
        navigation={true}
        allowTouchMove={false}
        loop={false} // Disable built-in loop to implement custom behavior
        breakpoints={{
          // Mobile - smaller cards
          375: {
            width: 375,
            slidesPerView: 3,
            spaceBetween: 4,
          },
          // Small mobile
          414: {
            width: 414,
            slidesPerView: 4,
            spaceBetween: 4,
          },
          // Large mobile
          660: {
            width: 660,
            slidesPerView: 5,
            spaceBetween: 6,
          },
          // Tablet
          768: {
            width: 768,
            slidesPerView: 6,
            spaceBetween: 6,
          },
          // Small desktop
          991: {
            width: 991,
            slidesPerView: 8,
            spaceBetween: 8,
          },
          // Large desktop
          1140: {
            width: 1140,
            slidesPerView: 9,
            spaceBetween: 8,
          },
          // Extra large
          1680: {
            width: 1680,
            slidesPerView: 10,
            spaceBetween: 10,
          },
        }}
        modules={[Autoplay, Controller, Navigation, Pagination]}
        className="category-carousel-swiper"
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loading />
          </div>
        ) : data && data.length > 0 ? (
          data.map((category) => (
            <SwiperSlide key={category._id}>
              <div
                onClick={() =>
                  handleCategoryClick(category._id, showingTranslateValue(category.name))
                }
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300">
                  {category.icon ? (
                    <div className="w-12 h-12 mx-auto mb-2 relative">
                      <Image
                        src={category.icon}
                        alt={showingTranslateValue(category.name)}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  <h3 className="text-xs font-medium text-gray-800 group-hover:text-green-600 transition-colors duration-300 line-clamp-2">
                    {showingTranslateValue(category.name)}
                  </h3>
                  {category.children && category.children.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {category.children.length} {category.children.length === 1 ? 'sub' : 'subs'}
                    </p>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories available</p>
          </div>
        )}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          ref={prevRef}
          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
          aria-label="Previous categories"
        >
          <IoChevronBackOutline className="w-5 h-5 text-gray-600" />
        </button>
        <button
          ref={nextRef}
          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
          aria-label="Next categories"
        >
          <IoChevronForward className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </>
  );
};

export default CategoryCarousel;
