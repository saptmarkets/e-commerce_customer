import requests from "./httpServices";

const OrderServices = {
  addOrder: async (body) => {
    // Token is automatically handled by httpServices interceptor
    console.log('🔍 DEBUG: OrderServices.addOrder called with:', JSON.stringify(body, null, 2));
    const response = await requests.post("/customer-order/add", body);
    console.log('🔍 DEBUG: OrderServices.addOrder response:', response);
    return response;
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
    return requests.put(`/customer-order/${id}`, body);
  },

  deleteOrder: async (id) => {
    return requests.delete(`/customer-order/${id}`);
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
    // Token is automatically handled by httpServices interceptor
    // Ensure payment method is COD for backend validation
    console.log('🔍 DEBUG: OrderServices.addCashOrder called with:', JSON.stringify(body, null, 2));
    const payload = { ...body, paymentMethod: 'COD' };
    console.log('🔍 DEBUG: OrderServices.addCashOrder payload:', JSON.stringify(payload, null, 2));
    const response = await requests.post("/customer-order/add", payload);
    console.log('🔍 DEBUG: OrderServices.addCashOrder response:', response);
    return response;
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