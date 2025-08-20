// New responsive version
import React, { useMemo } from "react";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ScaleIcon,
  LightBulbIcon,
  UserGroupIcon,
  ClipboardListIcon,
  CogIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/solid";

// internal
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";

const SectionBox = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow p-6 md:p-8 ${className}`}>{children}</div>
);

// Always show English content helper
const getEn = (value) => {
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "en")) {
    return value.en || "";
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
};

const icons = [
  ShieldCheckIcon,
  DocumentTextIcon,
  ScaleIcon,
  LightBulbIcon,
  UserGroupIcon,
  ClipboardListIcon,
  CogIcon,
  ExclamationCircleIcon,
];

const tints = [
  "emerald",
  "sky",
  "indigo",
  "amber",
  "purple",
  "rose",
  "teal",
  "orange",
];

const words = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
];

const TermsAndConditions = () => {
  const { storeCustomizationSetting, loading } = useGetSetting();
  const tc = storeCustomizationSetting?.term_and_condition || {};

  const sections = useMemo(() => {
    return words
      .map((w, i) => {
        const title = getEn(tc[`section_${w}_title`]);
        const body = getEn(tc[`section_${w}_body`]);
        return title ? { title, body, idx: i } : null;
      })
      .filter(Boolean);
  }, [tc]);

  const brandColor =
    storeCustomizationSetting?.brand_color ||
    storeCustomizationSetting?.settings?.brand_color ||
    "#059669";

  return (
    <Layout title="Terms & Conditions" description="SAPT Markets legal info">
      {/* hero */}
      {(() => {
        const hasBg = tc.header_bg;
        const bgStyle = hasBg
          ? {
              backgroundImage: `url(${tc.header_bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {};
        const bgClasses = hasBg
          ? ""
          : "bg-gradient-to-br from-green-50 to-emerald-100";
        return (
          <div
            className={`${bgClasses} relative py-20 text-center px-4`}
            style={bgStyle}
          >
            {hasBg && (
              <div className="absolute inset-0 bg-white/60 backdrop-brightness-95"></div>
            )}
            <div className="relative">
              <h1 className="text-4xl md:text-6xl font-bold text-emerald-900 mb-4">
                {getEn(tc.title)}
              </h1>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                {getEn(tc.subtitle)}
              </p>
            </div>
          </div>
        );
      })()}

      {/* body */}
      <div className="bg-[#F5F1FA] w-full px-4 pb-20 pt-12">
        <SectionBox className="max-w-screen-2xl mx-auto">
          {/* ribbons */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-emerald-900" style={{ background: brandColor + "1A" }}>
              <span className="font-semibold">{getEn(tc.effective_date_label)}</span>
              <span>{getEn(tc.effective_date)}</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-emerald-900" style={{ background: brandColor + "1A" }}>
              <span className="font-semibold">{getEn(tc.last_updated_label)}</span>
              <span>{getEn(tc.last_updated)}</span>
            </div>
          </div>

          {/* grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {sections.map(({ title, body, idx }) => {
              const Icon = icons[idx % icons.length];
              const tint = tints[idx % tints.length];
              return (
                <div key={idx} className="flex items-start space-x-4 bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <div className={`w-12 h-12 bg-${tint}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 text-${tint}-600`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-800 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* rich description */}
          {getEn(tc.description) && (
            <div className="prose max-w-none mt-10" dangerouslySetInnerHTML={{ __html: getEn(tc.description) }} />
          )}
        </SectionBox>

        {/* CTA */}
        {(getEn(tc.cta_title) || getEn(tc.cta_desc)) && (
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-3xl p-10 md:p-14 mt-16 text-center max-w-screen-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {getEn(tc.cta_title)}
            </h3>
            <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
              {getEn(tc.cta_desc)}
            </p>
            {getEn(tc.cta_btn_text) && (
              <a
                href={getEn(tc.cta_btn_link) || "#"}
                className="inline-block bg-white text-emerald-800 font-semibold px-10 py-4 rounded-xl shadow hover:shadow-lg transition"
              >
                {getEn(tc.cta_btn_text)}
              </a>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TermsAndConditions;
