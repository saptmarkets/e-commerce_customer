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

  const hasShippingAddress = !isLoading && data && Object.keys(data)?.length > 0;

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

  useEffect(() => {
    const getTotal = (cartTotal + shippingCost - (discountAmount || 0)).toFixed(2);
    setTotal(getTotal);
  }, [cartTotal, shippingCost, discountAmount]);

  const handleLoyaltyPointsRedemption = (value) => {
    setLoyaltyDiscountAmount(value || 0);
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
      const orderResponse = await OrderServices.addCashOrder(orderInfo);
      await handleOrderSuccess(orderResponse, orderInfo);
    } catch (err) {
      console.error("Cash payment error:", err.message);
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
  };

  const handleCouponCode = async (e) => {
    e.preventDefault();
    if (!couponRef.current.value) {
      notifyError("Please Input a Coupon Code!");
      return;
    }
    setIsCouponAvailable(true);
    try {
      const coupons = await CouponServices.getShowingCoupons();
      const result = coupons.filter((coupon) => coupon.couponCode === couponRef.current.value);
      setIsCouponAvailable(false);
      if (result.length < 1) {
        notifyError("Please Input a Valid Coupon!");
        return;
      }
      if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
        notifyError("This coupon is not valid!");
        return;
      }
      if (total < result[0]?.minimumAmount) {
        notifyError(`Minimum ${result[0].minimumAmount} USD required for Apply this coupon!`);
        return;
      } else {
        notifySuccess(`Your Coupon ${result[0].couponCode} is Applied on ${result[0].productType}!`);
        setIsCouponApplied(true);
        setMinimumAmount(result[0]?.minimumAmount);
        setDiscountPercentage(result[0].discountType);
        dispatch({ type: "SAVE_COUPON", payload: result[0] });
        Cookies.set("couponInfo", JSON.stringify(result[0]));
      }
    } catch (error) {
      return notifyError(error.message);
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
  };
};

export default useCheckoutSubmit;
