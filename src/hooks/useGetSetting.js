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

  // Fetch base store customization
  const {
    data: baseCustomization,
    error: baseError,
    isFetched: baseFetched,
    isLoading: loading,
  } = useQuery({
    queryKey: ["storeCustomization"],
    queryFn: async () => await SettingServices.getStoreCustomizationSetting(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch About Us from new collection
  const {
    data: aboutUsData,
    error: aboutUsError,
    isFetched: aboutUsFetched,
  } = useQuery({
    queryKey: ["aboutUs"],
    queryFn: async () => await SettingServices.getAboutUs(),
    enabled: !!baseCustomization, // fetch after base is available
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Debug errors if any
  useEffect(() => {
    if (baseError) {
      console.error("🚨 API Error (base customization):", baseError);
    }
    if (aboutUsError) {
      console.error("🚨 API Error (About Us):", aboutUsError);
    }
  }, [baseError, aboutUsError]);

  // Merge logic: put about_us from dedicated collection into the base structure
  useEffect(() => {
    if (baseFetched && baseCustomization) {
      const merged = {
        ...baseCustomization,
        about_us: aboutUsFetched && aboutUsData ? aboutUsData : baseCustomization?.about_us,
      };
      setStoreCustomizationSetting(merged);
    }

    if (!lang) {
      Cookies.set("_lang", "en", {
        sameSite: "None",
        secure: true,
      });
    }
  }, [baseCustomization, baseFetched, aboutUsFetched, aboutUsData, lang]);

  return {
    lang,
    error: baseError || aboutUsError,
    loading,
    globalSetting,
    storeCustomizationSetting,
  };
};

export default useGetSetting;
