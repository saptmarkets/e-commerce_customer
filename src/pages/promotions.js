import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@layout/Layout";
import PageHeader from "@components/header/PageHeader";
import PromotionsHeroBanner from "@components/banner/PromotionsHeroBanner";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductServices from "@services/ProductServices";
import PromotionServices from "@services/PromotionServices";
import AttributeServices from "@services/AttributeServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import ProductCardModern from "@components/product/ProductCardModern";
import ComboOfferCard from "@components/product/ComboOfferCard";
import { IoGiftOutline, IoFlashOutline, IoPricetagOutline, IoBasketOutline } from "react-icons/io5";

const Promotions = ({ attributes }) => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, getNumberTwo, tr, lang } = useUtilsFunction();
  
  const [bulkPromotions, setBulkPromotions] = useState([]);
  const [assortedPromotions, setAssortedPromotions] = useState([]);
  const [comboPromotions, setComboPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // 🔥 NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 products per page
  
  // Fetch active promotions instead of general products
  const { data: activePromotions, isLoading: storeDataLoading } = useQuery({
    queryKey: ["active-promotions-for-promotions-page"],
    queryFn: async () => await PromotionServices.getActivePromotions(),
  });

  // Filter and prepare products with fixed price promotions
  const normalizedProductsWithFixedPrices = useMemo(() => {
    if (!activePromotions || !Array.isArray(activePromotions)) return [];
    
    return activePromotions
      .filter(promo => promo.type === 'fixed_price' && promo.isActive)
      .filter(promo => promo.productUnit && promo.productUnit.product)
      .map(promo => ({
        ...promo.productUnit.product,
        originalPrice: promo.productUnit.price,
        promotionalPrice: promo.value,
        promotionId: promo._id,
        promotionType: promo.type,
        minQty: promo.minQty,
        maxQty: promo.maxQty,
        startDate: promo.startDate,
        endDate: promo.endDate,
        // 🔥 FIX: Add multi-unit support properties
        hasMultiUnits: true,
        productUnit: promo.productUnit,
        // Add promotion data for proper display
        promotion: {
          ...promo,
          originalPrice: promo.productUnit.price,
          promotionalPrice: promo.value,
          savings: promo.productUnit.price - promo.value,
          savingsPercent: promo.productUnit.price > 0 ? ((promo.productUnit.price - promo.value) / promo.productUnit.price) * 100 : 0,
          unit: promo.productUnit,
          productUnit: promo.productUnit
        }
      }));
  }, [activePromotions]);

  // 🔥 NEW: Pagination logic for fixed price products
  const paginatedFixedPriceProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return normalizedProductsWithFixedPrices.slice(startIndex, endIndex);
  }, [normalizedProductsWithFixedPrices, currentPage, itemsPerPage]);

  // 🔥 NEW: Pagination logic for combo deals
  const paginatedComboDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return comboPromotions.slice(startIndex, endIndex);
  }, [comboPromotions, currentPage, itemsPerPage]);

  // 🔥 NEW: Calculate total pages
  const totalPagesFixedPrice = Math.ceil(normalizedProductsWithFixedPrices.length / itemsPerPage);
  const totalPagesComboDeals = Math.ceil(comboPromotions.length / itemsPerPage);
  const totalPages = Math.max(totalPagesFixedPrice, totalPagesComboDeals);

  // 🔥 NEW: Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔥 NEW: Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  
  // Get tab from URL query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        
        // Fetch other promotion types (not fixed price products since we get those from store data)
        console.log('Fetching other promotion types...');
        const [bulk, assorted] = await Promise.all([
          PromotionServices.getBulkPromotions(),
          PromotionServices.getAssortedPromotionsWithProducts()
        ]);
        
        // Combo deals are the same as assorted items promotions with products
        const comboDeals = assorted;
        
        console.log('Combo deals received:', comboDeals);
        
        setBulkPromotions(bulk || []);
        setAssortedPromotions(assorted || []);
        setComboPromotions(comboDeals || []);
        
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const tabs = [
    { id: 'all', label: tr('All Offers', 'جميع العروض'), icon: IoGiftOutline },
    { id: 'special-prices', label: tr('Special Prices', 'أسعار خاصة'), icon: IoPricetagOutline },
    { id: 'combo-deals', label: tr('Combo Deals', 'عروض كومبو'), icon: IoFlashOutline }
  ];

  const PromotionCard = ({ promotion, type }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
        <div className={`p-4 ${
          type === 'fixed' ? 'bg-red-50 border-b border-red-100' :
          type === 'bulk' ? 'bg-blue-50 border-b border-blue-100' :
          'bg-purple-50 border-b border-purple-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {type === 'fixed' && <IoPricetagOutline className="text-red-600 text-xl mr-2" />}
              {type === 'bulk' && <IoBasketOutline className="text-blue-600 text-xl mr-2" />}
              {type === 'combo' && <IoFlashOutline className="text-purple-600 text-xl mr-2" />}
              <h3 className="font-semibold text-gray-800">{showingTranslateValue(promotion.title)}</h3>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              type === 'fixed' ? 'bg-red-100 text-red-800' :
              type === 'bulk' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {type === 'fixed' ? tr('Special Price', 'سعر خاص') :
               type === 'bulk' ? tr('Bulk Deal', 'صفقة بالجملة') : tr('Combo Deal', 'عرض كومبو')}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-3">{showingTranslateValue(promotion.description)}</p>
          
          {type === 'fixed' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{tr('Special Price:', 'سعر خاص:')}</span>
                <span className="font-bold text-red-600">${getNumberTwo(promotion.value)}</span>
              </div>
              {promotion.minQty > 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{tr('Minimum Quantity:', 'الحد الأدنى للكمية:')}</span>
                  <span className="font-medium">{promotion.minQty}</span>
                </div>
              )}
            </div>
          )}
          
          {type === 'bulk' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{tr('Buy:', 'اشترِ:')}</span>
                <span className="font-medium">{promotion.requiredQty} {tr('items', 'عنصر')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{tr('Get Free:', 'احصل على مجاناً:')}</span>
                <span className="font-bold text-green-600">{promotion.freeQty} {tr('items', 'عنصر')}</span>
              </div>
              {promotion.minPurchaseAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{tr('Min Purchase:', 'الحد الأدنى للشراء:')}</span>
                  <span className="font-medium">${getNumberTwo(promotion.minPurchaseAmount)}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{tr('Valid until:', 'صالح حتى:')} {new Date(promotion.endDate).toLocaleDateString()}</span>
              <span className={`px-2 py-1 rounded ${
                promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {promotion.isActive ? tr('Active', 'نشط') : tr('Inactive', 'غير نشط')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      title={tr("Promotions & Deals", "العروض والتخفيضات")}
      description={tr("Discover amazing promotions, bulk deals, and combo offers", "اكتشف العروض المذهلة، وصفقات الجملة، وعروض الكومبو")}
    >
      <div className="mx-auto max-w-screen-2xl px-4 py-2 sm:px-10">
        {/* Promotions Hero Banner */}
        <PromotionsHeroBanner />

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 mx-2 mb-2 rounded-t-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <CMSkeleton count={6} height={200} loading={loading} />
        ) : (
          <>
            {/* Fixed Price Promotions - Show Products */}
            {(activeTab === 'all' || activeTab === 'special-prices') && normalizedProductsWithFixedPrices.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <IoPricetagOutline className="text-red-600 mr-3" />
                  {tr('Special Price Offers', 'عروض الأسعار الخاصة')} ({normalizedProductsWithFixedPrices.length} {lang === 'ar' ? 'منتج' : 'products'})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                  {paginatedFixedPriceProducts.map((product) => (
                    <ProductCardModern
                      key={product._id}
                      product={product}
                      attributes={attributes || []}
                      compact={false}
                      showQuantitySelector={true}
                      showFavorite={true}
                    />
                  ))}
                </div>
                
                {/* 🔥 NEW: Pagination for Fixed Price Products */}
                {totalPagesFixedPrice > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {lang === 'ar' ? 'السابق' : 'Previous'}
                      </button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: totalPagesFixedPrice }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPagesFixedPrice}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === totalPagesFixedPrice
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {lang === 'ar' ? 'التالي' : 'Next'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Combo Deals */}
            {(activeTab === 'all' || activeTab === 'combo-deals') && comboPromotions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <IoFlashOutline className="text-purple-600 mr-3" />
                  {tr('Combo Deals', 'عروض كومبو')} ({comboPromotions.length} {lang === 'ar' ? 'متوفر' : 'available'})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {paginatedComboDeals.map((promotion) => (
                    <ComboOfferCard
                      key={promotion._id}
                      promotion={promotion}
                    />
                  ))}
                </div>
                
                {/* 🔥 NEW: Pagination for Combo Deals */}
                {totalPagesComboDeals > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {lang === 'ar' ? 'السابق' : 'Previous'}
                      </button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: totalPagesComboDeals }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPagesComboDeals}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === totalPagesComboDeals
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {lang === 'ar' ? 'التالي' : 'Next'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Promotions Message */}
            {normalizedProductsWithFixedPrices.length === 0 && bulkPromotions.length === 0 && assortedPromotions.length === 0 && comboPromotions.length === 0 && (
              <div className="text-center py-16">
                <IoGiftOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">{tr('No Promotions Available', 'لا توجد عروض متاحة')}</h3>
                <p className="text-gray-500">
                  {tr('There are no active promotions at the moment. Check back soon for amazing deals!', 'لا توجد عروض نشطة في الوقت الحالي. عد قريبًا للحصول على صفقات مذهلة!')}
                </p>
              </div>
            )}

            {/* 🔥 NEW: Summary and Total Count */}
            {(normalizedProductsWithFixedPrices.length > 0 || comboPromotions.length > 0) && (
              <div className="mt-8 text-center text-gray-600">
                <p className="text-sm">
                  {tr('Showing', 'عرض')} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, Math.max(normalizedProductsWithFixedPrices.length, comboPromotions.length))} {tr('of', 'من')} {Math.max(normalizedProductsWithFixedPrices.length, comboPromotions.length)} {tr('promotions', 'عروض')}
                </p>
                {totalPages > 1 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {tr('Page', 'صفحة')} {currentPage} {tr('of', 'من')} {totalPages}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  const attributes = await AttributeServices.getShowingAttributes();
  
  return {
    props: {
      attributes,
    },
  };
};

export default Promotions;