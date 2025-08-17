import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { LocationMarkerIcon, OfficeBuildingIcon, ShoppingCartIcon, StarIcon, ClockIcon, CalendarIcon } from "@heroicons/react/solid";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import PageHeader from "@components/header/PageHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

// lightweight wrapper to keep page tidy
const SectionBox = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow p-6 md:p-8 mb-6 ${className}`}>
    {children}
  </div>
);

const AboutUs = () => {
  const { showingTranslateValue, lang } = useUtilsFunction();
  const { storeCustomizationSetting, loading } = useGetSetting();
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // Force refetch by updating the key
    window.location.reload();
  };

  // Debug logging to see what data we're getting
  useEffect(() => {
    if (storeCustomizationSetting && !loading) {
      console.log("🔍 Customer App - About Us Data:", {
        hasData: !!storeCustomizationSetting,
        aboutUsExists: !!storeCustomizationSetting?.about_us,
        aboutUsKeys: Object.keys(storeCustomizationSetting?.about_us || {}),
        founderFields: Object.keys(storeCustomizationSetting?.about_us || {}).filter(key => key.startsWith('founder_')),
        founderOneName: storeCustomizationSetting?.about_us?.founder_one_name,
        founderTwoName: storeCustomizationSetting?.about_us?.founder_two_name,
        founderThreeName: storeCustomizationSetting?.about_us?.founder_three_name,
        founderFourName: storeCustomizationSetting?.about_us?.founder_four_name,
        totalFounders: Object.keys(storeCustomizationSetting?.about_us || {}).filter(key => key.includes('founder_') && key.includes('_name')).length,
        // Add detailed founder data
        founderOneData: {
          name: storeCustomizationSetting?.about_us?.founder_one_name,
          position: storeCustomizationSetting?.about_us?.founder_one_position,
          sub: storeCustomizationSetting?.about_us?.founder_one_sub,
          img: storeCustomizationSetting?.about_us?.founder_one_img
        },
        founderTwoData: {
          name: storeCustomizationSetting?.about_us?.founder_two_name,
          position: storeCustomizationSetting?.about_us?.founder_two_position,
          sub: storeCustomizationSetting?.about_us?.founder_two_sub,
          img: storeCustomizationSetting?.about_us?.founder_two_img
        },
        founderThreeData: {
          name: storeCustomizationSetting?.about_us?.founder_three_name,
          position: storeCustomizationSetting?.about_us?.founder_three_position,
          sub: storeCustomizationSetting?.about_us?.founder_three_sub,
          img: storeCustomizationSetting?.about_us?.founder_three_img
        },
        founderFourData: {
          name: storeCustomizationSetting?.about_us?.founder_four_name,
          position: storeCustomizationSetting?.about_us?.founder_four_position,
          sub: storeCustomizationSetting?.about_us?.founder_four_sub,
          img: storeCustomizationSetting?.about_us?.founder_four_img
        },
        founderFiveData: {
          name: storeCustomizationSetting?.about_us?.founder_five_name,
          position: storeCustomizationSetting?.about_us?.founder_five_position,
          sub: storeCustomizationSetting?.about_us?.founder_five_sub,
          img: storeCustomizationSetting?.about_us?.founder_five_img
        },
        founderSixData: {
          name: storeCustomizationSetting?.about_us?.founder_six_name,
          position: storeCustomizationSetting?.about_us?.founder_six_position,
          sub: storeCustomizationSetting?.about_us?.founder_six_sub,
          img: storeCustomizationSetting?.about_us?.founder_six_img
        },
        founderSevenData: {
          name: storeCustomizationSetting?.about_us?.founder_seven_name,
          position: storeCustomizationSetting?.about_us?.founder_seven_position,
          sub: storeCustomizationSetting?.about_us?.founder_seven_sub,
          img: storeCustomizationSetting?.about_us?.founder_seven_img
        },
        founderEightData: {
          name: storeCustomizationSetting?.about_us?.founder_eight_name,
          position: storeCustomizationSetting?.about_us?.founder_eight_position,
          sub: storeCustomizationSetting?.about_us?.founder_eight_sub,
          img: storeCustomizationSetting?.about_us?.founder_eight_img
        },
        founderNineData: {
          name: storeCustomizationSetting?.about_us?.founder_nine_name,
          position: storeCustomizationSetting?.about_us?.founder_nine_position,
          sub: storeCustomizationSetting?.about_us?.founder_nine_sub,
          img: storeCustomizationSetting?.about_us?.founder_nine_img
        },
        founderTenData: {
          name: storeCustomizationSetting?.about_us?.founder_ten_name,
          position: storeCustomizationSetting?.about_us?.founder_ten_position,
          sub: storeCustomizationSetting?.about_us?.founder_ten_sub,
          img: storeCustomizationSetting?.about_us?.founder_ten_img
        },
        founderElevenData: {
          name: storeCustomizationSetting?.about_us?.founder_eleven_name,
          position: storeCustomizationSetting?.about_us?.founder_eleven_position,
          sub: storeCustomizationSetting?.about_us?.founder_eleven_sub,
          img: storeCustomizationSetting?.about_us?.founder_eleven_img
        },
        founderTwelveData: {
          name: storeCustomizationSetting?.about_us?.founder_twelve_name,
          position: storeCustomizationSetting?.about_us?.founder_twelve_position,
          sub: storeCustomizationSetting?.about_us?.founder_twelve_sub,
          img: storeCustomizationSetting?.about_us?.founder_twelve_img
        },
        // Check if data exists but is empty - now handles new object structure with language keys
        hasFounderOneName: !!storeCustomizationSetting?.about_us?.founder_one_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_one_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_one_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_one_name?.en || storeCustomizationSetting?.about_us?.founder_one_name?.ar)),
        hasFounderTwoName: !!storeCustomizationSetting?.about_us?.founder_two_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_two_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_two_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_two_name?.en || storeCustomizationSetting?.about_us?.founder_two_name?.ar)),
        hasFounderThreeName: !!storeCustomizationSetting?.about_us?.founder_three_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_three_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_three_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_three_name?.en || storeCustomizationSetting?.about_us?.founder_three_name?.ar)),
        hasFounderFourName: !!storeCustomizationSetting?.about_us?.founder_four_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_four_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_four_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_four_name?.en || storeCustomizationSetting?.about_us?.founder_four_name?.ar)),
        hasFounderFiveName: !!storeCustomizationSetting?.about_us?.founder_five_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_five_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_five_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_five_name?.en || storeCustomizationSetting?.about_us?.founder_five_name?.ar)),
        hasFounderSixName: !!storeCustomizationSetting?.about_us?.founder_six_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_six_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_six_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_six_name?.en || storeCustomizationSetting?.about_us?.founder_six_name?.ar)),
        hasFounderSevenName: !!storeCustomizationSetting?.about_us?.founder_seven_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_seven_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_seven_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_seven_name?.en || storeCustomizationSetting?.about_us?.founder_seven_name?.ar)),
        hasFounderEightName: !!storeCustomizationSetting?.about_us?.founder_eight_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_eight_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_eight_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_eight_name?.en || storeCustomizationSetting?.about_us?.founder_eight_name?.ar)),
        hasFounderNineName: !!storeCustomizationSetting?.about_us?.founder_nine_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_nine_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_nine_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_nine_name?.en || storeCustomizationSetting?.about_us?.founder_nine_name?.ar)),
        hasFounderTenName: !!storeCustomizationSetting?.about_us?.founder_ten_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_ten_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_ten_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_ten_name?.en || storeCustomizationSetting?.about_us?.founder_ten_name?.ar)),
        hasFounderElevenName: !!storeCustomizationSetting?.about_us?.founder_eleven_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_eleven_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_eleven_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_eleven_name?.en || storeCustomizationSetting?.about_us?.founder_eleven_name?.ar)),
        hasFounderTwelveName: !!storeCustomizationSetting?.about_us?.founder_twelve_name && 
          (typeof storeCustomizationSetting?.about_us?.founder_twelve_name === 'string' ? 
            storeCustomizationSetting?.about_us?.founder_twelve_name.trim().length > 0 : 
            (storeCustomizationSetting?.about_us?.founder_twelve_name?.en || storeCustomizationSetting?.about_us?.founder_twelve_name?.ar)),
        // Raw data for debugging
        rawAboutUs: storeCustomizationSetting?.about_us
      });
    }
  }, [storeCustomizationSetting, loading]);

  // Helper to test if a translation field actually contains visible text
  const hasContent = (field) => {
    // Handle new object structure with language keys
    if (field && typeof field === 'object' && (field.en || field.ar)) {
      return !!(field.en || field.ar);
    }
    // Handle old string structure for backward compatibility
    if (!field || typeof field !== 'string') {
      return false;
    }
    return field.trim().length > 0;
  };

  // Derive brand color (fallback to emerald brand)
  const brandColor = useMemo(() => {
    return (
      storeCustomizationSetting?.brand_color ||
      storeCustomizationSetting?.settings?.brand_color ||
      "#059669"
    );
  }, [storeCustomizationSetting]);

  return (
    <Layout title="About Us" description="This is about us page">
      {/* Hero Section */}
      {(() => {
        const ab = storeCustomizationSetting?.about_us || {};
        const hasBg = ab.header_bg;
        const bgStyle = hasBg
          ? {
              backgroundImage: `url(${ab.header_bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {};
        const bgClasses = hasBg ? '' : 'bg-gradient-to-br from-emerald-700 to-green-500';
        return (
          <section
            className={`relative text-white py-20 overflow-hidden ${bgClasses}`}
            style={bgStyle}
          >
            {/* overlay tint */}
            {hasBg && (
              <div className="absolute inset-0 opacity-80" style={{ background: brandColor }}></div>
            )}
            <div className="relative container mx-auto px-4 text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 capitalize font-noor">
                {loading ? (
                  <CMSkeleton count={1} height={60} loading={loading} />
                ) : (
                  showingTranslateValue(ab.title) || 'About Us'
                )}
              </h1>
              <p className="text-lg lg:text-2xl opacity-90 max-w-3xl mx-auto font-noor">
                {loading ? (
                  <CMSkeleton count={2} height={30} loading={loading} />
                ) : (
                  showingTranslateValue(ab.hero_description) ||
                  'Learn more about SAPT Markets and our story of serving the Qassim community with excellence'
                )}
              </p>
            </div>
          </section>
        );
      })()}

      {/* Main Page Container start */}
      <div className="bg-[#F5F1FA] w-full px-4 pt-12">

      {/* Top Content Section */}
      <section className="">
        <div>
          <SectionBox>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-emerald-800 leading-tight font-noor">
                {loading ? (
                  <CMSkeleton count={1} height={50} loading={loading} />
                ) : (
                  showingTranslateValue(storeCustomizationSetting?.about_us?.top_section_title) || "A Trusted Name in Qassim Retail"
                )}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4 font-noor">
                {loading ? (
                  <CMSkeleton count={3} height={25} loading={loading} />
                ) : (
                  showingTranslateValue(storeCustomizationSetting?.about_us?.top_section_description) || "At SAPT Markets, we've built our reputation on providing quality products and exceptional service to families across the Qassim region."
                )}
              </p>
              
              {/* Trusted badges */}
              {(() => {
                const pill1 = showingTranslateValue(storeCustomizationSetting?.about_us?.trusted_badge_one_pill);
                const text1 = showingTranslateValue(storeCustomizationSetting?.about_us?.trusted_badge_one_text);
                const pill2 = showingTranslateValue(storeCustomizationSetting?.about_us?.trusted_badge_two_pill);
                const text2 = showingTranslateValue(storeCustomizationSetting?.about_us?.trusted_badge_two_text);

                if (!pill1 && !pill2) return null;

                const BadgeLine = ({ pill, text }) => (
                  <div className="flex items-center space-x-2 mb-2">
                    {pill && (
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full font-noor">
                        {pill}
                      </span>
                    )}
                    {text && (
                      <span className="text-sm text-gray-600 font-medium font-noor">
                        {text}
                      </span>
                    )}
                  </div>
                );

                return (
                  <div className="mb-6">
                    { (pill1 || text1) && <BadgeLine pill={pill1} text={text1} /> }
                    { (pill2 || text2) && <BadgeLine pill={pill2} text={text2} /> }
                  </div>
                );
              })()}
            </div>
            
              <div className="flex items-center justify-center">
                {storeCustomizationSetting?.about_us?.top_section_image ? (
                  <div className="w-full bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl shadow-xl overflow-hidden">
                  <Image
                    src={storeCustomizationSetting.about_us.top_section_image}
                    alt="Modern Storefront"
                      width={1050}
                      height={805}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-6 text-7xl md:text-8xl mb-4">
                      <span>🥦</span>
                      <span>🥕</span>
                      <span>🍅</span>
                    </div>
                    <p className="text-lg font-semibold text-emerald-800 font-noor">Fresh Local Produce</p>
                  </div>
                )}
              </div>
            </div>
          </SectionBox>
        </div>
      </section>

      {/* Heritage Section */}
      {storeCustomizationSetting?.about_us?.heritage_title && (
        <section className="">
          <SectionBox className="mx-4 md:mx-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <h2 className="text-4xl font-bold text-emerald-800 mb-8 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.heritage_title) || "Our Heritage & Vision"}
              </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed font-noor">
                  <p>
                    {showingTranslateValue(storeCustomizationSetting?.about_us?.heritage_description_one) || 
                      "SAPT Markets is proudly part of the Al-Muhaysini Holding family, a trusted name in the Qassim region with deep roots in our community. Our journey began with a simple vision: to provide families with convenient access to quality products at competitive prices."}
                  </p>
                  <p>
                    {showingTranslateValue(storeCustomizationSetting?.about_us?.heritage_description_two) || 
                      "Today, SAPT operates multiple locations throughout Buraidah, each designed to serve as more than just a marketplace – we're community hubs where neighbors meet, families shop together, and local traditions are celebrated through the products we offer."}
              </p>
            </div>
              </div>
              <div className="relative lg:order-1">
              {storeCustomizationSetting?.about_us?.heritage_image ? (
                <Image
                  src={storeCustomizationSetting.about_us.heritage_image}
                      alt="SAPT Markets Heritage"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-2xl shadow-2xl object-cover"
                />
              ) : (
                    <Image
                      src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
                      alt="SAPT Markets Heritage"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-2xl shadow-2xl object-cover"
                    />
                  )}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-600 rounded-full opacity-20"></div>
              </div>
            </div>
          </SectionBox>
      </section>
      )}

      {/* Team Section */}
      {storeCustomizationSetting?.about_us?.team_title && (
        <section className="">
          <div className="w-full px-4 sm:px-6 lg:px-8">

            {/* Optional short description placed above card container */}
            {hasContent(storeCustomizationSetting?.about_us?.team_description) && (
              <p className="text-center text-lg text-gray-600 mb-8 max-w-3xl mx-auto font-noor">
                {showingTranslateValue(storeCustomizationSetting?.about_us?.team_description)}
              </p>
            )}

            <SectionBox>
              {/* Main heading */}
              <h2 className={`text-3xl md:text-4xl font-bold text-emerald-800 mb-8 font-noor ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {showingTranslateValue(storeCustomizationSetting?.about_us?.team_title) || "Meet the SAPT Family"}
            </h2>

              {/* Leadership tagline (extra text) */}
              {hasContent(storeCustomizationSetting?.about_us?.leadership_title) && (
                <h3 className={`text-xl md:text-2xl font-semibold text-emerald-600 mb-10 font-noor ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.leadership_title)}
                </h3>
              )}

              {/* Debug and Refresh Section */}
              <div className="mt-4 flex justify-center items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-noor"
                >
                  {lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
                </button>
                <div className="text-sm text-gray-500 font-noor">
                  {lang === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date().toLocaleTimeString()}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {(() => {
                  // Debug the filtering process
                  const allIndexes = [...Array(12)].map((_, idx) => idx + 1);
                  console.log("🔍 Filtering team members:", {
                    allIndexes,
                    totalToCheck: allIndexes.length
                  });
                  
                  const filteredIndexes = allIndexes.filter((index) => {
                    const indexWord = index === 1 ? "one" : index === 2 ? "two" : index === 3 ? "three" : index === 4 ? "four" : index === 5 ? "five" : index === 6 ? "six" : index === 7 ? "seven" : index === 8 ? "eight" : index === 9 ? "nine" : index === 10 ? "ten" : index === 11 ? "eleven" : "twelve";
                    const fieldName = `founder_${indexWord}_name`;
                    const fieldValue = storeCustomizationSetting?.about_us?.[fieldName];
                    const hasContentResult = hasContent(fieldValue);
                    
                    console.log(`🔍 Team Member ${index} (${indexWord}):`, {
                      fieldName,
                      fieldValue,
                      hasContentResult,
                      rawValue: fieldValue,
                      translatedValue: showingTranslateValue(fieldValue),
                      fieldType: typeof fieldValue,
                      isNull: fieldValue === null,
                      isUndefined: fieldValue === undefined,
                      isEmptyString: fieldValue === "",
                      hasLength: fieldValue ? fieldValue.length : 'N/A'
                    });
                    
                    return hasContentResult;
                  });
                  
                  console.log("🔍 Final filtered indexes:", filteredIndexes);
                  
                  return filteredIndexes.map((index) => {
                    const founderNumber = index === 1 ? 'one' : index === 2 ? 'two' : index === 3 ? 'three' : index === 4 ? 'four' : index === 5 ? 'five' : index === 6 ? 'six' : index === 7 ? 'seven' : index === 8 ? 'eight' : index === 9 ? 'nine' : index === 10 ? 'ten' : index === 11 ? 'eleven' : 'twelve';
                    
                    const founderName = storeCustomizationSetting?.about_us?.[`founder_${founderNumber}_name`];
                    const founderPosition = storeCustomizationSetting?.about_us?.[`founder_${founderNumber}_position`];
                    const founderImg = storeCustomizationSetting?.about_us?.[`founder_${founderNumber}_img`];
                    
                    return (
                      <div key={index} className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-emerald-300 hover:scale-105">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {founderImg ? (
                            <Image
                              src={founderImg}
                              alt={`Team member ${index}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            loading ? (
                              <CMSkeleton count={1} height={30} loading={loading} />
                            ) : (
                              `T${index}`
                            )
                          )}
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-emerald-800 mb-1 font-noor">
                          {loading ? (
                            <CMSkeleton count={1} height={25} loading={loading} />
                          ) : (
                            showingTranslateValue(founderName) || `Team Member ${index}`
                          )}
                        </h3>
                        <div className="text-emerald-600 font-semibold text-xs md:text-sm font-noor">
                          {loading ? (
                            <CMSkeleton count={1} height={20} loading={loading} />
                          ) : (
                            showingTranslateValue(founderPosition) || "Team Role"
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
          </div>
            </SectionBox>
        </div>
      </section>
      )}

      {/* Values Section */}
      {storeCustomizationSetting?.about_us?.values_title && (
        <section className="">
          <div className="w-full px-4 sm:px-6 lg:px-8">
          <SectionBox>
            <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-emerald-800 mb-6 font-noor">
                {showingTranslateValue(storeCustomizationSetting?.about_us?.values_title) || "Our Core Values"}
            </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-noor">
                {showingTranslateValue(storeCustomizationSetting?.about_us?.values_description) || 
                  "These fundamental principles guide every decision we make and every interaction we have with our customers and community."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-emerald-50 p-8 rounded-xl shadow-lg hover:shadow-2xl text-center border border-emerald-200 hover:border-emerald-400 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.value_one_title) || "Quality First"}
                </h3>
                <p className="text-gray-600 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.value_one_description) || 
                    "We never compromise on the quality of our products, ensuring every item meets our high standards."}
                </p>
              </div>

              <div className="bg-emerald-50 p-8 rounded-xl shadow-lg hover:shadow-2xl text-center border border-emerald-200 hover:border-emerald-400 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-2xl">❤️</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.value_two_title) || "Customer Care"}
                </h3>
                <p className="text-gray-600 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.value_two_description) || 
                    "Every customer is valued and deserves exceptional service, respect, and attention to their needs."}
                </p>
              </div>
              
              <div className="bg-emerald-50 p-8 rounded-xl shadow-lg hover:shadow-2xl text-center border border-emerald-200 hover:border-emerald-400 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.value_three_title) || "Community Focus"}
                </h3>
                <p className="text-gray-600 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.value_three_description) || 
                    "We're not just a store; we're part of the Qassim community, supporting local families and traditions."}
            </p>
          </div>
          
              <div className="bg-emerald-50 p-8 rounded-xl shadow-lg hover:shadow-2xl text-center border border-emerald-200 hover:border-emerald-400 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-4 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.value_four_title) || "Innovation"}
                </h3>
                <p className="text-gray-600 font-noor">
                  {showingTranslateValue(storeCustomizationSetting?.about_us?.value_four_description) || 
                    "We continuously evolve to meet changing customer needs and embrace new technologies."}
                </p>
              </div>
            </div>
          </div>
        </SectionBox>
        </div>
      </section>
      )}

      {/* Branches Section */}
      {storeCustomizationSetting?.about_us?.branches_status !== false && hasContent(storeCustomizationSetting?.about_us?.branches_title) && (
        <section className="">
          <div className="w-full px-4 sm:px-6 lg:px-8">
          <SectionBox>
          <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-emerald-800 mb-6 font-noor">
                {showingTranslateValue(storeCustomizationSetting?.about_us?.branches_title) || "Our Locations"}
            </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-noor">
                {showingTranslateValue(storeCustomizationSetting?.about_us?.branches_description) || 
                  "Visit any of our convenient locations throughout Buraidah. Each store is designed to provide you with a comfortable and efficient shopping experience."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10 mb-16">
            {(() => {
              const branchWords = [
                "one",
                "two",
                "three",
                "four",
                "five",
                "six",
                "seven",
                "eight",
              ];

              return branchWords
                .map((word, idx) => ({ word, idx }))
                .filter(({ word }) => hasContent(storeCustomizationSetting?.about_us?.[`branch_${word}_name`]))
                .map(({ word, idx }) => {
                  const name = showingTranslateValue(
                    storeCustomizationSetting?.about_us?.[`branch_${word}_name`]
                  );

                  const subtitle = showingTranslateValue(
                    storeCustomizationSetting?.about_us?.[`branch_${word}_subtitle`]
                  );

                  const address = showingTranslateValue(
                    storeCustomizationSetting?.about_us?.[`branch_${word}_address`]
                  );

                  const hours = showingTranslateValue(
                    storeCustomizationSetting?.about_us?.[`branch_${word}_hours`]
                  );

                  const phone = showingTranslateValue(
                    storeCustomizationSetting?.about_us?.[`branch_${word}_phone`]
                  );

                  const servicesRaw = showingTranslateValue(
                    storeCustomizationSetting?.about_us?.[`branch_${word}_services`]
                  );
                  const services = servicesRaw
                    ? servicesRaw.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
                    : [];

                  const featured =
                    storeCustomizationSetting?.about_us?.[`branch_${word}_featured`];

                  const directions = showingTranslateValue(
                    storeCustomizationSetting?.about_us?.[`branch_${word}_directions`]
                  );

                  // Choose icon based on subtitle keyword
                  let BranchIcon = OfficeBuildingIcon;
                  if ((subtitle || "").toLowerCase().includes("express")) {
                    BranchIcon = ShoppingCartIcon;
                  }

                  return (
                    <div
                      key={idx}
                      className="relative bg-emerald-50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-emerald-100"
                    >
                      {/* Featured star */}
                      {featured && (
                        <StarIcon className="w-6 h-6 text-yellow-400 absolute top-4 right-4" />
                      )}

                      {/* Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <BranchIcon className="w-10 h-10 text-emerald-500 flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-bold text-emerald-800 font-noor">
                            {name}
                </h3>
                          {subtitle && (
                            <span className="text-sm font-medium text-emerald-600 font-noor">
                              {subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Address & Hours */}
                      <div className="space-y-2 text-sm mb-4">
                        {address && (
                          <p className="flex items-center text-emerald-800 font-medium font-noor">
                            <LocationMarkerIcon className="w-4 h-4 mr-1" /> {address}
                          </p>
                        )}
                        {hours && (
                          <p className="flex items-center text-emerald-600 font-noor">
                            <ClockIcon className="w-4 h-4 mr-1" /> {hours}
                          </p>
                        )}
                        {phone && (
                          <p className="text-gray-600 font-noor">📞 {phone}</p>
                        )}
                      </div>

                      {/* Services */}
                      {services.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-emerald-800 text-sm mb-1 font-noor">
                            Available Services:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {services.map((svc, i) => (
                              <span
                                key={i}
                                className="bg-white border border-emerald-200 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-noor"
                              >
                                {svc}
                              </span>
                            ))}
                  </div>
                </div>
                      )}

                      {/* Directions button */}
                      {directions && (
                        <a
                          href={directions}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-2 rounded-lg font-semibold hover:shadow-md hover:scale-[1.02] transition-transform font-noor"
                        >
                          {lang === 'ar' ? 'عرض الاتجاهات' : 'View Directions'}
                        </a>
                      )}
              </div>
                  );
                });
            })()}
          </div>
          
          {hasContent(storeCustomizationSetting?.about_us?.branches_cta_title) && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-2xl text-center border">
            <h3 className="text-2xl font-bold text-emerald-800 mb-4 font-noor">
              {loading ? (
                <CMSkeleton count={1} height={30} loading={loading} />
              ) : (
                showingTranslateValue(storeCustomizationSetting?.about_us?.branches_cta_title) || "Can't Find Us?"
              )}
            </h3>
            <p className="text-lg text-gray-600 mb-8 font-noor">
              {loading ? (
                <CMSkeleton count={1} height={22} loading={loading} />
              ) : (
                showingTranslateValue(storeCustomizationSetting?.about_us?.branches_cta_description) || "We're expanding! New locations opening soon."
              )}
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-10 py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all font-noor">
              {lang === 'ar' ? 'احصل على الاتجاهات' : 'Get Directions'}
            </button>
          </div>
          )}
          </SectionBox>
        </div>
      </section>
      )}

      {/* Upcoming Branches Section */}
      {storeCustomizationSetting?.about_us?.branches_status !== false && hasContent(storeCustomizationSetting?.about_us?.upcoming_branches_title) && (
        <section className="">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-emerald-800 mb-4 font-noor">
                {showingTranslateValue(storeCustomizationSetting?.about_us?.upcoming_branches_title)}
              </h2>
              <SectionBox className="bg-amber-50/50 shadow-none border border-dashed border-emerald-200">
                {(() => {
                  let list = [];
                  if (Array.isArray(storeCustomizationSetting?.about_us?.upcoming_branches) && storeCustomizationSetting.about_us.upcoming_branches.length > 0) {
                    list = storeCustomizationSetting.about_us.upcoming_branches.filter((br) => hasContent(br?.name));
                  } else {
                    const words = ['one', 'two'];
                    list = words
                      .filter((w) => hasContent(storeCustomizationSetting?.about_us?.[`upcoming_branch_${w}_name`]))
                      .map((w) => ({
                        name: storeCustomizationSetting?.about_us?.[`upcoming_branch_${w}_name`],
                        address: storeCustomizationSetting?.about_us?.[`upcoming_branch_${w}_address`],
                        quarter: storeCustomizationSetting?.about_us?.[`upcoming_branch_${w}_quarter`],
                        features: storeCustomizationSetting?.about_us?.[`upcoming_branch_${w}_features`],
                        emoji: storeCustomizationSetting?.about_us?.[`upcoming_branch_${w}_emoji`],
                      }));
                  }
                  return list.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-10">
                      {list.map((br, idx) => {
                        const name = showingTranslateValue(br.name);
                        const address = showingTranslateValue(br.address);
                        const quarter = showingTranslateValue(br.quarter);
                        const featuresRaw = showingTranslateValue(br.features);
                        const features = featuresRaw ? featuresRaw.split(/[,،]/).map(f=>f.trim()).filter(Boolean) : [];
                        const emoji = showingTranslateValue(br.emoji) || "✨";

                        return (
                          <div key={idx} className="relative bg-amber-50/60 border border-amber-100 p-8 rounded-2xl shadow hover:shadow-lg transition-all">
                            {/* Quarter badge */}
                            {quarter && (
                              <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full font-noor">
                                {quarter}
                              </span>
                            )}

                            {/* Header */}
                            <div className="flex items-start space-x-4 mb-4">
                              <span className="text-4xl">{emoji}</span>
                              <div>
                                <h3 className="text-xl font-bold text-amber-900 font-noor">{name}</h3>
                                <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded mt-1 font-noor">
                                  {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
                                </span>
                              </div>
                            </div>

                            {/* Address */}
                            {address && (
                              <p className="flex items-center text-amber-900 font-medium mb-4 text-sm font-noor">
                                <LocationMarkerIcon className="w-4 h-4 mr-1" /> {address}
                              </p>
                            )}

                            {/* Planned features */}
                            {features.length > 0 && (
                              <div className="mb-6">
                                <h4 className="font-semibold text-amber-900 text-sm mb-2 font-noor">
                                  {lang === 'ar' ? 'الميزات المخططة:' : 'Planned Features:'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {features.map((ft,i)=>(
                                    <span key={i} className="bg-white border border-amber-300 text-amber-700 text-xs px-2 py-0.5 rounded-full font-noor">{ft}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button className="block w-full text-center border border-amber-300 text-amber-700 py-2 rounded-lg font-semibold hover:bg-amber-100 transition-colors text-sm font-noor">
                              {lang === 'ar' ? 'احصل على إشعار' : 'Get Notified'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null;
                })()}
              </SectionBox>
            </div>
          </div>
        </section>
      )}
    </div> {/* End main page container */}
    </Layout>
  );
};

export default AboutUs; 