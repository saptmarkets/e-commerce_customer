import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IoReturnUpBackOutline,
  IoArrowForward,
  IoBagHandle,
  IoWalletSharp,
} from "react-icons/io5";
import { FiStar, FiInfo } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { ImCreditCard } from "react-icons/im";
import useTranslation from "next-translate/useTranslation";

//internal import

import Layout from "@layout/Layout";
import Label from "@components/form/Label";
import Error from "@components/form/Error";
import CartItem from "@components/cart/CartItem";
import InputArea from "@components/form/InputArea";
import useGetSetting from "@hooks/useGetSetting";
import InputShipping from "@components/form/InputShipping";
import InputPayment from "@components/form/InputPayment";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";
import SettingServices from "@services/SettingServices";
import LoyaltyServices from "@services/LoyaltyServices";
import SwitchToggle from "@components/form/SwitchToggle";
import { getUserSession } from "@lib/auth";
import LocationService from "@components/location/LocationService";
import useLocation from "@hooks/useLocation";
import DistanceBasedShippingCalculator from "@components/shipping/DistanceBasedShippingCalculator";
import DistanceService from "@services/DistanceService";
import useCheckoutRestore from "@hooks/useCheckoutRestore";

// Helper to parse coordinates from strings like "26.417822, 43.900033" or text containing numbers
const parseCoordinatesFromText = (text) => {
  if (!text) return null;
  try {
    const matches = String(text).match(/-?\d+(?:\.\d+)?/g);
    if (!matches || matches.length < 2) return null;
    const latitude = parseFloat(matches[0]);
    const longitude = parseFloat(matches[1]);
    if (DistanceService.validateCoordinates(latitude, longitude)) {
      return { latitude, longitude };
    }
    return null;
  } catch {
    return null;
  }
};

const Checkout = () => {
  const { t } = useTranslation();
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, tr, lang, currency } = useUtilsFunction();

  // Helper to render price with correct currency placement
  const formatPrice = (amount) => {
    const value = (amount || 0).toFixed(2);
    const displayCurrency = lang === 'ar' ? 'ريال' : currency;

    if (lang === 'ar') {
      return (
        <span className="whitespace-nowrap text-lg">
          {value}&nbsp;{displayCurrency}
        </span>
      );
    }

    return (
      <span className="whitespace-nowrap text-lg">
        {displayCurrency}&nbsp;{value}
      </span>
    );
  };
  const userInfo = getUserSession();
  
  // Location hook for getting user coordinates
  const { 
    location: hookLocation, 
    address: detectedAddress, 
    loading: locationLoading, 
    getLocationWithAddress,
    setLocation: setHookLocation,
    reverseGeocode
  } = useLocation();

  // Restore checkout data will be initialized after hooks are ready
  
  // Local location state for shipping calculator
  const [userLocation, setUserLocation] = useState(null);
  
  // Manual location address data state
  const [manualLocationData, setManualLocationData] = useState(null);
  
  // Shipping calculation state
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [calculationStatus, setCalculationStatus] = useState('');
  
  // GPS location data state (separate from userLocation for shipping)
  const [gpsLocationData, setGpsLocationData] = useState(null);
  const [manualLocationCoords, setManualLocationCoords] = useState(null);
  
  // Loyalty points state
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [maxRedeemablePoints, setMaxRedeemablePoints] = useState(0);
  
  // Location selection state
  const [selectedLocationOption, setSelectedLocationOption] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');

  const { data: storeSetting } = useQuery({
    queryKey: ["storeSetting"],
    queryFn: async () => await SettingServices.getStoreSetting(),
    staleTime: 4 * 60 * 1000, // Api request after 4 minutes
  });

  // Fetch loyalty points
  const { data: loyaltySummary } = useQuery({
    queryKey: ["loyaltySummary"],
    queryFn: async () => {
      if (!userInfo?.id) return null;
      return await LoyaltyServices.getLoyaltySummary();
    },
    enabled: !!userInfo?.id,
    staleTime: 2 * 60 * 1000,
  });

  const {
    error,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    register,
    setValue,
    errors,
    showCard,
    setShowCard,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    handleDefaultShippingAddress,
    // Add loyalty functions
    handleLoyaltyPointsRedemption,
    loyaltyDiscountAmount,
    setLoyaltyDiscountAmount,
  } = useCheckoutSubmit(storeSetting, loyaltySummary);

  // Now restore checkout data (requires setValue and state setters to exist)
  useCheckoutRestore(setValue, setUserLocation, setManualLocationData, setGpsLocationData);

  // Set loyalty points when data is available
  useEffect(() => {
    if (loyaltySummary?.customer?.loyaltyPoints?.current) {
      setLoyaltyPoints(loyaltySummary.customer.loyaltyPoints.current);
      // Calculate max redeemable points (up to 50% of order total)
      const maxPoints = Math.min(
        loyaltySummary.customer.loyaltyPoints.current,
        Math.floor((cartTotal + shippingCost) * 0.5 / 0.01) // 50% of total, considering 1 point = 0.01 SAR
      );
      setMaxRedeemablePoints(maxPoints);
    }
  }, [loyaltySummary, cartTotal, shippingCost]);

  // Clear location data and calculation status when switching between location methods
  useEffect(() => {
    // Clear previous calculation results
    setCalculationStatus('');
    setIsCalculatingShipping(false);
    
    // Clear location data based on what's NOT selected
    if (selectedLocationOption !== 'gps') {
      setGpsLocationData(null);
    }
    if (selectedLocationOption !== 'manual') {
      setManualLocationCoords(null);
      setManualLocationData(null);
    }
    
    // Reset userLocation for shipping calculator
    setUserLocation(null);
    

  }, [selectedLocationOption]);

 

  // Handle loyalty points input change
  const handlePointsChange = (e) => {
    const points = parseInt(e.target.value) || 0;
    const maxPoints = Math.min(maxRedeemablePoints, loyaltyPoints);
    
    if (points <= maxPoints) {
      setPointsToRedeem(points);
      const discount = points * 0.01; // 1 point = 0.01 SAR
      // Call the hook function to update the discount amount
      if (handleLoyaltyPointsRedemption) {
        handleLoyaltyPointsRedemption(discount);
      }
    }
  };

  // Apply maximum points
  const applyMaxPoints = () => {
    const maxPoints = Math.min(maxRedeemablePoints, loyaltyPoints);
    setPointsToRedeem(maxPoints);
    const discount = maxPoints * 0.01;
    // Call the hook function to update the discount amount
    if (handleLoyaltyPointsRedemption) {
      handleLoyaltyPointsRedemption(discount);
    }
  };

  // Reverse geocoding function for manual coordinates
  const reverseGeocodeManualCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SaptMarkets-App'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const addressComponents = extractAddressComponents(data);
        const formattedAddress = formatAddress(data);
        
        return {
          formattedAddress,
          addressComponents,
          googleMapsLink: `https://maps.google.com?q=${lat},${lng}`,
          rawData: data
        };
      } else {
        throw new Error('Geocoding API request failed');
      }
    } catch (error) {
      return null;
    }
  };

  // Format address from Nominatim response
  const formatAddress = (data) => {
    const addr = data.address || {};
    const parts = [];
    
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);
    if (addr.neighbourhood) parts.push(addr.neighbourhood);
    if (addr.city || addr.town || addr.village) {
      parts.push(addr.city || addr.town || addr.village);
    }
    if (addr.country) parts.push(addr.country);
    
    return parts.join(', ') || data.display_name || 'Unknown location';
  };

  // Extract specific address components for form fields
  const extractAddressComponents = (data) => {
    const addr = data.address || {};
    
    return {
      houseNumber: addr.house_number || '',
      street: addr.road || '',
      neighbourhood: addr.neighbourhood || addr.suburb || '',
      city: addr.city || addr.town || addr.village || '',
      state: addr.state || '',
      country: addr.country || 'Saudi Arabia',
      postcode: addr.postcode || '',
      // Create detailed street address
      streetAddress: [
        addr.house_number,
        addr.road,
        addr.neighbourhood || addr.suburb
      ].filter(Boolean).join(', ') || addr.road || 'Address not found',
    };
  };

  // Fill checkout form fields with manual location data
  const fillFormWithManualLocation = () => {
    if (!manualLocationData || !setValue) return;
    
    const components = manualLocationData.addressComponents;
    
    // Fill street address
    setValue('address', components.streetAddress, { 
      shouldValidate: true, 
      shouldDirty: true, 
      shouldTouch: true 
    });
    
    // Fill city
    setValue('city', components.city, { 
      shouldValidate: true, 
      shouldDirty: true, 
      shouldTouch: true 
    });
    
    // Fill country
    setValue('country', components.country, { 
      shouldValidate: true, 
      shouldDirty: true, 
      shouldTouch: true 
    });
    
    // Fill zip code if available
    if (components.postcode) {
      setValue('zipCode', components.postcode, { 
        shouldValidate: true, 
        shouldDirty: true, 
        shouldTouch: true 
      });
    }
    
    alert('✅ Address fields filled successfully! Please review and modify if needed.');
  };

  // Manual shipping calculation based on selected location type
  const calculateShippingCost = () => {
    setIsCalculatingShipping(true);
    setCalculationStatus('Checking selected location and calculating...');
    
    let locationToUse = null;
    let locationSource = '';
    
    // Check which location method is selected and get coordinates
    switch (selectedLocationOption) {
      case 'profile':
        // Check multiple possible coordinate fields in user profile; fallback to parsing from address text
        const profileLatRaw = userInfo?.latitude || userInfo?.lat || userInfo?.coords?.latitude;
        const profileLngRaw = userInfo?.longitude || userInfo?.lng || userInfo?.coords?.longitude;
        let finalProfileLat = profileLatRaw ? parseFloat(profileLatRaw) : null;
        let finalProfileLng = profileLngRaw ? parseFloat(profileLngRaw) : null;

        if ((!finalProfileLat || !finalProfileLng) && userInfo?.address) {
          const parsed = parseCoordinatesFromText(userInfo.address);
          if (parsed) {
            finalProfileLat = parsed.latitude;
            finalProfileLng = parsed.longitude;
          }
        }
        
        if (finalProfileLat && finalProfileLng) {
          locationToUse = {
            latitude: finalProfileLat,
            longitude: finalProfileLng,
            accuracy: 100
          };
          locationSource = 'Saved Address';

          // Populate global address info for UI consistency (street, links)
          (async () => {
            try {
              const addr = await reverseGeocode(finalProfileLat, finalProfileLng);
              window.userLocationCoords = {
                latitude: finalProfileLat,
                longitude: finalProfileLng,
                accuracy: 100,
                googleMapsLink: `https://www.google.com/maps?q=${finalProfileLat},${finalProfileLng}`,
                googleMapsAddressLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr?.formattedAddress || userInfo?.address || '')}`,
                address: addr?.formattedAddress || userInfo?.address || '',
                addressComponents: addr?.components || {}
              };
            } catch {}
          })();
        } else {
          setIsCalculatingShipping(false);
          setCalculationStatus('❌ No coordinates found in saved address. Please update your profile with location details or use GPS/Manual entry.');
          return;
        }
        break;
        
      case 'gps':
        if (gpsLocationData?.latitude && gpsLocationData?.longitude) {
          locationToUse = {
            latitude: gpsLocationData.latitude,
            longitude: gpsLocationData.longitude,
            accuracy: gpsLocationData.accuracy || 10
          };
          locationSource = 'GPS Location';

        } else {
          setIsCalculatingShipping(false);
          setCalculationStatus('❌ GPS location not detected. Please click "Get My Location" first.');
          return;
        }
        break;
        
      case 'manual':
        if (manualLocationCoords?.latitude && manualLocationCoords?.longitude) {
          locationToUse = {
            latitude: manualLocationCoords.latitude,
            longitude: manualLocationCoords.longitude,
            accuracy: 0
          };
          locationSource = 'Manual Coordinates';

        } else {
          setIsCalculatingShipping(false);
          setCalculationStatus('❌ No manual coordinates set. Please enter coordinates and click "Get Location Info" first.');
          return;
        }
        break;
        
      default:
        setIsCalculatingShipping(false);
        setCalculationStatus('❌ Please select a location method first.');
        return;
    }
    
    if (locationToUse) {
      
      // Set the location for shipping calculator
      setUserLocation({
        latitude: locationToUse.latitude,
        longitude: locationToUse.longitude,
        accuracy: locationToUse.accuracy,
        timestamp: Date.now()
      });
      
      // Show completion status after calculation
      setTimeout(() => {
        setIsCalculatingShipping(false);
        setCalculationStatus(`✅ Delivery cost calculated using ${locationSource} (${locationToUse.latitude.toFixed(4)}, ${locationToUse.longitude.toFixed(4)})`);
      }, 2000);
    }
  };

  // Handle location update from LocationService
  const handleLocationUpdate = (locationData) => {
    
    // Automatically select GPS option when location is detected
    setSelectedLocationOption('gps');
    setLocationStatus('GPS location detected and applied');
    
    // Store GPS location data separately
    if (locationData.latitude && locationData.longitude) {
      const gpsLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: Date.now()
      };
      

      setGpsLocationData(gpsLocation);
      
      // Store coordinates globally for order submission
      window.userLocationCoords = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        googleMapsLink: locationData.googleMapsLink,
        googleMapsAddressLink: locationData.googleMapsAddressLink,
        address: locationData.address,
        addressComponents: locationData.addressComponents
      };
      
      // Also update the hook location if the function exists
      if (setHookLocation) {
        setHookLocation(gpsLocation);
      }
    }
    
    // Auto-fill address fields with detailed components
    if (locationData.addressComponents && setValue) {
      const components = locationData.addressComponents;
      
      // Fill street address with house number + street + neighbourhood
      if (components.streetAddress) {
        setValue('address', components.streetAddress, { 
          shouldValidate: true, 
          shouldDirty: true, 
          shouldTouch: true 
        });
      } else if (locationData.address) {
        setValue('address', locationData.address, { 
          shouldValidate: true, 
          shouldDirty: true, 
          shouldTouch: true 
        });
      }
      
      // Fill city with exact city name
      if (components.city) {
        setValue('city', components.city, { 
          shouldValidate: true, 
          shouldDirty: true, 
          shouldTouch: true 
        });
      }
      
      // Fill country (default to Saudi Arabia)
      setValue('country', components.country || 'Saudi Arabia', { 
        shouldValidate: true, 
        shouldDirty: true, 
        shouldTouch: true 
      });
      
      // Fill zip code if available
      if (components.postcode) {
        setValue('zipCode', components.postcode, { 
          shouldValidate: true, 
          shouldDirty: true, 
          shouldTouch: true 
        });
      }
      

    }
  };

  // Handle using profile default location
  const handleUseProfileLocation = () => {
    
    if (!userInfo) {
      console.warn('No user info available for profile location');
      return;
    }
    
    // Check if setValue is available
    if (!setValue) {
      console.error('setValue function not available');
      return;
    }
    
    try {
      // Set form values from user profile
      if (userInfo.address) {
        setValue('address', userInfo.address, { 
          shouldValidate: true, 
          shouldDirty: true, 
          shouldTouch: true 
        });
      }
      if (userInfo.city) {
        setValue('city', userInfo.city, { 
          shouldValidate: true, 
          shouldDirty: true, 
          shouldTouch: true 
        });
      }
      if (userInfo.country) {
        setValue('country', userInfo.country, { 
          shouldValidate: true, 
          shouldDirty: true, 
          shouldTouch: true 
        });
      }
      
      // Prefer explicit numeric fields; otherwise parse coordinates from address text
      const explicitLat = userInfo.latitude || userInfo.lat || userInfo.coords?.latitude;
      const explicitLng = userInfo.longitude || userInfo.lng || userInfo.coords?.longitude;
      const parsedFromAddress = !explicitLat || !explicitLng ? parseCoordinatesFromText(userInfo.address) : null;
      const finalLat = explicitLat ? parseFloat(explicitLat) : parsedFromAddress?.latitude;
      const finalLng = explicitLng ? parseFloat(explicitLng) : parsedFromAddress?.longitude;

      if (finalLat && finalLng) {
        const profileLocation = {
          latitude: finalLat,
          longitude: finalLng,
          accuracy: 100, // Assumed accuracy for saved profile location
          timestamp: Date.now()
        };
        
        setUserLocation(profileLocation);
        
        // Reverse geocode to get street/area for display like GPS mode
        (async () => {
          try {
            const addr = await reverseGeocode(profileLocation.latitude, profileLocation.longitude);
            window.userLocationCoords = {
              latitude: profileLocation.latitude,
              longitude: profileLocation.longitude,
              accuracy: profileLocation.accuracy,
              googleMapsLink: `https://www.google.com/maps?q=${profileLocation.latitude},${profileLocation.longitude}`,
              googleMapsAddressLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr?.formattedAddress || userInfo.address || '')}`,
              address: addr?.formattedAddress || userInfo.address,
              addressComponents: addr?.components || { city: userInfo.city, country: userInfo.country || 'Saudi Arabia' }
            };
            setLocationStatus('Saved profile coordinates resolved to address');
          } catch {
        window.userLocationCoords = {
          latitude: profileLocation.latitude,
          longitude: profileLocation.longitude,
          accuracy: profileLocation.accuracy,
          googleMapsLink: `https://www.google.com/maps?q=${profileLocation.latitude},${profileLocation.longitude}`,
          googleMapsAddressLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userInfo.address)}`,
          address: userInfo.address,
          addressComponents: {
            city: userInfo.city,
            country: userInfo.country || 'Saudi Arabia'
          }
        };
          }
        })();;
      }
    } catch (error) {
      console.error('Error applying profile location:', error);
    }
  };

  const handleLocationOptionChange = (option) => {
    setSelectedLocationOption(option);
    
    // Clear other location data when switching options
    if (option === 'manual') {
      setGpsLocationData(null);
      setManualLocationCoords(null);
    } else if (option === 'gps') {
      setManualLocationCoords(null);
    } else if (option === 'profile') {
      setGpsLocationData(null);
      setManualLocationCoords(null);
    }
  };

  return (
    <>
      <Layout title="Checkout" description="this is checkout page">
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
          <div className="py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col md:flex-row lg:flex-row">
            <div className="md:w-full lg:w-3/5 flex h-full flex-col order-2 sm:order-1 lg:order-1">
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit(submitHandler)}>
                  {/* Container 1: Personal Info + Delivery Cost + Address */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  {hasShippingAddress && (
                    <div className="flex justify-end my-2">
                      <SwitchToggle
                        id="shipping-address"
                        title={tr('Use Default Shipping Address', 'استخدم عنوان الشحن الافتراضي')}
                        processOption={useExistingAddress}
                        handleProcess={handleDefaultShippingAddress}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <h2 className="font-semibold font-serif text-base text-gray-700 pb-3">
                      01.{" "}
                      {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.personal_details
                      ) || tr('Personal Details', 'التفاصيل الشخصية')}
                    </h2>

                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.checkout?.first_name
                          ) || tr('First Name', 'الاسم الأول')}
                          name="firstName"
                          type="text"
                          placeholder={tr('John', 'محمد')}
                          required={true}
                        />
                        <Error errorName={errors.firstName} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={`${showingTranslateValue(
                            storeCustomizationSetting?.checkout?.last_name
                          ) || tr('Last Name', 'اسم العائلة')} (${tr('Optional', 'اختياري')})`}
                          name="lastName"
                          type="text"
                          placeholder={tr('Doe', 'أحمد')}
                          required={false}
                        />
                        <Error errorName={errors.lastName} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.checkout?.checkout_phone
                          ) || tr('Phone Number', 'رقم الهاتف')}
                          name="contact"
                          type="tel"
                          placeholder={tr('+966-5xxxxxxxx', '+966-5xxxxxxxx')}
                          defaultValue={userInfo?.phone || ""}
                          required={true}
                        />
                        <Error errorName={errors.contact} />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <InputArea
                          register={register}
                          label={`${showingTranslateValue(
                            storeCustomizationSetting?.checkout?.email_address
                          ) || tr('Email Address', 'عنوان البريد الإلكتروني')} (${tr('Optional', 'اختياري')})`}
                          name="email"
                          type="email"
                          readOnly={false}
                          defaultValue={userInfo?.email || ""}
                          placeholder={tr('youremail@gmail.com', 'البريد الإلكتروني')}
                          required={false}
                        />
                        <Error errorName={errors.email} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mt-12">
                    <h2 className="font-semibold font-serif text-base text-gray-700 pb-3">
                      02.{" "}
                      {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.shipping_details
                      ) || tr('Shipping Details', 'تفاصيل الشحن')}
                    </h2>

                    {/* Horizontal Location Selection System */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        📍 {tr('Choose Your Delivery Location', 'اختر موقع التوصيل الخاص بك')}
                      </h3>
                      
                      {/* Horizontal Selection Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Saved Address Option */}
                        {userInfo?.address && (
                          <button
                            type="button"
                            onClick={() => {
                                  setSelectedLocationOption('profile');
                                  setLocationStatus('Using saved profile address');
                                  handleUseProfileLocation();
                                }}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                              selectedLocationOption === 'profile'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="text-3xl mb-2">🏠</div>
                            <div className="font-semibold text-sm">{tr('Saved Address', 'العنوان المحفوظ')}</div>
                            <div className="text-xs mt-1 opacity-75">{tr('Use my profile location', 'استخدم موقع الملف الشخصي')}</div>
                          </button>
                        )}
                        
                        {/* GPS Location Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocationOption('gps');
                            setLocationStatus('GPS location detection mode');
                          }}
                          className={`p-4 border-2 rounded-lg text-center transition-all ${
                            selectedLocationOption === 'gps'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="text-3xl mb-2">📱</div>
                          <div className="font-semibold text-sm">{tr('Get My Location', 'الحصول على موقعي')}</div>
                          <div className="text-xs mt-1 opacity-75">{tr('Auto-detect GPS', 'تحديد الموقع تلقائياً')}</div>
                        </button>
                        
                        {/* Manual Entry Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocationOption('manual');
                            setLocationStatus('Manual address entry mode');
                          }}
                          className={`p-4 border-2 rounded-lg text-center transition-all ${
                            selectedLocationOption === 'manual'
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="text-3xl mb-2">🗺️</div>
                          <div className="font-semibold text-sm">{tr('Manual Entry', 'إدخال يدوي')}</div>
                          <div className="text-xs mt-1 opacity-75">{tr('Enter coordinates', 'أدخل الإحداثيات')}</div>
                        </button>
                                </div>
                      
                      {/* Dynamic Information Container */}
                      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                        {/* Saved Address Information */}
                        {selectedLocationOption === 'profile' && userInfo?.address && (
                          <div>
                            <div className="flex items-center mb-4">
                              <span className="text-2xl mr-3">🏠</span>
                              <h4 className="text-lg font-semibold text-gray-800">{tr('Your Saved Address', 'عنوانك المحفوظ')}</h4>
                              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">{tr('Active', 'نشط')}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-start">
                                  <span className="text-gray-500 text-sm w-20 mt-1">{tr('Address:', 'العنوان:')}</span>
                                  <span className="text-gray-800 font-medium flex-1">{userInfo.address}</span>
                                </div>
                                {userInfo.city && (
                                  <div className="flex items-start">
                                    <span className="text-gray-500 text-sm w-20 mt-1">{tr('City:', 'المدينة:')}</span>
                                    <span className="text-gray-800">{userInfo.city}</span>
                                  </div>
                                )}
                                {userInfo.country && (
                                  <div className="flex items-start">
                                    <span className="text-gray-500 text-sm w-20 mt-1">{tr('Country:', 'البلد:')}</span>
                                    <span className="text-gray-800">{userInfo.country}</span>
                                  </div>
                                )}
                                {userInfo.zipCode && (
                                  <div className="flex items-start">
                                    <span className="text-gray-500 text-sm w-20 mt-1">{tr('ZIP:', 'الرمز البريدي:')}</span>
                                    <span className="text-gray-800">{userInfo.zipCode}</span>
                                  </div>
                                )}
                              </div>
                              <div className="bg-white p-4 rounded-lg border">
                                <div className="text-sm font-medium text-gray-700 mb-2">{tr('Delivery Information', 'معلومات التوصيل')}</div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div>✅ {tr('Address verified from profile', 'تم التحقق من العنوان من الملف الشخصي')}</div>
                                  <div>📦 {tr('Ready for delivery calculation', 'جاهز لحساب التوصيل')}</div>
                                  <div>🚚 {tr('Standard delivery rates apply', 'تطبق أسعار التوصيل العادية')}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* GPS Location Information */}
                        {selectedLocationOption === 'gps' && (
                          <div>
                            <div className="flex items-center mb-4">
                              <span className="text-2xl mr-3">📱</span>
                              <h4 className="text-lg font-semibold text-gray-800">{tr('GPS Location Detection', 'كشف الموقع عبر GPS')}</h4>
                              {userLocation && (
                                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{tr('Location Found', 'تم العثور على الموقع')}</span>
                              )}
                                </div>
                            
                                                         {!gpsLocationData ? (
                               <div className="space-y-4">
                                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                   <div className="text-sm font-medium text-blue-800 mb-2">📍 {tr('Detect Your Current Location', 'اكتشف موقعك الحالي')}</div>
                                   <div className="text-xs text-blue-600 mb-4">
                                     • {tr('Most accurate delivery cost calculation', 'حساب تكلفة التوصيل الأكثر دقة')}<br/>
                                     • {tr('Automatic address field filling', 'ملء حقول العنوان تلقائياً')}<br/>
                                     • {tr('Precise GPS coordinates for delivery driver', 'إحداثيات GPS دقيقة للسائق')}<br/>
                                     • {tr('Works best with location services enabled', 'يعمل بشكل أفضل مع خدمات الموقع المفعلة')}
                                </div>
                                   <div className="flex flex-col gap-3">
                                     <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <LocationService 
                                  onLocationUpdate={handleLocationUpdate}
                                  className="w-full"
                                />
                              </div>
                                     <div className="text-xs text-blue-500 italic">
                                       💡 {tr('Allow location access when prompted by your browser for best results', 'اسمح بالوصول للموقع عند طلب المتصفح للحصول على أفضل النتائج')}
                                  </div>
                                  </div>
                                 </div>
                               </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                 <div className="space-y-3">
                                   <div className="flex items-start">
                                     <span className="text-gray-500 text-sm w-24 mt-1">{tr('Coordinates:', 'الإحداثيات:')}</span>
                                     <span className="text-gray-800 font-mono text-sm">{gpsLocationData.latitude?.toFixed(6)}, {gpsLocationData.longitude?.toFixed(6)}</span>
                                   </div>
                                   <div className="flex items-start">
                                     <span className="text-gray-500 text-sm w-24 mt-1">{tr('Accuracy:', 'الدقة:')}</span>
                                     <span className="text-gray-800">±{gpsLocationData.accuracy?.toFixed(0)} {tr('meters', 'متر')}</span>
                                   </div>
                                  {window.userLocationCoords?.address && (
                                    <div className="flex items-start">
                                      <span className="text-gray-500 text-sm w-24 mt-1">Address:</span>
                                      <span className="text-gray-800 flex-1">{window.userLocationCoords.address}</span>
                                </div>
                              )}
                                  <div className="flex gap-2 mt-3">
                                    <a
                                      href={window.userLocationCoords?.googleMapsLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                      🗺️ {tr('View on Maps', 'عرض على الخرائط')}
                                    </a>
                                                                         <button
                                       type="button"
                                       onClick={() => {
                                         navigator.clipboard.writeText(`${gpsLocationData.latitude}, ${gpsLocationData.longitude}`);
                                         alert(tr('📋 Coordinates copied to clipboard!', '📋 تم نسخ الإحداثيات إلى الحافظة!'));
                                       }}
                                       className="text-xs bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                                     >
                                       📋 {tr('Copy Coordinates', 'نسخ الإحداثيات')}
                                     </button>
                            </div>
                          </div>
                                <div className="bg-white p-4 rounded-lg border">
                                  <div className="text-sm font-medium text-green-700 mb-2">✅ {tr('GPS Location Active', 'موقع GPS نشط')}</div>
                                  <div className="text-xs text-green-600 space-y-1">
                                    <div>📍 {tr('Precise location detected', 'تم اكتشاف الموقع بدقة')}</div>
                                    <div>🎯 {tr('Most accurate delivery cost', 'تكلفة التوصيل الأكثر دقة')}</div>
                                    <div>🚚 {tr('Shared with delivery driver', 'مشاركة مع سائق التوصيل')}</div>
                                    <div>⚡ {tr('Address fields auto-filled', 'تم ملء حقول العنوان تلقائياً')}</div>
                        </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Manual Entry Information */}
                        {selectedLocationOption === 'manual' && (
                          <div>
                            <div className="flex items-center mb-4">
                              <span className="text-2xl mr-3">🗺️</span>
                              <h4 className="text-lg font-semibold text-gray-800">{tr('Manual Location Entry', 'إدخال الموقع يدوياً')}</h4>
                              <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">{tr('Manual Mode', 'الوضع اليدوي')}</span>
                              </div>
                            
                            <div className="space-y-4">
                              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <div className="text-sm font-medium text-orange-800 mb-2">📍 {tr('How to get your exact coordinates:', 'كيفية الحصول على إحداثياتك الدقيقة:')}</div>
                                <ol className="list-decimal ml-6 text-xs text-gray-600 space-y-1">
                                  <li>{tr('Open Google Maps on your phone or computer', 'افتح خرائط جوجل على هاتفك أو جهاز الكمبيوتر')} <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">maps.google.com</a></li>
                                  <li>{tr('Find your delivery location on the map', 'حدد موقع التوصيل على الخريطة')}</li>
                                  <li>{tr('Right-click (or press and hold on mobile) on the exact spot', 'انقر بزر الماوس الأيمن (أو اضغط مطولاً على الجوال) على الموقع المحدد')}</li>
                                  <li>{tr('Copy the coordinates that appear (e.g., 24.7136, 46.6753)', 'انسخ الإحداثيات التي تظهر (مثال: 24.7136, 46.6753)')}</li>
                                  <li>{tr('Paste them below and click "Get Location Info"', 'الصقها أدناه واضغط "الحصول على معلومات الموقع"')}</li>
                                </ol>
                              </div>
                              
                                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-3">
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                                       {tr('Enter Coordinates (Latitude, Longitude)', 'أدخل الإحداثيات (خط العرض, خط الطول)')}
                            </label>
                                     <div className="flex gap-2">
                                       <input
                                         type="text"
                                         id="manualCoordinates"
                                         placeholder={tr('24.7136, 46.6753', '24.7136, 46.6753')}
                                         className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                       />
                                       <button
                                         type="button"
                                         onClick={async () => {
                                           const input = document.getElementById('manualCoordinates');
                                           const value = input.value.trim();
                                           
                                           if (!value) {
                                             alert(tr('❌ Please enter coordinates first!', '❌ يرجى إدخال الإحداثيات أولاً!'));
                                             return;
                                           }
                                           
                                           const coords = value.split(',').map(coord => parseFloat(coord.trim()));
                                           if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                                             // Validate coordinate ranges
                                             if (coords[0] < -90 || coords[0] > 90 || coords[1] < -180 || coords[1] > 180) {
                                               alert(tr('❌ Invalid coordinates! Latitude must be between -90 and 90, Longitude between -180 and 180', '❌ إحداثيات غير صحيحة! يجب أن يكون خط العرض بين -90 و 90، خط الطول بين -180 و 180'));
                                               return;
                                             }
                                             
                                             // Show loading state
                                             const button = document.querySelector('[data-manual-location-btn]');
                                             const originalText = button.textContent;
                                             button.textContent = tr('🔄 Getting Address...', '🔄 جاري الحصول على العنوان...');
                                             button.disabled = true;
                                             
                                             try {
                                               // Fetch address details from coordinates
                                               const addressData = await reverseGeocodeManualCoords(coords[0], coords[1]);
                                               
                                               const locationData = {
                                                 latitude: coords[0],
                                                 longitude: coords[1],
                                                 accuracy: 0,
                                                 timestamp: Date.now()
                                               };
                                               
                                               // Store manual coordinates separately
                                               setManualLocationCoords(locationData);
                                               
                                               if (addressData) {
                                                 // Store detailed address data
                                                 setManualLocationData(addressData);
                                                 
                                                 // Store coordinates globally for order submission
                                                 window.userLocationCoords = {
                                                   latitude: coords[0],
                                                   longitude: coords[1],
                                                   accuracy: 0,
                                                   googleMapsLink: addressData.googleMapsLink,
                                                   googleMapsAddressLink: addressData.googleMapsLink,
                                                   address: addressData.formattedAddress,
                                                   addressComponents: addressData.addressComponents
                                                 };
                                                 
                                                 setLocationStatus('Manual coordinates with address details loaded successfully');
                                               } else {
                                                 // Fallback if geocoding fails - still trigger calculation
                                                 window.userLocationCoords = {
                                                   latitude: coords[0],
                                                   longitude: coords[1],
                                                   accuracy: 0,
                                                   googleMapsLink: `https://maps.google.com?q=${coords[0]},${coords[1]}`,
                                                   googleMapsAddressLink: `https://maps.google.com/maps?q=${coords[0]},${coords[1]}`,
                                                   address: `Coordinates: ${coords[0]}, ${coords[1]}`,
                                                   addressComponents: null
                                                 };
                                                 setLocationStatus('Manual coordinates set (address lookup failed)');
                                               }
                                             } catch (error) {
                                               console.error('Error getting address:', error);
                                               alert(tr('⚠️ Location set but failed to get address details. You can still use the coordinates.', '⚠️ تم تعيين الموقع ولكن فشل في الحصول على تفاصيل العنوان. يمكنك لا تزال استخدام الإحداثيات'));
                                             } finally {
                                               // Restore button state
                                               button.textContent = originalText;
                                               button.disabled = false;
                                             }
                                           } else {
                                             alert(tr('❌ Please enter valid coordinates in format: latitude, longitude (e.g., 24.7136, 46.6753)', '❌ يرجى إدخال إحداثيات صحيحة بصيغة: خط العرض، خط الطول (مثال: 24.7136، 46.6753)'));
                                           }
                                         }}
                                         data-manual-location-btn
                                         className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap disabled:opacity-50"
                                       >
                                         📍 {tr('Get Location Info', 'الحصول على معلومات الموقع')}
                                       </button>
                          </div>
                        </div>
                                  
                                                                     {manualLocationCoords && selectedLocationOption === 'manual' && (
                                     <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                       <div className="text-sm font-medium text-green-800 mb-2">✅ {tr('Location Found', 'تم العثور على الموقع')}</div>
                                                                               <div className="text-xs text-green-600 mb-2">
                                          <strong>{tr('Coordinates:', 'الإحداثيات:')}</strong> {manualLocationCoords.latitude?.toFixed(6)}, {manualLocationCoords.longitude?.toFixed(6)}
                      </div>

                                       {manualLocationData && (
                                         <div className="mb-3">
                                           <div className="text-xs font-medium text-green-800 mb-1">📍 {tr('Address Details:', 'تفاصيل العنوان:')}</div>
                                           <div className="text-xs text-green-700 space-y-1">
                                             {manualLocationData.addressComponents.streetAddress && (
                                               <div><strong>{tr('Street:', 'الشارع:')}</strong> {manualLocationData.addressComponents.streetAddress}</div>
                                             )}
                                             {manualLocationData.addressComponents.city && (
                                               <div><strong>{tr('City:', 'المدينة:')}</strong> {manualLocationData.addressComponents.city}</div>
                                             )}
                                             {manualLocationData.addressComponents.state && (
                                               <div><strong>{tr('State:', 'الولاية:')}</strong> {manualLocationData.addressComponents.state}</div>
                                             )}
                                             {manualLocationData.addressComponents.country && (
                                               <div><strong>{tr('Country:', 'البلد:')}</strong> {manualLocationData.addressComponents.country}</div>
                                             )}
                                             {manualLocationData.addressComponents.postcode && (
                                               <div><strong>{tr('ZIP:', 'الرمز البريدي:')}</strong> {manualLocationData.addressComponents.postcode}</div>
                                             )}
                            </div>
                                         </div>
                                       )}
                                       
                                       <div className="flex flex-wrap gap-2">
                              <a
                                           href={`https://maps.google.com?q=${manualLocationCoords.latitude},${manualLocationCoords.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                           className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                              >
                                           🗺️ {tr('Verify on Maps', 'التحقق على الخرائط')}
                              </a>
                                         
                                         {manualLocationData && (
                              <button
                                type="button"
                                             onClick={fillFormWithManualLocation}
                                             className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                           >
                                             📝 {tr('Fill Form Fields', 'ملء حقول النموذج')}
                              </button>
                                         )}
                            </div>
                          </div>
                                   )}
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border">
                                  <div className="text-sm font-medium text-gray-700 mb-2">⚠️ {tr('Important Notes', 'ملاحظات هامة')}</div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>📍 {tr('Use exact coordinates for accuracy', 'استخدم الإحداثيات الدقيقة لضمان الدقة')}</div>
                                    <div>🎯 {tr('Double-check location on map', 'تحقق من الموقع على الخريطة')}</div>
                                    <div>📱 {tr('GPS location is more accurate', 'الموقع عبر GPS أكثر دقة')}</div>
                                    <div>🚚 {tr('Delivery cost may be estimated', 'قد يتم تقدير تكلفة التوصيل')}</div>
                                  </div>
                                </div>
                              </div>
                          </div>
                        </div>
                      )}
                      </div>
                      
                      {/* Delivery Cost Information */}
                      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-emerald-800 mb-2">💰 {tr('Delivery Cost Calculation', 'حساب تكلفة التوصيل')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-xs text-emerald-700 space-y-1">
                            <div><strong>{tr('Base Cost:', 'التكلفة الأساسية:')}</strong> {storeCustomizationSetting?.distanceBasedShipping?.base_shipping_cost || 10} SAR</div>
                            <div><strong>{tr('Per KM:', 'لكل كيلومتر:')}</strong> {storeCustomizationSetting?.distanceBasedShipping?.cost_per_km || 2} SAR</div>
                          {storeCustomizationSetting?.distanceBasedShipping?.enable_free_shipping !== false && (
                              <>
                                <div><strong>{tr('Free over:', 'توصيل مجاني لأكثر من:')}</strong> {storeCustomizationSetting?.distanceBasedShipping?.min_order_free_delivery || 100} SAR</div>
                              </>
                          )}
                          </div>
                          <div className="text-xs text-emerald-600">
                            <div className="font-medium mb-1">{tr('Formula: Base + (Distance × Rate)', 'الصيغة: التكلفة الأساسية + (المسافة × السعر')}</div>
                            <div>{tr('Example:', 'مثال:')} {storeCustomizationSetting?.distanceBasedShipping?.base_shipping_cost || 10} SAR + (5 × {storeCustomizationSetting?.distanceBasedShipping?.cost_per_km || 2} SAR) = {SAR}{(storeCustomizationSetting?.distanceBasedShipping?.base_shipping_cost || 10) + (5 * (storeCustomizationSetting?.distanceBasedShipping?.cost_per_km || 2))}</div>
                        </div>
                      </div>
                      </div>
                      
                      {/* Calculate Shipping Button */}
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={calculateShippingCost}
                          disabled={isCalculatingShipping}
                          className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${
                            isCalculatingShipping
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                          }`}
                        >
                          {isCalculatingShipping ? (
                            <>
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {tr('Calculating...', 'جاري الحساب...')}
                            </>
                          ) : (
                            <>
                              🚚 {tr('Calculate Delivery Cost', 'احسب تكلفة التوصيل')}
                            </>
                          )}
                        </button>
                        <div className="text-xs text-gray-600 mt-2">
                          {tr('Click to calculate shipping cost based on your selected location method', 'انقر لحساب تكلفة الشحن بناءً على طريقة الموقع المختارة')}
                        </div>
                      </div>
                      
                      {/* Calculation Status */}
                      {calculationStatus && (
                        <div className={`mt-3 p-3 rounded-lg border ${
                          calculationStatus.includes('❌') 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-start">
                            <span className={`text-sm font-medium ${
                              calculationStatus.includes('❌') 
                                ? 'text-red-800' 
                                : 'text-green-800'
                            }`}>
                              {calculationStatus}
                            </span>
                          </div>
                          {!calculationStatus.includes('❌') && calculationStatus.includes('✅') && (
                            <div className="text-xs text-green-600 mt-1">
                              {tr('Check the "Distance-Based Shipping Calculator" section below for your exact delivery cost.', 'تحقق من قسم "حاسبة الشحن حسب المسافة" أدناه للحصول على تكلفة التوصيل الدقيقة.')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Address Form Fields */}
                    <div className="grid grid-cols-6 gap-6 mb-8">
                      <div className="col-span-6">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.checkout?.street_address
                          ) || tr('Street Address', 'عنوان الشارع')}
                          name="address"
                          type="text"
                          placeholder={tr('House No, Street Name, Area (e.g., Building 123, King Fahd Road, Al Malaz)', 'رقم المنزل، اسم الشارع، المنطقة (مثال: مبنى 123، طريق الملك فهد، الملز)')}
                          required={true}
                        />
                        <Error errorName={errors.address} />
                      </div>

                      <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.checkout?.city
                          ) || tr('City', 'المدينة')}
                          name="city"
                          type="text"
                          placeholder={tr('Riyadh', 'الرياض')}
                          required={true}
                        />
                        <Error errorName={errors.city} />
                      </div>

                      <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.checkout?.country
                          ) || tr('Country', 'البلد')}
                          name="country"
                          type="text"
                          placeholder={tr('Saudi Arabia', 'المملكة العربية السعودية')}
                          defaultValue="Saudi Arabia"
                          required={false}
                        />
                        <Error errorName={errors.country} />
                      </div>

                      <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                        <InputArea
                          register={register}
                          label={showingTranslateValue(
                            storeCustomizationSetting?.checkout?.zip_code
                          ) || tr('Zip Code', 'الرمز البريدي')}
                          name="zipCode"
                          type="text"
                          placeholder={tr('12345', '12345')}
                          required={false}
                        />
                        <Error errorName={errors.zipCode} />
                      </div>
                    </div>

                    <Label
                      label={showingTranslateValue(
                        storeCustomizationSetting?.checkout?.shipping_cost
                      )}
                    />
                    
                    {/* Distance-Based Shipping Calculator */}
                    <div className="mb-6">
                      
                      <DistanceBasedShippingCalculator
                        userLocation={userLocation}
                        cartTotal={cartTotal}
                        onShippingCostChange={handleShippingCost}
                        currency={currency}
                        storeSettings={{
                          storeLocation: {
                            // Get from admin settings or use default coordinates
                            latitude: storeCustomizationSetting?.distanceBasedShipping?.store_latitude || 26.417740,
                            longitude: storeCustomizationSetting?.distanceBasedShipping?.store_longitude || 43.900413
                          },
                          pricing: {
                            baseCost: storeCustomizationSetting?.distanceBasedShipping?.base_shipping_cost || 10,
                            costPerKm: storeCustomizationSetting?.distanceBasedShipping?.cost_per_km || 2,
                            maxDeliveryDistance: storeCustomizationSetting?.distanceBasedShipping?.max_delivery_distance || 50
                          },
                          freeDelivery: {
                            enabled: storeCustomizationSetting?.distanceBasedShipping?.enable_free_shipping !== false, // Default to true if not set
                            radius: storeCustomizationSetting?.distanceBasedShipping?.free_delivery_radius || 0.5,
                            minOrderAmount: storeCustomizationSetting?.distanceBasedShipping?.min_order_free_delivery || 100
                          }
                        }}
                      />
                    </div>
                  </div>
                  </div> {/* End Container 1: Personal Info + Delivery Cost + Address */}
                  
                  {/* Container 2b: Coupon + Loyalty Points + Price Breakdown - Mobile Only */}
                  <div className="md:hidden border p-5 lg:px-8 lg:py-8 rounded-lg bg-white mb-6">
                    <div className="flex items-center mt-4 py-4 lg:py-4 text-sm w-full font-semibold text-heading last:border-b-0 last:text-base last:pb-0">
                      <div className="w-full">
                        {couponInfo.couponCode ? (
                          <span className="bg-emerald-50 px-4 py-3 leading-tight w-full rounded-md flex justify-between">
                            {" "}
                            <p className="text-emerald-600">{t("applyCoupon")} </p>{" "}
                            <span className="text-red-500 text-right">
                              {couponInfo.couponCode}
                            </span>
                          </span>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-start justify-end">
                            <input
                              ref={couponRef}
                              type="text"
                              placeholder={tr('Enter coupon code', 'أدخل رمز القسيمة الخاص بك')}
                              className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-emerald-500 placeholder-gray-500 placeholder-opacity-75"
                            />
                            {isCouponAvailable ? (
                              <button
                                disabled={isCouponAvailable}
                                type="submit"
                                className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-emerald-500 h-12 text-sm lg:text-base w-full sm:w-auto"
                              >
                                <img
                                  src="/loader/spinner.gif"
                                  alt="Loading"
                                  width={20}
                                  height={10}
                                />
                                <span className=" ml-2 font-light">{t("loading")}</span>
                              </button>
                            ) : (
                              <button
                                disabled={isCouponAvailable}
                                onClick={handleCouponCode}
                                className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-emerald-500 h-12 text-sm lg:text-base w-full sm:w-auto"
                              >
                                {showingTranslateValue(
                                  storeCustomizationSetting?.checkout?.apply_button
                                ) || tr('Apply', 'تطبيق')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Loyalty Points Redemption */}
                    {userInfo?.id && (
                      <div className="flex items-center mt-4 py-4 lg:py-4 text-sm w-full font-semibold text-heading border-t">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <FiStar className="text-purple-600 mr-2" />
                              <span className="text-gray-700 font-semibold">{tr('Loyalty Points', 'نقاط الولاء')}</span>
                            </div>
                            <div className="text-purple-600 font-bold">
                              {loyaltyPoints} {tr('available points', 'النقاط المتاحة')}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-start justify-end">
                            <input
                              type="number"
                              min="0"
                              max={Math.min(maxRedeemablePoints, loyaltyPoints)}
                              value={pointsToRedeem}
                              onChange={handlePointsChange}
                              placeholder={tr('Points to redeem', 'النقاط المراد استبدالها')}
                              className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-purple-500 placeholder-gray-500 placeholder-opacity-75"
                            />
                            <button
                              type="button"
                              onClick={applyMaxPoints}
                              className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-purple-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-purple-500 bg-purple-50 text-purple-600 h-12 text-sm lg:text-base w-full sm:w-auto"
                            >
                              {tr('Apply Max Points', 'تطبيق أقصى نقاط')}
                            </button>
                          </div>
                          
                          {pointsToRedeem > 0 && (
                            <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-purple-700">
                                  <FiInfo className="inline mr-1" />
                                  {tr('Redeem points', 'استبدال النقاط')} {pointsToRedeem} {tr('loyalty points', 'نقاط الولاء')}
                                </span>
                                <span className="text-purple-700 font-bold">-{formatPrice(loyaltyDiscountAmount)}</span>
                              </div>
                              <div className="text-xs text-purple-600 mt-1">
                                {tr('Remaining', 'المتبقي')}: {loyaltyPoints - pointsToRedeem} {tr('loyalty points', 'نقاط الولاء')}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setPointsToRedeem(0);
                                  if (handleLoyaltyPointsRedemption) {
                                    handleLoyaltyPointsRedemption(0);
                                  }
                                }}
                                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                              >
                                {tr('Clear points', 'مسح النقاط')}
                              </button>
                            </div>
                          )}
                          
                          {maxRedeemablePoints < loyaltyPoints && (
                            <div className="mt-2 text-xs text-gray-500">
                              <FiInfo className="inline mr-1" />
                              {tr('Max redeemable', 'أقصى قابل للاستبدال')}: {maxRedeemablePoints} {tr('loyalty points', 'نقاط الولاء')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                      {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.sub_total
                      ) || tr('Subtotal', 'المجموع الفرعي')}
                      <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                      {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.shipping_cost
                      ) || tr('Shipping Cost', 'تكلفة الشحن')}
                      <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
                        {formatPrice(shippingCost)}
                      </span>
                    </div>
                    <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                      {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.discount
                      ) || tr('Discount', 'الخصم')}
                      <span className="ml-auto flex-shrink-0 font-bold text-orange-400">
                        {formatPrice(discountAmount)}
                      </span>
                    </div>
                    {loyaltyDiscountAmount > 0 && (
                      <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                        <span className="flex items-center">
                          <FiStar className="text-purple-600 mr-2" />
                          {t("loyaltyDiscount")}
                        </span>
                        <span className="ml-auto flex-shrink-0 font-bold text-purple-600">
                          {formatPrice(loyaltyDiscountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t mt-4">
                      <div className="flex items-center font-bold font-serif justify-between pt-5 text-sm uppercase">
                        {showingTranslateValue(
                          storeCustomizationSetting?.checkout?.total_cost
                        ) || tr('TOTAL COST', 'التكلفة الإجمالية')}
                        <span className="font-serif font-extrabold text-lg">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div> {/* End Container 2b: Coupon + Loyalty Points + Price Breakdown - Mobile Only */}
                  
                  {/* Container 3: Payment Method + Action Buttons - Mobile Only */}
                  <div className="md:hidden bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="form-group">
                    <h2 className="font-semibold text-base text-gray-700 pb-3">
                      03.{" "}
                      {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.payment_method
                      ) || tr('Payment Method', 'طريقة الدفع')}
                    </h2>

                    <div className="grid sm:grid-cols-1 grid-cols-1 gap-4">
                      <div className="">
                        <InputPayment
                          setShowCard={setShowCard}
                          register={register}
                          name={tr('Cash On Delivery', 'الدفع عند الاستلام')}
                          value="Cash"
                          Icon={IoWalletSharp}
                          defaultChecked={true}
                        />
                        <Error errorMessage={errors.paymentMethod} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-4 lg:gap-6 mt-10">
                    <div className="col-span-6 sm:col-span-3">
                      <Link
                        href="/"
                        className="bg-indigo-50 border border-indigo-100 rounded py-3 text-center text-sm font-medium text-gray-700 hover:text-gray-800 hover:border-gray-300 transition-all flex justify-center font-serif w-full"
                      >
                        <span className="text-xl mr-2">
                          <IoReturnUpBackOutline />
                        </span>
                        {showingTranslateValue(
                          storeCustomizationSetting?.checkout?.continue_button
                        ) || tr('Continue Shipping', 'متابعة التسوق')}
                      </Link>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <button
                        type="submit"
                        disabled={isEmpty || isCheckoutSubmit}
                        className="bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 transition-all rounded py-3 text-center text-sm font-serif font-medium text-white flex justify-center w-full"
                      >
                        {isCheckoutSubmit ? (
                          <span className="flex justify-center text-center">
                            {" "}
                            <img
                              src="/loader/spinner.gif"
                              alt="Loading"
                              width={20}
                              height={10}
                            />{" "}
                            <span className="ml-2">
                              {t("processing")}
                            </span>
                          </span>
                        ) : (
                          <span className="flex justify-center text-center">
                            {showingTranslateValue(
                              storeCustomizationSetting?.checkout
                                ?.confirm_button
                            ) || tr('Confirm Order', 'تأكيد الطلب')}
                            <span className="text-xl ml-2">
                              {" "}
                              <IoArrowForward />
                            </span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  </div> {/* End Container 3: Payment Method + Action Buttons - Mobile Only */}
                  
                  {/* Container 3: Payment Method + Action Buttons - Desktop Only */}
                  <div className="hidden md:block bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="form-group">
                      <h2 className="font-semibold text-base text-gray-700 pb-3">
                        03.{" "}
                        {showingTranslateValue(
                          storeCustomizationSetting?.checkout?.payment_method
                        ) || tr('Payment Method', 'طريقة الدفع')}
                      </h2>

                      <div className="grid sm:grid-cols-1 grid-cols-1 gap-4">
                        <div className="">
                          <InputPayment
                            setShowCard={setShowCard}
                            register={register}
                            name={tr('Cash On Delivery', 'الدفع عند الاستلام')}
                            value="Cash"
                            Icon={IoWalletSharp}
                            defaultChecked={true}
                          />
                          <Error errorMessage={errors.paymentMethod} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 lg:gap-6 mt-10">
                      <div className="col-span-6 sm:col-span-3">
                        <Link
                          href="/"
                          className="bg-indigo-50 border border-indigo-100 rounded py-3 text-center text-sm font-medium text-gray-700 hover:text-gray-800 hover:border-gray-300 transition-all flex justify-center font-serif w-full"
                        >
                          <span className="text-xl mr-2">
                            <IoReturnUpBackOutline />
                          </span>
                          {showingTranslateValue(
                            storeCustomizationSetting?.checkout?.continue_button
                          ) || tr('Continue Shipping', 'متابعة التسوق')}
                        </Link>
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <button
                          type="submit"
                          disabled={isEmpty || isCheckoutSubmit}
                          className="bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 transition-all rounded py-3 text-center text-sm font-serif font-medium text-white flex justify-center w-full"
                        >
                          {isCheckoutSubmit ? (
                            <span className="flex justify-center text-center">
                              {" "}
                              <img
                                src="/loader/spinner.gif"
                                alt="Loading"
                                width={20}
                                height={10}
                              />{" "}
                              <span className="ml-2">
                                {t("processing")}
                              </span>
                            </span>
                          ) : (
                            <span className="flex justify-center text-center">
                              {showingTranslateValue(
                                storeCustomizationSetting?.checkout
                                  ?.confirm_button
                              ) || tr('Confirm Order', 'تأكيد الطلب')}
                              <span className="text-xl ml-2">
                                {" "}
                                <IoArrowForward />
                              </span>
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div> {/* End Container 3: Payment Method + Action Buttons */}
                </form>
              </div>
            </div>



            <div className="md:w-full lg:w-2/5 lg:ml-10 xl:ml-14 md:ml-6 flex flex-col h-full md:sticky lg:sticky top-28 md:order-2 lg:order-2">
              {/* Container 2: Order Summary (Cart Items) */}
              <div className="border p-5 lg:px-8 lg:py-8 rounded-lg bg-white order-1 md:order-2 mb-6">
                <h2 className="font-semibold font-serif text-lg pb-4">
                  {showingTranslateValue(
                    storeCustomizationSetting?.checkout?.order_summary
                  ) || tr('Order Summary', 'ملخص الطلب')}
                </h2>

                <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-64 bg-gray-50 block">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} currency={currency} />
                  ))}

                  {isEmpty && (
                    <div className="text-center py-10">
                      <span className="flex justify-center my-auto text-gray-500 font-semibold text-4xl">
                        <IoBagHandle />
                      </span>
                      <h2 className="font-medium font-serif text-sm pt-2 text-gray-600">
                        {tr('No Item Added Yet!', 'لم يتم إضافة أي عنصر بعد!')}
                      </h2>
                    </div>
                  )}
                </div>
              </div> {/* End Container 2: Order Summary */}

              {/* Container 2b: Coupon + Loyalty Points + Price Breakdown - Desktop Only */}
              <div className="hidden md:block border p-5 lg:px-8 lg:py-8 rounded-lg bg-white">
                <div className="flex items-center mt-4 py-4 lg:py-4 text-sm w-full font-semibold text-heading last:border-b-0 last:text-base last:pb-0">
                  <form className="w-full">
                    {couponInfo.couponCode ? (
                      <span className="bg-emerald-50 px-4 py-3 leading-tight w-full rounded-md flex justify-between">
                        {" "}
                        <p className="text-emerald-600">{t("applyCoupon")} </p>{" "}
                        <span className="text-red-500 text-right">
                          {couponInfo.couponCode}
                        </span>
                      </span>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start justify-end">
                        <input
                          ref={couponRef}
                          type="text"
                          placeholder={tr('Enter coupon code', 'أدخل رمز القسيمة الخاص بك')}
                          className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-emerald-500 placeholder-gray-500 placeholder-opacity-75"
                        />
                        {isCouponAvailable ? (
                          <button
                            disabled={isCouponAvailable}
                            type="submit"
                            className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-emerald-500 h-12 text-sm lg:text-base w-full sm:w-auto"
                          >
                            <img
                              src="/loader/spinner.gif"
                              alt="Loading"
                              width={20}
                              height={10}
                            />
                            <span className=" ml-2 font-light">{t("loading")}</span>
                          </button>
                        ) : (
                          <button
                            disabled={isCouponAvailable}
                            onClick={handleCouponCode}
                            className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-emerald-500 h-12 text-sm lg:text-base w-full sm:w-auto"
                          >
                            {showingTranslateValue(
                              storeCustomizationSetting?.checkout?.apply_button
                            ) || tr('Apply', 'تطبيق')}
                          </button>
                        )}
                      </div>
                    )}
                  </form>
                </div>

                {/* Loyalty Points Redemption */}
                {userInfo?.id && (
                  <div className="flex items-center mt-4 py-4 lg:py-4 text-sm w-full font-semibold text-heading border-t">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FiStar className="text-purple-600 mr-2" />
                          <span className="text-gray-700 font-semibold">{tr('Loyalty Points', 'نقاط الولاء')}</span>
                        </div>
                        <div className="text-purple-600 font-bold">
                          {loyaltyPoints} {tr('available points', 'النقاط المتاحة')}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start justify-end">
                        <input
                          type="number"
                          min="0"
                          max={Math.min(maxRedeemablePoints, loyaltyPoints)}
                          value={pointsToRedeem}
                          onChange={handlePointsChange}
                          placeholder={tr('Points to redeem', 'النقاط المراد استبدالها')}
                          className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-purple-500 placeholder-gray-500 placeholder-opacity-75"
                        />
                        <button
                          type="button"
                          onClick={applyMaxPoints}
                          className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-purple-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-purple-500 bg-purple-50 text-purple-600 h-12 text-sm lg:text-base w-full sm:w-auto"
                        >
                          {tr('Apply Max Points', 'تطبيق أقصى نقاط')}
                        </button>
                      </div>
                      
                      {pointsToRedeem > 0 && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-700">
                              <FiInfo className="inline mr-1" />
                              {tr('Redeem points', 'استبدال النقاط')} {pointsToRedeem} {tr('loyalty points', 'نقاط الولاء')}
                            </span>
                            <span className="text-purple-700 font-bold">-{formatPrice(loyaltyDiscountAmount)}</span>
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            {tr('Remaining', 'المتبقي')}: {loyaltyPoints - pointsToRedeem} {tr('loyalty points', 'نقاط الولاء')}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPointsToRedeem(0);
                              if (handleLoyaltyPointsRedemption) {
                                handleLoyaltyPointsRedemption(0);
                              }
                            }}
                            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                          >
                            {tr('Clear points', 'مسح النقاط')}
                          </button>
                        </div>
                      )}
                      
                      {maxRedeemablePoints < loyaltyPoints && (
                        <div className="mt-2 text-xs text-gray-500">
                          <FiInfo className="inline mr-1" />
                          {tr('Max redeemable', 'أقصى قابل للاستبدال')}: {maxRedeemablePoints} {tr('loyalty points', 'نقاط الولاء')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                  {showingTranslateValue(
                    storeCustomizationSetting?.checkout?.sub_total
                  ) || tr('Subtotal', 'المجموع الفرعي')}
                  <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                  {showingTranslateValue(
                    storeCustomizationSetting?.checkout?.shipping_cost
                  ) || tr('Shipping Cost', 'تكلفة الشحن')}
                  <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
                    {formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                  {showingTranslateValue(
                    storeCustomizationSetting?.checkout?.discount
                  ) || tr('Discount', 'الخصم')}
                  <span className="ml-auto flex-shrink-0 font-bold text-orange-400">
                    {formatPrice(discountAmount)}
                  </span>
                </div>
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                    <span className="flex items-center">
                      <FiStar className="text-purple-600 mr-2" />
                      {t("loyaltyDiscount")}
                    </span>
                    <span className="ml-auto flex-shrink-0 font-bold text-purple-600">
                      {formatPrice(loyaltyDiscountAmount)}
                    </span>
                  </div>
                )}
                <div className="border-t mt-4">
                  <div className="flex items-center font-bold font-serif justify-between pt-5 text-sm uppercase">
                    {showingTranslateValue(
                      storeCustomizationSetting?.checkout?.total_cost
                    ) || tr('TOTAL COST', 'التكلفة الإجمالية')}
                    <span className="font-serif font-extrabold text-lg">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div> {/* End Container 2b: Coupon + Loyalty Points + Price Breakdown - Desktop Only */}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Checkout;
