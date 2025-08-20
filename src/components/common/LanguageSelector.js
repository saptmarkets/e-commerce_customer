import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const LanguageSelector = ({ iconOnly = false }) => {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // Language configurations with native script names
  const languages = [
    { code: 'en', nativeName: 'English', otherName: 'عربي' },
    { code: 'ar', nativeName: 'عربي', otherName: 'English' }
  ];
  
  // Set the initial language based on the router locale or cookie
  useEffect(() => {
    // Clear any German or other language cookies
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      if (cookieName.includes('lang') || cookieName.includes('locale')) {
        const cookieValue = allCookies[cookieName];
        try {
          const parsedValue = JSON.parse(cookieValue);
          if (parsedValue && parsedValue.code && !['en', 'ar'].includes(parsedValue.code)) {
            Cookies.remove(cookieName);
          }
        } catch (e) {
          // If it's not JSON, check if it's a string value
          if (typeof cookieValue === 'string' && !['en', 'ar'].includes(cookieValue)) {
            Cookies.remove(cookieName);
          }
        }
      }
    });

    const storedLocale = Cookies.get('NEXT_LOCALE');
    const currentLocale = router.locale || storedLocale || 'en';
    
    // Ensure only English or Arabic is used
    const validLocale = ['en', 'ar'].includes(currentLocale) ? currentLocale : 'en';
    
    // Set the correct cookies
    Cookies.set('NEXT_LOCALE', validLocale, { expires: 365 });
    Cookies.set('_lang', validLocale, { expires: 365 });
    Cookies.set('_curr_lang', JSON.stringify(languages.find(lang => lang.code === validLocale) || languages[0]), { expires: 365 });
    
    setSelectedLanguage(validLocale);
  }, [router.locale]);

  // Find current language and other language
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];
  const otherLanguage = languages.find(lang => lang.code !== selectedLanguage) || languages[1];
  
  const handleLanguageChange = (lang) => {
    // Set cookies for Next.js locale and custom language handling
    Cookies.set('NEXT_LOCALE', lang.code, { expires: 365 });
    Cookies.set('_lang', lang.code, { expires: 365 });
    Cookies.set('_curr_lang', JSON.stringify(lang), { expires: 365 });
    
    // Update the selected language
    setSelectedLanguage(lang.code);
    
    // Reload the page with the new language
    router.push(router.asPath, router.asPath, { locale: lang.code });
  };

  // For iconOnly mode, directly toggle between languages
  const handleIconClick = () => {
    // Always directly switch languages (both mobile and desktop)
    handleLanguageChange(otherLanguage);
  };
  
  return (
    <div className="relative">
      <button 
        className="flex items-center justify-center text-gray-600 hover:text-purple-600 focus:outline-none transition-all duration-200 p-1.5 text-gray-600 hover:text-purple-600 transition-all duration-200 rounded-xl hover:bg-gray-50 group touch-target flex items-center justify-center"
        onClick={handleIconClick}
      >
        {/* Always show the other language name */}
        <span className="font-medium text-xs">
          {otherLanguage.nativeName}
        </span>
      </button>
      
      {/* The dropdown div is removed as per the edit hint */}
    </div>
  );
};

export default LanguageSelector; 