import requests from "./httpServices";

const CouponServices = {
  getAllCoupons: async () => {
    return requests.get("/coupon");
  },
  getShowingCoupons: async () => {
    return requests.get("/coupon/show");
  },
  // ========================================
  // ODOO COUPON/GIFT CARD INTEGRATION
  // ========================================
  
  /**
   * Validate a coupon code in Odoo
   * @param {string} couponCode - The coupon code to validate
   * @param {string} customerPhone - Customer phone number
   * @returns {Object} Validation result
   */
  validateOdooCoupon: async (couponCode, customerPhone) => {
    console.log('🔍 DEBUG: CouponServices.validateOdooCoupon called with:', { couponCode, customerPhone });
    
    try {
      const result = await requests.post("/odoo-integration/validate-coupon", {
        couponCode,
        customerPhone
      });
      
      console.log('🔍 DEBUG: CouponServices.validateOdooCoupon result:', result);
      return result;
    } catch (error) {
      console.error('🔍 DEBUG: CouponServices.validateOdooCoupon error:', error);
      throw error;
    }
  },

  /**
   * Apply a coupon to an order in Odoo
   * @param {string} couponCode - The coupon code to apply
   * @param {Object} customerData - Customer information
   * @param {string} orderId - Order ID
   * @returns {Object} Application result
   */
  applyOdooCoupon: async (couponCode, customerData, orderId) => {
    return requests.post("/odoo-integration/apply-coupon", {
      couponCode,
      customerData,
      orderId
    });
  },

  /**
   * Check gift card balance in Odoo
   * @param {string} code - Gift card code
   * @returns {Object} Balance information
   */
  checkGiftCardBalance: async (code) => {
    return requests.get(`/odoo-integration/gift-card-balance/${code}`);
  }
};

export default CouponServices;
