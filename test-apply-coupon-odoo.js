const axios = require('axios');

// Test script to apply coupon and mark it as used in Odoo
async function testApplyCoupon() {
  try {
    console.log('🧪 Testing coupon application in Odoo...');
    
    // Test data
    const testData = {
      couponCode: '044e-8735-4fe8',
      customerPhone: '501319280', // Real phone number from your checkout
      orderId: 'TEST_ORDER_' + Date.now() // Generate a test order ID
    };
    
    console.log('📋 Test data:', testData);
    
    // Call the backend API to apply the coupon
    const response = await axios.post('https://e-commerce-backend-8j8k.onrender.com/odoo-integration/apply-coupon', testData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://e-commerce-customer-vercel.vercel.app',
        'Referer': 'https://e-commerce-customer-vercel.vercel.app/checkout'
      }
    });
    
    console.log('✅ Coupon application response:', response.data);
    
    if (response.data.success) {
      console.log('🎉 Coupon successfully applied and marked as used in Odoo!');
      console.log('💰 Discount amount:', response.data.data.discountAmount);
      console.log('📊 New use count:', response.data.data.newUseCount);
    } else {
      console.log('❌ Coupon application failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error applying coupon:', error.response?.data || error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run the test
testApplyCoupon();
