import { useContext, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { IoSearchOutline } from "react-icons/io5";
import { FiShoppingCart, FiUser, FiBell, FiChevronDown, FiTrash2 } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";
import dayjs from "dayjs";

//internal import
import { getUserSession } from "@lib/auth";
import useGetSetting from "@hooks/useGetSetting";
import { handleLogEvent } from "src/lib/analytics";
import NavbarPromo from "@layout/navbar/NavbarPromo";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import LanguageSelector from "@components/common/LanguageSelector";
import { UserContext } from "@context/UserContext";
import SocialLinks from "@components/common/SocialLinks";

import useUtilsFunction from "@hooks/useUtilsFunction";
import NotificationServices from "@services/NotificationServices";
import { useNotificationTranslation } from "@utils/notificationTranslator";

const Navbar = () => {
  const { t, lang } = useTranslation("common");
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState(searchText);
  const { toggleCartDrawer } = useContext(SidebarContext);
  const { totalItems } = useCart();
  const router = useRouter();

  const userInfo = getUserSession();

  const { storeCustomizationSetting } = useGetSetting();

  const { showDateTimeFormat } = useUtilsFunction();
  const { translateNotificationMessage } = useNotificationTranslation();

  const [imageUrl, setImageUrl] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const notificationRef = useRef();

  // Sync search text with URL query when on search page
  useEffect(() => {
    if (router.pathname === '/search' && router.query.query) {
      setSearchText(decodeURIComponent(router.query.query));
    } else if (router.pathname !== '/search') {
      // Clear search text when not on search page
      setSearchText("");
    }
  }, [router.pathname, router.query.query]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (searchValue) {
      router.push(`/search?query=${encodeURIComponent(searchValue)}`, null, { scroll: false });
      // Don't clear search text - keep it visible
      handleLogEvent("search", `searched ${searchValue}`);
    } else {
      router.push(`/`, null, { scroll: false });
    }
  };

  const handleNotificationToggle = async () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      await fetchNotifications();
    }
  };

  const fetchNotifications = async () => {
    // Prevent fetching if last fetch was less than 30 seconds ago
    const now = Date.now();
    if (now - lastFetchTime < 30000) {
      return;
    }
    
    try {
      const response = await NotificationServices.getAllNotifications();
      setNotifications(response.notifications || []);
      setUnreadCount(response.totalUnreadDoc || 0);
      setLastFetchTime(now);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleNotificationRead = async (id) => {
    try {
      await NotificationServices.updateNotificationStatus(id, { status: "read" });
      await fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationDelete = async (id) => {
    try {
      await NotificationServices.deleteNotification(id);
      await fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      // Add debouncing to prevent excessive notification requests
      const timeoutId = setTimeout(() => {
        fetchNotifications();
      }, 1000); // Wait 1 second before fetching notifications
      
      return () => clearTimeout(timeoutId);
    }
  }, [userInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchText) {
      setSearchValue(searchText);
    }
  }, [searchText]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setSearchText(value);
  };

  return (
    <>
      <CartDrawer />

      
      {/* Main Navigation */}
      <div className="bg-white sticky top-0 z-20 shadow-lg border-b border-gray-100 mobile-header">
        <div className="max-w-screen-2xl mx-auto responsive-padding">
          <div className="flex items-center justify-between navbar-responsive py-2">
            
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-1 sm:space-x-3 group">
                <div className="relative w-16 h-14 sm:w-18 sm:h-16 md:w-20 md:h-16 lg:w-24 lg:h-20 transition-transform group-hover:scale-105">
                  <Image
                    width="0"
                    height="0"
                    sizes="120vw"
                    className="w-full h-auto image-responsive"
                    priority
                    src="/logo/logo-color.svg"
                    alt={t("common:SAPT Supermarket")}
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <div className="flex items-center">
                    <span style={{ color: "#74338c" }} className="font-semibold text-responsive-xl tracking-tight leading-none ml-1 brand-name-arabic">
                      {t("common:MarketsTextPurple")}
                    </span>
                    <span style={{ color: "#76bd44" }} className="font-semibold text-responsive-xl tracking-tight leading-none ml-1 brand-name-arabic">
                      {t("common:SAPTMarketsTextGreen")}
                    </span>
                  </div>
                  <span className="text-responsive-xs text-gray-500 font-medium tracking-wide slogan-arabic">{t("common:fantasticOffers")}</span>
                </div>
              </Link>
            </div>

            {/* Search Section */}
            <div className="flex-1 max-w-3xl mx-4 lg:mx-8">
              <div className="relative">
                <form onSubmit={handleSubmit} className="relative">
                  <div className="relative flex items-center">
                    <input
                      onChange={handleSearchChange}
                      value={searchValue}
                      className="w-full input-responsive pl-3 sm:pl-6 pr-3 sm:pr-14 text-gray-700 placeholder-gray-400 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 text-responsive-sm font-medium h-8 sm:h-12 max-w-[140px] xs:max-w-[180px] sm:max-w-none focus:max-w-[180px] xs:focus:max-w-[220px] sm:focus:max-w-none ease-in-out"
                      placeholder={window.innerWidth < 640 ? t("common:Top-Search") : t("common:search-placeholder")}
                    />
                    <button
                      type="submit"
                      className="hidden sm:flex absolute right-1 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 touch-target"
                      style={{ backgroundColor: "#76bd44" }}
                    >
                      <IoSearchOutline className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center -space-x-1 sm:space-x-1">
              
              {/* Language Selector */}
              <div className="flex items-center">
                <div className="sm:hidden">
                  <LanguageSelector iconOnly={true} />
                </div>
                <div className="hidden sm:block">
                  <LanguageSelector />
                </div>
              </div>
              
              {/* Cart - Hidden on very small screens to save space for search */}
              <button
                onClick={toggleCartDrawer}
                className="hidden xs:flex relative p-0.5 sm:p-1.5 text-gray-600 hover:text-purple-600 transition-all duration-200 rounded-xl hover:bg-gray-50 group touch-target items-center justify-center"
              >
                <FiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow-sm"
                    style={{ backgroundColor: "#74338c" }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Notification Bell - Always visible on mobile */}
              <div className="relative flex items-center block" ref={notificationRef}>
                <button 
                  onClick={handleNotificationToggle}
                  className="relative p-0.5 sm:p-1.5 text-gray-600 hover:text-purple-600 transition-colors rounded-xl hover:bg-gray-50 group touch-target flex items-center justify-center"
                >
                  <FiBell className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className={`absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] overflow-hidden ${
                    lang === 'ar' ? 'left-0' : 'right-0'
                  } w-64 sm:w-72 md:w-80 max-w-[calc(100vw-2rem)]`}>
                    <div className="p-3 sm:p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800 text-responsive-base">{t("common:Notifications")}</h3>
                    </div>
                    <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-3 sm:p-4 text-center text-gray-500 text-responsive-sm">
                          {t("common:noNotifications")}
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 ${
                              notification.status === 'unread' ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Link
                                  href={
                                    notification.orderInvoice
                                      ? `/order/${notification.orderInvoice}`
                                      : notification.orderId
                                        ? `/order/${notification.orderId.toString()}`
                                        : '#'
                                  }
                                  onClick={() => handleNotificationRead(notification._id)}
                                  className="block"
                                >
                                  <p className="text-responsive-sm text-gray-800 mb-1">
                                    {translateNotificationMessage(notification).message}
                                  </p>
                                  <p className="text-responsive-xs text-gray-500">
                                    {dayjs(notification.createdAt).format("MMM D, YYYY h:mm A")}
                                  </p>
                                </Link>
                              </div>
                              <button
                                onClick={() => handleNotificationDelete(notification._id)}
                                className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors touch-target"
                              >
                                <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Account */}
              <div className="flex items-center">
                {userInfo?.image ? (
                  <Link href="/user/dashboard" className="relative p-0.5 sm:p-1.5 text-gray-600 hover:text-purple-600 transition-all duration-200 rounded-xl hover:bg-gray-50 group touch-target flex items-center justify-center">
                    <Image
                      width={20}
                      height={20}
                      src={userInfo?.image}
                      alt="user"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded group-hover:scale-110 transition-transform"
                    />
                  </Link>
                ) : (
                  <Link href={userInfo?.name ? "/user/dashboard" : "/auth/login"} className="relative p-0.5 sm:p-1.5 text-gray-600 hover:text-purple-600 transition-all duration-200 rounded-xl hover:bg-gray-50 group touch-target flex items-center justify-center">
                    <FiUser className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

              {/* Enhanced second header */}
      <NavbarPromo />
      
      {/* Floating Cart Button for very small screens */}
      <button
        onClick={toggleCartDrawer}
        className="xs:hidden fixed bottom-20 right-4 z-40 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 touch-target"
      >
        <FiShoppingCart className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  </>
);
};
export default Navbar;
