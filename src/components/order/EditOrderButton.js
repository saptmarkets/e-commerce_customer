import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { IoCreateOutline, IoWarningOutline } from 'react-icons/io5';
import useTranslation from 'next-translate/useTranslation';
import { useCart } from 'react-use-cart';
import OrderServices from '@services/OrderServices';
import { notifyError, notifySuccess } from '@utils/toast';

const EditOrderButton = ({ order }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { setItems } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Feature flag check (default enabled if env not set)
  const isEditEnabled = ((process.env.NEXT_PUBLIC_REVERT_TO_CHECKOUT_ENABLED ?? 'true') === 'true');

  // Early return if order is not available
  if (!order || !order._id) {
    return null;
  }

  // Check if order can be edited
  const canEdit = order?.status === 'Received' && 
                  !order?.lockedAt && 
                  !order?.deliveryInfo?.assignedDriver &&
                  isEditEnabled;

  const handleEditOrder = async () => {
    if (!canEdit || !order?._id) return;

    setIsLoading(true);
    try {
      const response = await OrderServices.revertToCheckout(order._id, order.version || 1);
      
      if (response.cart && Array.isArray(response.cart)) {
        setItems(response.cart);
      }
      if (response.address) {
        sessionStorage.setItem('checkoutAddress', JSON.stringify(response.address));
      }
      if (response.coordinates) {
        sessionStorage.setItem('checkoutCoordinates', JSON.stringify(response.coordinates));
      }
      if (response.deliveryLocation) {
        sessionStorage.setItem('checkoutDeliveryLocation', JSON.stringify(response.deliveryLocation));
      }
      if (response.coupon) {
        sessionStorage.setItem('checkoutCoupon', JSON.stringify(response.coupon));
      }
      if (response.notes) {
        sessionStorage.setItem('checkoutNotes', response.notes);
      }

      notifySuccess(t('orderMovedToCheckout') || 'Order moved to checkout successfully');
      router.push('/checkout');
      
    } catch (error) {
      console.error('Edit order error:', error);
      
      if (error.response?.status === 409) {
        notifyError(t('orderModifiedRefresh') || 'Order has been modified. Please refresh and try again.');
      } else if (error.response?.status === 423) {
        notifyError(t('orderCannotBeModified') || 'Order has been accepted by a driver and cannot be modified.');
      } else if (error.response?.status === 404) {
        notifyError(t('featureNotAvailable') || 'Edit order feature is not available.');
      } else {
        notifyError(error.response?.data?.message || t('editOrderFailed') || 'Failed to edit order. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowConfirmDialog(true)}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <IoCreateOutline className="w-4 h-4 mr-2" />
        {isLoading ? (t('processing') || 'Processing...') : (t('editOrder') || 'Edit Order')}
      </button>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <IoWarningOutline className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('confirmEditOrder') || 'Confirm Edit Order'}
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                {t('editOrderWarning') || 'This will cancel your current order and move your items back to checkout.'}
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• {t('pricesStockMayChange') || 'Prices and stock availability may change'}</li>
                <li>• {t('promotionsMayExpire') || 'Promotions or coupons may no longer be valid'}</li>
                <li>• {t('newOrderNumber') || 'You will receive a new order number'}</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleEditOrder}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (t('processing') || 'Processing...') : (t('confirmEdit') || 'Confirm Edit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditOrderButton; 