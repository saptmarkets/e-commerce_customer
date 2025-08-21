import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPinterest, FaWhatsapp, FaTiktok, FaSnapchatGhost, FaLink } from 'react-icons/fa';
import useHomepageSections from '@hooks/useHomepageSections';
import useUtilsFunction from '@hooks/useUtilsFunction';
import useTranslation from 'next-translate/useTranslation';

const iconMap = {
  facebook: FaFacebookF,
  twitter: FaTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  pinterest: FaPinterest,
  whatsapp: FaWhatsapp,
  tiktok: FaTiktok,
  snapchat: FaSnapchatGhost,
};

const SocialLinks = ({ className = '', variant = 'default' }) => {
  const { t } = useTranslation();
  const { lang } = useTranslation();
  const { getSection } = useHomepageSections();
  const { showingTranslateValue } = useUtilsFunction();
  const section = getSection('social_links');

  if (!section || !section.isActive) return null;

  const links = section.content?.links || [];
  const isRTL = lang === 'ar';

  const formatUrl = (u) => {
    if (!u) return '#';
    return /^https?:\/\//i.test(u) ? u : `https://${u.replace(/^\/+/, '')}`;
  };

  // Different spacing and sizing based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'navigation':
        return {
          container: 'flex',
          icon: 'w-8 h-8 sm:w-9 sm:h-9',
          iconSize: 'w-4 h-4 sm:w-5 sm:h-5',
          anchor: 'w-8 h-8 sm:w-9 sm:h-9',
          spacing: 'ml-6 sm:ml-8', // More aggressive spacing for navigation
        };
      case 'footer':
        return {
          container: 'flex',
          icon: 'w-1 h-1 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7',
          iconSize: 'w-0.5 h-0.5 sm:w-2.5 h-2.5 md:w-2.5 md:h-2.5 lg:w-3 h-3 xl:w-3.5 xl:h-3.5',
          anchor: 'w-1 h-1 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7',
          spacing: 'ml-10 sm:ml-4 md:ml-4 lg:ml-4 xl:ml-5',
        };
      default:
        return {
          container: 'flex',
          icon: 'w-8 h-8 sm:w-9 sm:h-9',
          iconSize: 'w-4 h-4 sm:w-5 sm:h-5',
          anchor: 'w-8 h-8 sm:w-9 sm:h-9',
          spacing: 'ml-4 sm:ml-5',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <ul className={`${styles.container} flex-row ${className}`} style={{ direction: 'ltr' }}>
      {links.map((item, idx) => {
        const Icon = iconMap[item.iconType] || FaLink;
        // Add explicit margin to each icon except the first one
        const marginClass = idx === 0 ? '' : styles.spacing;
        return (
          <li key={idx} className={`${styles.icon} rounded-full flex items-center justify-center group transition-all duration-200 hover:scale-105 ${marginClass}`}>
            <a 
              href={formatUrl(item.url)} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label={showingTranslateValue(item.label) || item.iconType} 
              className={`${styles.anchor} flex items-center justify-center rounded-full shrink-0 transition-all duration-200`}
              style={{
                backgroundColor: '#74338c'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.querySelector('svg').style.color = '#74338c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#74338c';
                e.currentTarget.querySelector('svg').style.color = '#ffffff';
              }}
            >
              <Icon 
                className={`${styles.iconSize} transition-colors duration-200`}
                style={{ color: '#ffffff' }}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SocialLinks; 