import requests from "./httpServices";

const LoyaltyServices = {
  // ========================================
  // ODOO LOYALTY POINTS INTEGRATION
  // ========================================
  
  /**
   * Validate customer loyalty points in Odoo
   * @param {string} customerPhone - Customer phone number or name
   * @returns {Object} Validation result
   */
  validateOdooLoyaltyPoints: async (customerPhone) => {
    console.log('🔍 DEBUG: LoyaltyServices.validateOdooLoyaltyPoints called with:', { customerPhone });
    
    try {
      const result = await requests.post("/odoo-integration/validate-loyalty-points", {
        customerPhone
      });
      
      console.log('🔍 DEBUG: LoyaltyServices.validateOdooLoyaltyPoints result:', result);
      return result;
    } catch (error) {
      console.error('🔍 DEBUG: LoyaltyServices.validateOdooLoyaltyPoints error:', error);
      throw error;
    }
  },

  /**
   * Consume loyalty points in Odoo
   * @param {string} customerPhone - Customer phone number or name
   * @param {number} pointsToConsume - Points to consume
   * @returns {Object} Consumption result
   */
  consumeOdooLoyaltyPoints: async (customerPhone, pointsToConsume) => {
    console.log('🔍 DEBUG: LoyaltyServices.consumeOdooLoyaltyPoints called with:', { customerPhone, pointsToConsume });
    
    try {
      const result = await requests.post("/odoo-integration/consume-loyalty-points", {
        customerPhone,
        pointsToConsume
      });
      
      console.log('🔍 DEBUG: LoyaltyServices.consumeOdooLoyaltyPoints result:', result);
      return result;
    } catch (error) {
      console.error('🔍 DEBUG: LoyaltyServices.consumeOdooLoyaltyPoints error:', error);
      throw error;
    }
  },

  /**
   * Check loyalty points balance in Odoo
   * @param {string} customerPhone - Customer phone number or name
   * @returns {Object} Balance information
   */
  checkOdooLoyaltyPointsBalance: async (customerPhone) => {
    console.log('🔍 DEBUG: LoyaltyServices.checkOdooLoyaltyPointsBalance called with:', { customerPhone });
    
    try {
      const result = await requests.get(`/odoo-integration/loyalty-points-balance/${encodeURIComponent(customerPhone)}`);
      
      console.log('🔍 DEBUG: LoyaltyServices.checkOdooLoyaltyPointsBalance result:', result);
      return result;
    } catch (error) {
      console.error('🔍 DEBUG: LoyaltyServices.checkOdooLoyaltyPointsBalance error:', error);
      throw error;
    }
  },

  // ========================================
  // LEGACY LOCAL DB ENDPOINTS (DEPRECATED)
  // ========================================
  
  // Get customer loyalty summary (DEPRECATED - Use Odoo endpoints)
  getLoyaltySummary: async () => {
    console.warn('⚠️ DEPRECATED: Use validateOdooLoyaltyPoints instead');
    try {
      const response = await requests.get('/loyalty/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty summary:', error);
      throw error;
    }
  },

  // Get loyalty transaction history (DEPRECATED)
  getTransactionHistory: async (page = 1, limit = 20) => {
    console.warn('⚠️ DEPRECATED: This endpoint is no longer used');
    try {
      const response = await requests.get(`/loyalty/transactions?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  },

  // Redeem loyalty points (DEPRECATED - Use Odoo endpoints)
  redeemPoints: async (pointsToRedeem) => {
    console.warn('⚠️ DEPRECATED: Use consumeOdooLoyaltyPoints instead');
    try {
      const response = await requests.post('/loyalty/redeem', {
        pointsToRedeem
      });
      return response.data;
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    }
  },

  // Get loyalty system configuration (DEPRECATED)
  getLoyaltyConfig: async () => {
    console.warn('⚠️ DEPRECATED: This endpoint is no longer used');
    try {
      const response = await requests.get('/loyalty/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty config:', error);
      throw error;
    }
  },

  // Calculate potential points for order amount (DEPRECATED)
  calculatePotentialPoints: async (orderAmount) => {
    console.warn('⚠️ DEPRECATED: This endpoint is no longer used');
    try {
      const response = await requests.get(`/loyalty/calculate-points?orderAmount=${orderAmount}`);
      return response.data;
    } catch (error) {
      console.error('Error calculating potential points:', error);
      throw error;
    }
  },

  // Admin: Get customer loyalty details (DEPRECATED)
  getCustomerLoyaltyDetails: async (customerId) => {
    console.warn('⚠️ DEPRECATED: This endpoint is no longer used');
    try {
      const response = await requests.get(`/loyalty/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer loyalty details:', error);
      throw error;
    }
  },

  // Admin: Award bonus points to customer (DEPRECATED)
  awardBonusPoints: async (customerId, points, description) => {
    console.warn('⚠️ DEPRECATED: This endpoint is no longer used');
    try {
      const response = await requests.post(`/loyalty/customer/${customerId}/award-bonus`, {
        points,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Error awarding bonus points:', error);
      throw error;
    }
  }
};

export default LoyaltyServices; 