import React, { useMemo } from "react";
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

  // Helper to test if a translation field actually contains visible text
  const hasContent = (field) => {
    if (!field) return false;
    
    // Handle new object structure with language keys
    if (typeof field === 'object') {
      // Check if any language has content
      const hasEnglish = field.en && typeof field.en === 'string' && field.en.trim().length > 0;
      const hasArabic = field.ar && typeof field.ar === 'string' && field.ar.trim().length > 0;
      return hasEnglish || hasArabic;
    }
    
    // Handle old string structure for backward compatibility
    if (typeof field === 'string') {
    return field.trim().length > 0;
    }
    
    return false;
  };

  // Derive brand color (fallback to emerald brand)
  const brandColor = useMemo(() => {
    return (
      storeCustomizationSetting?.brand_color ||
      storeCustomizationSetting?.settings?.brand_color ||
      "#059669"
    );
  }, [storeCustomizationSetting]);

  // Safety check: Don't render if we don't have real data
  if (!storeCustomizationSetting || !storeCustomizationSetting.about_us) {
    return (
      <Layout title="About Us" description="This is about us page">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            {loading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-gray-600">Loading About Us content...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-800">No Content Available</h1>
                <p className="text-gray-600">The About Us content is not loaded. Please refresh the page.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

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
              <p className="text-lg lg:text-2xl opacity-90 max-w-3xl mx-auto">
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
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
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
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                        {pill}
                      </span>
                    )}
                    {text && (
                      <span className="text-sm text-gray-600 font-medium">
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
                    <p className="text-lg font-semibold text-emerald-800">Fresh Local Produce</p>
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
                <div className="space-y-6 text-gray-700 leading-relaxed">
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
              <p className="text-center text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
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


              


              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {(() => {
                  const allIndexes = [...Array(12)].map((_, idx) => idx + 1);
                  
                  const filteredIndexes = allIndexes.filter((index) => {
                    const indexWord = index === 1 ? "one" : index === 2 ? "two" : index === 3 ? "three" : index === 4 ? "four" : index === 5 ? "five" : index === 6 ? "six" : index === 7 ? "seven" : index === 8 ? "eight" : index === 9 ? "nine" : index === 10 ? "ten" : index === 11 ? "eleven" : "twelve";
                    const fieldName = `founder_${indexWord}_name`;
                    const fieldValue = storeCustomizationSetting?.about_us?.[fieldName];
                    
                    const hasRealContent = hasContent(fieldValue) && 
                      showingTranslateValue(fieldValue) && 
                      showingTranslateValue(fieldValue).trim().length > 0;
                    
                    return hasRealContent;
                  });
                  
                  // If no team members have data, show a message
                  if (filteredIndexes.length === 0) {
                    return (
                      <div className="col-span-full text-center py-12">
                        <div className="text-gray-500">
                          <div className="text-6xl mb-4">👥</div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {lang === 'ar' ? 'لا يوجد أعضاء فريق حالياً' : 'No Team Members Available'}
                          </h3>
                          <p className="text-gray-600">
                            {lang === 'ar' ? 'سيتم إضافة معلومات الفريق قريباً' : 'Team information will be added soon'}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
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
                              // Show first letter of name if available, otherwise show a generic icon
                              founderName && showingTranslateValue(founderName) ? 
                                showingTranslateValue(founderName).charAt(0).toUpperCase() : 
                                "👤"
                            )
                          )}
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-emerald-800 mb-1 font-noor">
                          {loading ? (
                            <CMSkeleton count={1} height={25} loading={loading} />
                          ) : (
                            showingTranslateValue(founderName)
                          )}
                        </h3>
                        <div className="text-emerald-600 font-semibold text-xs md:text-sm">
                          {loading ? (
                            <CMSkeleton count={1} height={20} loading={loading} />
                          ) : (
                            showingTranslateValue(founderPosition)
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
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {showingTranslateValue(storeCustomizationSetting?.about_us?.values_description) || 
                  "These fundamental principles guide every decision we make and every interaction we have with our customers and community."}
              </p>
              

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(() => {
                const values = [
                  {
                    icon: "🎯",
                    title: storeCustomizationSetting?.about_us?.value_one_title,
                    description: storeCustomizationSetting?.about_us?.value_one_description
                  },
                  {
                    icon: "❤️",
                    title: storeCustomizationSetting?.about_us?.value_two_title,
                    description: storeCustomizationSetting?.about_us?.value_two_description
                  },
                  {
                    icon: "🤝",
                    title: storeCustomizationSetting?.about_us?.value_three_title,
                    description: storeCustomizationSetting?.about_us?.value_three_description
                  },
                  {
                    icon: "🚀",
                    title: storeCustomizationSetting?.about_us?.value_four_title,
                    description: storeCustomizationSetting?.about_us?.value_four_description
                  }
                ];

                // Filter out values that don't have real content
                const validValues = values.filter(value => 
                  hasContent(value.title) && 
                  showingTranslateValue(value.title) && 
                  showingTranslateValue(value.title).trim().length > 0
                );

                // If no values have content, show a message
                if (validValues.length === 0) {
                  return (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-500">
                        <div className="text-6xl mb-4">💎</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          {lang === 'ar' ? 'لا توجد قيم أساسية حالياً' : 'No Core Values Available'}
                        </h3>
                        <p className="text-gray-600">
                          {lang === 'ar' ? 'سيتم إضافة القيم الأساسية قريباً' : 'Core values will be added soon'}
                        </p>
                      </div>
                    </div>
                  );
                }

                return validValues.map((value, index) => (
                  <div key={index} className="bg-emerald-50 p-8 rounded-xl shadow-lg hover:shadow-2xl text-center border border-emerald-200 hover:border-emerald-400 hover:scale-105 transition-all duration-300">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                      <span className="text-2xl">{value.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-800 mb-4 font-noor">
                      {showingTranslateValue(value.title)}
                    </h3>
                    <p className="text-gray-600">
                      {showingTranslateValue(value.description)}
                    </p>
                  </div>
                ));
              })()}
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
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                            <span className="text-sm font-medium text-emerald-600">
                              {subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Address & Hours */}
                      <div className="space-y-2 text-sm mb-4">
                        {address && (
                          <p className="flex items-center text-emerald-800 font-medium">
                            <LocationMarkerIcon className="w-4 h-4 mr-1" /> {address}
                          </p>
                        )}
                        {hours && (
                          <p className="flex items-center text-emerald-600">
                            <ClockIcon className="w-4 h-4 mr-1" /> {hours}
                          </p>
                        )}
                        {phone && (
                          <p className="text-gray-600">📞 {phone}</p>
                        )}
                      </div>

                      {/* Services */}
                      {services.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-emerald-800 text-sm mb-1">
                            Available Services:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {services.map((svc, i) => (
                              <span
                                key={i}
                                className="bg-white border border-emerald-200 text-emerald-700 text-xs px-2 py-0.5 rounded-full"
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
                          className="block w-full text-center bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-2 rounded-lg font-semibold hover:shadow-md hover:scale-[1.02] transition-transform"
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
            <p className="text-lg text-gray-600 mb-8">
              {loading ? (
                <CMSkeleton count={1} height={22} loading={loading} />
              ) : (
                showingTranslateValue(storeCustomizationSetting?.about_us?.branches_cta_description) || "We're expanding! New locations opening soon."
              )}
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-10 py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all">
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
                              <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {quarter}
                              </span>
                            )}

                            {/* Header */}
                            <div className="flex items-start space-x-4 mb-4">
                              <span className="text-4xl">{emoji}</span>
                              <div>
                                <h3 className="text-xl font-bold text-amber-900 font-noor">{name}</h3>
                                <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded mt-1">
                                  {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
                                </span>
                              </div>
                            </div>

                            {/* Address */}
                            {address && (
                              <p className="flex items-center text-amber-900 font-medium mb-4 text-sm">
                                <LocationMarkerIcon className="w-4 h-4 mr-1" /> {address}
                              </p>
                            )}

                            {/* Planned features */}
                            {features.length > 0 && (
                              <div className="mb-6">
                                <h4 className="font-semibold text-amber-900 text-sm mb-2">
                                  {lang === 'ar' ? 'الميزات المخططة:' : 'Planned Features:'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {features.map((ft,i)=>(
                                    <span key={i} className="bg-white border border-amber-300 text-amber-700 text-xs px-2 py-0.5 rounded-full">{ft}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button className="block w-full text-center border border-amber-300 text-amber-700 py-2 rounded-lg font-semibold hover:bg-amber-100 transition-colors text-sm">
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