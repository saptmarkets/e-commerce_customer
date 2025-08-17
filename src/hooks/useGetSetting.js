import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

//internal import
import SettingServices from "@services/SettingServices";
import { storeCustomization } from "@utils/storeCustomizationSetting";

const useGetSetting = () => {
  const lang = Cookies.get("_lang");
  const [storeCustomizationSetting, setStoreCustomizationSetting] =
    useState(null); // Start with null instead of fallback data

  const { data: globalSetting } = useQuery({
    queryKey: ["globalSetting"],
    queryFn: async () => await SettingServices.getGlobalSetting(),
    staleTime: 10 * 60 * 1000, //cache for 10minutes
    gcTime: 15 * 60 * 1000,
  });

  const {
    data,
    error,
    isFetched,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["storeCustomization"],
    queryFn: async () => await SettingServices.getStoreCustomizationSetting(),
    staleTime: 2 * 60 * 1000, //cache for 2 minutes instead of 20 minutes
    gcTime: 5 * 60 * 1000, //garbage collection after 5 minutes
    refetchOnWindowFocus: true, //refetch when window gains focus
    refetchOnMount: true, //refetch when component mounts
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Debug error if any
  useEffect(() => {
    if (error) {
      console.error("🚨 API Error in useGetSetting:", error);
      console.error("🔍 Error details:", {
        message: error.message,
        status: error.status,
        data: error.data
      });
    }
  }, [error]);

  // console.log("data", Object.keys(data)?.length > 0, "isFetched", isFetched);

  useEffect(() => {
    if (isFetched && data) {
      console.log("✅ API data received, updating state");
      setStoreCustomizationSetting(data);
    } else if (isFetched && !data && !loading) {
      // Only log when API fails and we're not loading
      console.log("⚠️ API returned no data - keeping previous state to prevent data loss");
      // Don't set fallback data - it would override real database content
    }

    if (!lang) {
      Cookies.set("_lang", "en", {
        sameSite: "None",
        secure: true,
      });
    }
  }, [data, isFetched, lang, loading]);

  return {
    lang,
    error,
    loading,
    globalSetting,
    storeCustomizationSetting,
    refetch, // Expose refetch function for manual refresh
  };
};

export default useGetSetting;
