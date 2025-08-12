export const WISHLIST_STORAGE_KEY = 'wishlistIds';

export const getStoredWishlistIds = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const setStoredWishlistIds = (ids) => {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
    // Notify any listeners in this tab
    window.dispatchEvent(new CustomEvent('wishlist:changed'));
  } catch {
    // ignore
  }
};

export const toggleWishlistId = (productId) => {
  const ids = getStoredWishlistIds();
  const exists = ids.includes(productId);
  const next = exists ? ids.filter((id) => id !== productId) : [...ids, productId];
  setStoredWishlistIds(next);
  return !exists;
};

export const removeWishlistId = (productId) => {
  const ids = getStoredWishlistIds();
  if (!ids.includes(productId)) return;
  setStoredWishlistIds(ids.filter((id) => id !== productId));
};

export const clearWishlist = () => setStoredWishlistIds([]);

import { useEffect, useState } from 'react';

export const useWishlistIds = () => {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    setIds(getStoredWishlistIds());

    const handleChange = () => setIds(getStoredWishlistIds());
    window.addEventListener('storage', handleChange);
    window.addEventListener('wishlist:changed', handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('wishlist:changed', handleChange);
    };
  }, []);

  return { ids, setIds };
}; 