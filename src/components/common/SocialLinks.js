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
          icon: 'w-4 h-4 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11',
          iconSize: 'w-2 h-2 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-5.5 xl:h-5.5',
          anchor: 'w-4 h-4 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11',
          spacing: 'ml-2 sm:ml-3 md:ml-4 lg:ml-4 xl:ml-5',
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
    <ul className={`${styles.container} flex-row social-links-container ${className}`} style={{ direction: 'ltr' }}>
      {links.map((item, idx) => {
        const Icon = iconMap[item.iconType] || FaLink;
        // Add explicit margin to each icon except the first one
        const marginClass = idx === 0 ? '' : styles.spacing;
        return (
          <li key={idx} className={`${styles.icon} rounded-full flex items-center justify-center group ${marginClass}`}>
            <a 
              href={formatUrl(item.url)} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label={showingTranslateValue(item.label) || item.iconType} 
              className={`${styles.anchor} flex items-center justify-center rounded-full shrink-0 mobile-no-bg`}
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
                className={`${styles.iconSize}`}
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