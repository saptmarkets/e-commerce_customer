import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
// import useRazorpay from "react-razorpay"; // Disabled: COD only
import { useQuery } from "@tanstack/react-query";

//internal import
import { getUserSession } from "@lib/auth";
import { UserContext } from "@context/UserContext";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "./useUtilsFunction";
import CouponServices from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import NotificationServices from "@services/NotificationServices";
import useTranslation from "next-translate/useTranslation";

const useCheckoutSubmit = (storeSetting, loyaltySummary) => {
  const { t } = useTranslation("common");
  const { dispatch } = useContext(UserContext);

  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [isCouponAvailable, setIsCouponAvailable] = useState(false);
  
  // Loyalty points state
  const [loyaltyDiscountAmount, setLoyaltyDiscountAmount] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const router = useRouter();
  const couponRef = useRef("");
  // const [Razorpay] = useRazorpay(); // Disabled: COD only
  const { isEmpty, emptyCart, items, cartTotal } = useCart();

  // Get user info safely
  const userInfo = getUserSession() || {};
  const { showDateFormat, currency, globalSetting } = useUtilsFunction();

  const { data, isLoading } = useQuery({
    queryKey: ["shippingAddress", { id: userInfo?.id }],
    queryFn: async () => {
      if (!userInfo?.id) return { shippingAddress: null };
      return await CustomerServices.getShippingAddress({
        userId: userInfo.id,
      });
    },
    select: (data) => data?.shippingAddress,
    enabled: !!userInfo?.id,
  });

  // Check if user has profile data that can be used as shipping address
  const hasShippingAddress = !isLoading && userInfo && (
    (data && Object.keys(data)?.length > 0) || 
    (userInfo.address && userInfo.phone && userInfo.city)
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const convertedCoupon = JSON.parse(Cookies.get("couponInfo"));
      setCouponInfo(convertedCoupon);
    }
  }, []);

  // Calculate total with proper loyalty points discount
  useEffect(() => {
    // Calculate subtotal from actual cart items to ensure accuracy
    const cartSubtotal = items?.reduce(
      (total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        return total + (itemPrice * itemQuantity);
      },
      0
    ) || 0;

    let totalValue = 0;
    const subTotal = parseFloat(cartSubtotal + Number(shippingCost)).toFixed(2);
    
    // Calculate coupon discount
    const discountProductTotal = items?.reduce(
      (preValue, currentValue) => preValue + (currentValue.itemTotal || 0),
      0
    );

    const discountAmount =
      discountPercentage?.type === "fixed"
        ? discountPercentage?.value
        : discountProductTotal * (discountPercentage?.value / 100);

    const discountAmountTotal = discountAmount ? discountAmount : 0;

    // Include loyalty points discount in total calculation
    totalValue = Number(subTotal) - discountAmountTotal - loyaltyDiscountAmount;

    // Debug logging
    console.log('Total calculation debug:', {
      cartTotal,
      cartSubtotal,
      shippingCost,
      subTotal,
      discountAmountTotal,
      loyaltyDiscountAmount,
      totalValue,
      items: items?.length,
      itemsDetails: items?.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        itemTotal: item.price * item.quantity
      }))
    });

    setDiscountAmount(discountAmountTotal);
    setTotal(Math.max(0, totalValue));
  }, [cartTotal, shippingCost, discountPercentage, loyaltyDiscountAmount, items]);

  const handleLoyaltyPointsRedemption = (discount) => {
    // Calculate points from discount (1 point = 0.01 SAR)
    const points = Math.round(discount / 0.01);
    setLoyaltyDiscountAmount(discount || 0);
    setPointsToRedeem(points);
  };

  // Clear loyalty points
  const clearLoyaltyPoints = () => {
    setLoyaltyDiscountAmount(0);
    setPointsToRedeem(0);
  };

  const submitHandler = async (data) => {
    try {
      setIsCheckoutSubmit(true);
      setError("");

      // Build user details with latest shipping address fallback
      let latestCustomerData = null;
      try {
        const resp = await CustomerServices.getShippingAddress({ userId: userInfo?.id });
        latestCustomerData = resp?.shippingAddress || null;
      } catch (_) {}

      const userDetails = {
        name: `${data.firstName} ${data.lastName || ''}`.trim(),
        contact: latestCustomerData?.phone || data.contact || userInfo?.phone || '', 
        email: data.email || '', 
        address: data.address || latestCustomerData?.address || '',
        country: data.country || latestCustomerData?.country || "Saudi Arabia",
        city: data.city || latestCustomerData?.city || '',
        zipCode: data.zipCode || '',
        coordinates: window.userLocationCoords || latestCustomerData?.shippingAddress?.coordinates || null,
        deliveryLocation: {
          latitude: window.userLocationCoords?.latitude || latestCustomerData?.shippingAddress?.deliveryLocation?.latitude || null,
          longitude: window.userLocationCoords?.longitude || latestCustomerData?.shippingAddress?.deliveryLocation?.longitude || null,
          googleMapsLink: window.userLocationCoords?.googleMapsLink || latestCustomerData?.shippingAddress?.deliveryLocation?.googleMapsLink || null,
          googleMapsAddressLink: window.userLocationCoords?.googleMapsAddressLink || latestCustomerData?.shippingAddress?.deliveryLocation?.googleMapsAddressLink || null,
          accuracy: window.userLocationCoords?.accuracy || latestCustomerData?.shippingAddress?.deliveryLocation?.accuracy || null,
        },
      };

      const processedCartItems = items.map(item => {
        const actualProductId = item.productId || item.id.split('-')[0];
        const packQty = item.packQty || 1;
        const unitPrice = item.unitPrice || item.price || 0;
        const basePrice = item.baseProductPrice || item.basePrice || item.price || 0;
        const totalBaseUnits = item.quantity * packQty;
        return {
          id: actualProductId,
          productId: actualProductId,
          title: item.title,
          price: unitPrice,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          sku: item.sku || '',
          selectedUnitId: item.selectedUnitId,
          unitName: item.unitName || 'Unit',
          unitValue: item.unitValue || 1,
          packQty: packQty,
          unitPrice: unitPrice,
          basePrice: basePrice,
          baseProductPrice: basePrice,
          unitType: item.unitType || 'multi',
          totalBaseUnits: totalBaseUnits,
          pricePerBaseUnit: packQty > 0 ? unitPrice / packQty : unitPrice,
          isCombo: item.isCombo || false,
          promotion: item.promotion || null,
          comboDetails: item.comboDetails || null,
          promotionPrice: item.promotionPrice || null,
          minQty: item.minQty || 1,
          maxQty: item.maxQty || null,
          isPromotional: item.isPromotional || false,
          savings: item.savings || 0,
          isMultiUnit: item.isMultiUnit || Boolean(item.selectedUnitId),
          originalPrice: item.originalPrice || basePrice,
          barcode: item.barcode || '',
          availableStock: item.stock || 0,
          stockValidated: true
        };
      });

      // Force COD only and set status Received to match backend logic
      const orderInfo = {
        user_info: userDetails,
        paymentMethod: "COD",
        status: "Received",
        cart: processedCartItems,
        subTotal: cartTotal,
        shippingCost: shippingCost,
        discount: discountAmount,
        loyaltyDiscount: loyaltyDiscountAmount,
        loyaltyPointsUsed: pointsToRedeem,
        total: Math.max(0, (cartTotal + shippingCost - (discountAmount || 0) - (loyaltyDiscountAmount || 0))),
      };

      // Save/update shipping address
      await CustomerServices.addShippingAddress({
        userId: userInfo.id,
        shippingAddressData: { ...userDetails },
      });

      // COD only
      await handleCashPayment(orderInfo);
      
    } catch (error) {
      notifyError(error?.response?.data?.message || error?.message);
      setIsCheckoutSubmit(false);
    }
  };

  const handleOrderSuccess = async (orderResponse, orderInfo) => {
    try {
      const updatedData = {
        ...orderResponse,
        date: showDateFormat(orderResponse.createdAt),
        company_info: {
          currency: currency,
          vat_number: globalSetting?.vat_number,
          company: globalSetting?.company_name,
          address: globalSetting?.address,
          phone: globalSetting?.contact,
          email: globalSetting?.email,
          website: globalSetting?.website,
          from_email: globalSetting?.from_email,
        },
      };

      if (globalSetting?.email_to_customer) {
        OrderServices.sendEmailInvoiceToCustomer(updatedData).catch(() => {});
      }

      // Redirect to order page
      router.push(`/order/${orderResponse?.invoice}`);
      
      const successMessage = orderResponse?.verificationCode 
        ? t("common:orderConfirmedSuccess", { verificationCode: orderResponse.verificationCode })
        : t("common:orderConfirmedSuccessNoCode");
      notifySuccess(successMessage);
      Cookies.remove("couponInfo");
      emptyCart();
      setIsCheckoutSubmit(false);
    } catch (err) {
      console.error("Order success handling error:", err.message);
      throw new Error(err.message);
    }
  };

  //handle cash payment (COD only)
  const handleCashPayment = async (orderInfo) => {
    try {
      console.log('🔍 DEBUG: Starting order creation...');
      console.log('🔍 DEBUG: Order info:', JSON.stringify(orderInfo, null, 2));
      console.log('🔍 DEBUG: API URL:', process.env.NEXT_PUBLIC_API_BASE_URL || "https://e-commerce-backend-l0s0.onrender.com/api");
      
      const orderResponse = await OrderServices.addCashOrder(orderInfo);
      console.log('🔍 DEBUG: Order created successfully:', orderResponse);
      await handleOrderSuccess(orderResponse, orderInfo);
    } catch (err) {
      console.error("Cash payment error:", err.message);
      console.error("Cash payment error details:", err);
      console.error("Cash payment error response:", err.response);
      throw new Error(err.message);
    }
  };

  // Razorpay flow disabled
  // const handlePaymentWithRazorpay = async (orderInfo) => { /* disabled */ };

  const handleShippingCost = (value) => {
    setShippingCost(Number(value));
  };

  const handleDefaultShippingAddress = (value) => {
    setUseExistingAddress(value);
    if (value && userInfo) {
      // Use user profile data as the default shipping address
      const name = (userInfo?.name || '').trim();
      let firstName = '';
      let lastName = '';
      if (name) {
        const parts = name.split(' ');
        firstName = parts[0] || '';
        lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      }

      // Populate form fields from user profile data
      setValue('firstName', firstName);
      setValue('lastName', lastName);
      setValue('address', userInfo?.address || '');
      setValue('contact', userInfo?.phone || '');
      setValue('email', userInfo?.email || '');
      setValue('city', userInfo?.city || '');
      setValue('country', userInfo?.country || '');
      setValue('zipCode', userInfo?.zipCode || '');
      
      // Note: Location coordinates are managed in the main checkout component
      // This hook focuses on form field population
    } else {
      // Clear fields (keep common user defaults where appropriate)
      setValue('firstName', '');
      setValue('lastName', '');
      setValue('address', '');
      setValue('contact', userInfo?.phone || '');
      setValue('email', userInfo?.email || '');
      setValue('city', '');
      setValue('country', '');
      setValue('zipCode', '');
      
      // Note: Location data is managed in the main checkout component
    }
  };

  const handleCouponCode = async (e) => {
    e.preventDefault();
    if (!couponRef.current.value) {
      notifyError("Please Input a Coupon Code!");
      return;
    }
    setIsCouponAvailable(true);
    try {
      // Get customer phone from user context or form
      const customerPhone = userInfo?.phone || userInfo?.contact || '';
      
      // DEBUG: Log the phone number being used
      console.log('🔍 DEBUG: Customer phone:', customerPhone);
      console.log('🔍 DEBUG: UserInfo object:', userInfo);
      console.log('🔍 DEBUG: Coupon code:', couponRef.current.value);
      
      if (!customerPhone) {
        notifyError("Please provide your phone number to validate coupon!");
        setIsCouponAvailable(false);
        return;
      }

      // Validate coupon in Odoo
      console.log('🔍 DEBUG: Calling CouponServices.validateOdooCoupon...');
      const validationResult = await CouponServices.validateOdooCoupon(
        couponRef.current.value,
        customerPhone
      );

      // DEBUG: Log the validation result
      console.log('🔍 DEBUG: Validation result:', validationResult);

      setIsCouponAvailable(false);

      if (!validationResult.success || !validationResult.data?.valid) {
        const errorMessage = validationResult.data?.error || "Invalid coupon code";
        console.log('🔍 DEBUG: Validation failed:', errorMessage);
        notifyError(errorMessage);
        return;
      }

      const couponData = validationResult.data;
      console.log('🔍 DEBUG: Coupon data:', couponData);
      
      // Check minimum amount requirement
      if (total < couponData.discountAmount) {
        notifyError(`Coupon value (${couponData.discountAmount}) cannot exceed order total (${total})`);
        return;
      }

      // Apply the coupon
      notifySuccess(`Coupon ${couponData.couponCode} is valid! Discount: ${couponData.discountAmount}`);
      setIsCouponApplied(true);
      setMinimumAmount(couponData.discountAmount);
      setDiscountPercentage(couponData.discountAmount);
      
      // Store coupon info for later application during order creation
      const couponInfo = {
        couponCode: couponData.couponCode,
        couponId: couponData.couponId,
        discountAmount: couponData.discountAmount,
        isOdooCoupon: true, // Flag to identify Odoo coupons
        validationData: couponData
      };
      
      dispatch({ type: "SAVE_COUPON", payload: couponInfo });
      Cookies.set("couponInfo", JSON.stringify(couponInfo));
      
    } catch (error) {
      setIsCouponAvailable(false);
      console.error("🔍 DEBUG: Coupon validation error:", error);
      console.error("🔍 DEBUG: Error response:", error.response);
      notifyError(error.response?.data?.message || "Coupon validation failed");
    }
  };

  return {
    register,
    setValue,
    errors,
    showCard,
    setShowCard,
    error,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    handleLoyaltyPointsRedemption,
    discountPercentage,
    discountAmount,
    loyaltyDiscountAmount,
    setLoyaltyDiscountAmount,
    shippingCost,
    isCheckoutSubmit,
    isCouponApplied,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    handleDefaultShippingAddress,
    clearLoyaltyPoints,
  };
};

export default useCheckoutSubmit;
