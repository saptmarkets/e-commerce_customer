import Cookies from "js-cookie";
import React, { createContext, useEffect, useReducer, useState } from "react";

//internal imports
import { setToken } from "@services/httpServices";

export const UserContext = createContext();

// Safe initial state - same on server and client
const initialState = {
  userInfo: null,
  shippingAddress: {},
  couponInfo: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE_FROM_COOKIES": {
      // Load data from cookies after hydration
      return {
        ...state,
        userInfo: action.payload.userInfo,
        shippingAddress: action.payload.shippingAddress,
        couponInfo: action.payload.couponInfo,
      };
    }

    case "USER_LOGIN": {
      // Set cookie with proper settings
      Cookies.set("userInfo", JSON.stringify(action.payload), {
        expires: 7,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax"
      });
      return { ...state, userInfo: action.payload };
    }

    case "USER_LOGOUT": {
      // Remove all auth-related cookies
      Cookies.remove("userInfo", { path: "/" });
      Cookies.remove("shippingAddress", { path: "/" });
      Cookies.remove("couponInfo", { path: "/" });
      setToken(null);
      return {
        ...state,
        userInfo: null,
        shippingAddress: {},
        couponInfo: {}
      };
    }

    case "SAVE_SHIPPING_ADDRESS": {
      Cookies.set("shippingAddress", JSON.stringify(action.payload), {
        expires: 7,
        path: "/"
      });
      return { ...state, shippingAddress: action.payload };
    }

    case "SAVE_COUPON": {
      Cookies.set("couponInfo", JSON.stringify(action.payload), {
        expires: 7,
        path: "/"
      });
      return { ...state, couponInfo: action.payload };
    }

    default:
      return state;
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from cookies after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userInfo = Cookies.get("userInfo") 
          ? JSON.parse(Cookies.get("userInfo"))
          : null;
        
        const shippingAddress = Cookies.get("shippingAddress")
          ? JSON.parse(Cookies.get("shippingAddress"))
          : {};
        
        const couponInfo = Cookies.get("couponInfo")
          ? JSON.parse(Cookies.get("couponInfo"))
          : {};

        dispatch({
          type: "HYDRATE_FROM_COOKIES",
          payload: { userInfo, shippingAddress, couponInfo }
        });
        
        setIsHydrated(true);
      } catch (error) {
        console.error("Failed to hydrate from cookies:", error);
        setIsHydrated(true);
      }
    }
  }, []);

  // Set token on startup and when userInfo changes
  useEffect(() => {
    if (state.userInfo?.token) {
      setToken(state.userInfo.token);
    }
  }, [state.userInfo]);

  // Check cookie expiry periodically (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    const checkCookie = () => {
      const userInfo = Cookies.get("userInfo");
      if (!userInfo && state.userInfo) {
        // Cookie expired, logout user
        dispatch({ type: "USER_LOGOUT" });
      }
    };

    // Check every 5 minutes instead of every minute to reduce server load
    const interval = setInterval(checkCookie, 300000);
    return () => clearInterval(interval);
  }, [state.userInfo, isHydrated]);

  const value = { state, dispatch, isHydrated };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
