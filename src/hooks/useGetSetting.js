import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

//internal import
import SettingServices from "@services/SettingServices";
import { storeCustomization } from "@utils/storeCustomizationSetting";

const useGetSetting = () => {
  const lang = Cookies.get("_lang");
  const [storeCustomizationSetting, setStoreCustomizationSetting] =
    useState(storeCustomization);

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
  } = useQuery({
    queryKey: ["storeCustomization"],
    queryFn: async () => await SettingServices.getStoreCustomizationSetting(),
    staleTime: 2 * 60 * 1000, //cache for 2 minutes instead of 20 minutes
    gcTime: 5 * 60 * 1000, //garbage collection after 5 minutes
    refetchOnWindowFocus: true, //refetch when window gains focus
    refetchOnMount: true, //refetch when component mounts
  });

  // Debug error if any
  useEffect(() => {
    if (error) {
      console.error("API Error in useGetSetting:", error);
    }
  }, [error]);

  // console.log("data", Object.keys(data)?.length > 0, "isFetched", isFetched);

  useEffect(() => {
    if (isFetched && data) {
      setStoreCustomizationSetting(data);
    } else if (isFetched && !data) {
      // Only log once when API fails
      console.log("Using fallback data - no API data available");
      setStoreCustomizationSetting(storeCustomization);
    }

    if (!lang) {
      Cookies.set("_lang", "en", {
        sameSite: "None",
        secure: true,
      });
    }
  }, [data, isFetched, lang]);

  return {
    lang,
    error,
    loading,
    globalSetting,
    storeCustomizationSetting,
  };
};

export default useGetSetting;
