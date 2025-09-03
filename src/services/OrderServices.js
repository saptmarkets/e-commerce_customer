import requests from "./httpServices";

const OrderServices = {
  addOrder: async (body) => {
    // Token is automatically handled by httpServices interceptor
    const response = await requests.post("/customer-order/add", body);
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
    const payload = { ...body, paymentMethod: 'COD' };
    const response = await requests.post("/customer-order/add", payload);
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