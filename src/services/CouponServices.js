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
    try {
      const result = await requests.post("/odoo-integration/validate-coupon", {
        couponCode,
        customerPhone
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Consume a coupon directly (for order confirmation)
   * @param {string} couponCode - The coupon code to consume
   * @param {number} amountToConsume - Amount to consume from the coupon
   * @returns {Object} Consumption result
   */
  consumeOdooCoupon: async (couponCode, amountToConsume) => {
    try {
      const result = await requests.post("/odoo-integration/consume-coupon", {
        couponCode,
        amountToConsume
      });
      return result;
    } catch (error) {
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
