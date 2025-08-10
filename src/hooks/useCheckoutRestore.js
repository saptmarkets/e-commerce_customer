import { useEffect } from 'react';
import { useCart } from 'react-use-cart';

const useCheckoutRestore = (setValue, setUserLocation, setManualLocationData, setGpsLocationData) => {
  const { setItems } = useCart();

  useEffect(() => {
    // Restore address data
    const checkoutAddress = sessionStorage.getItem('checkoutAddress');
    if (checkoutAddress && setValue) {
      try {
        const address = JSON.parse(checkoutAddress);
        if (address.name) setValue('firstName', address.name);
        if (address.contact) setValue('contact', address.contact);
        if (address.email) setValue('email', address.email);
        if (address.address) setValue('address', address.address);
        if (address.country) setValue('country', address.country);
        if (address.city) setValue('city', address.city);
        if (address.zipCode) setValue('zipCode', address.zipCode);
        
        sessionStorage.removeItem('checkoutAddress');
      } catch (error) {
        console.error('Error restoring checkout address:', error);
      }
    }

    // Restore coordinates
    const checkoutCoordinates = sessionStorage.getItem('checkoutCoordinates');
    if (checkoutCoordinates && setUserLocation) {
      try {
        const coordinates = JSON.parse(checkoutCoordinates);
        setUserLocation(coordinates);
        sessionStorage.removeItem('checkoutCoordinates');
      } catch (error) {
        console.error('Error restoring checkout coordinates:', error);
      }
    }

    // Restore delivery location
    const checkoutDeliveryLocation = sessionStorage.getItem('checkoutDeliveryLocation');
    if (checkoutDeliveryLocation && setGpsLocationData) {
      try {
        const deliveryLocation = JSON.parse(checkoutDeliveryLocation);
        setGpsLocationData(deliveryLocation);
        
        // Also set global coordinates for order submission
        window.userLocationCoords = deliveryLocation;
        
        sessionStorage.removeItem('checkoutDeliveryLocation');
      } catch (error) {
        console.error('Error restoring checkout delivery location:', error);
      }
    }

    // Restore notes
    const checkoutNotes = sessionStorage.getItem('checkoutNotes');
    if (checkoutNotes && setValue) {
      try {
        setValue('notes', checkoutNotes);
        sessionStorage.removeItem('checkoutNotes');
      } catch (error) {
        console.error('Error restoring checkout notes:', error);
      }
    }

    // Restore coupon (will need to be validated at checkout)
    const checkoutCoupon = sessionStorage.getItem('checkoutCoupon');
    if (checkoutCoupon) {
      try {
        const coupon = JSON.parse(checkoutCoupon);
        // Store coupon for later validation
        sessionStorage.setItem('pendingCoupon', JSON.stringify(coupon));
        sessionStorage.removeItem('checkoutCoupon');
      } catch (error) {
        console.error('Error restoring checkout coupon:', error);
      }
    }

  }, [setValue, setUserLocation, setManualLocationData, setGpsLocationData]);

  return null;
};

export default useCheckoutRestore; 