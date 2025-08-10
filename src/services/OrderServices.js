import requests from "./httpServices";
import Cookies from "js-cookie";

const OrderServices = {
  addOrder: async (body) => {
    // Get the token from cookies
    const userInfoStr = Cookies.get("userInfo");
    if (!userInfoStr) {
      throw new Error("You must be logged in to place an order");
    }
    
    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo.token) {
      throw new Error("Invalid session. Please log in again");
    }
    
    // Add token to headers for authorization
    const headers = {
      Authorization: `Bearer ${userInfo.token}`
    };
    
    return requests.post("/customer-order/add", body, { headers });
  },

  getOrderCustomer: async ({ page = 1, limit = 8 }) => {
    return requests.get(`/customer-order?page=${page}&limit=${limit}`);
  },

  getOrderById: async (id) => {
    return requests.get(`/customer-order/${id}`);
  },

  // Get order details by invoice number (customer-authenticated)
  getOrderByInvoice: async (invoice) => {
    if (!invoice) throw new Error("Invoice number is required");
    return requests.get(`/customer-order/invoice/${invoice}`);
  },

  updateOrder: async (id, body) => {
    return requests.put(`/order/${id}`, body);
  },

  deleteOrder: async (id) => {
    return requests.delete(`/order/${id}`);
  },

  // Cancel customer's own order
  cancelOrder: async (orderId, cancelReason) => {
    return requests.put(`/customer-order/${orderId}/cancel`, {
      cancelReason: cancelReason || 'Cancelled by customer'
    });
  },

  sendEmailInvoiceToCustomer: async (body) => {
    return requests.post("/customer-order/email-invoice", body);
  },

  // Cash on Delivery
  addCashOrder: async (body) => {
    // Get the token from cookies
    const userInfoStr = Cookies.get("userInfo");
    if (!userInfoStr) {
      throw new Error("You must be logged in to place an order");
    }
    
    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo.token) {
      throw new Error("Invalid session. Please log in again");
    }
    
    // Add token to headers for authorization
    const headers = {
      Authorization: `Bearer ${userInfo.token}`
    };
    
    // Ensure payment method is COD for backend validation
    const payload = { ...body, paymentMethod: 'COD' };
    return requests.post("/customer-order/add", payload, { headers });
  },

  // Razorpay
  createRazorpayOrder: async (body) => {
    return requests.post("/order/razorpay/create", body);
  },

  verifyRazorpayPayment: async (body) => {
    return requests.post("/order/razorpay/verify", body);
  },

  // New method for reverting order to checkout
  revertToCheckout: async (orderId, version) => {
    const headers = {
      'If-Match': version.toString(),
      'Idempotency-Key': `revert-${orderId}-${Date.now()}`,
    };
    
    return requests.post(`/customer-order/${orderId}/revert-to-checkout`, {}, { headers });
  },
};

export default OrderServices; 