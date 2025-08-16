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
          spacing: 'ml-6 sm:ml-8', // More aggressive spacing for navigation
        };
      case 'footer':
        return {
          container: 'flex',
          icon: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10',
          iconSize: 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6',
          spacing: 'ml-4 sm:ml-5 md:ml-6',
        };
      default:
        return {
          container: 'flex',
          icon: 'w-8 h-8 sm:w-9 sm:h-9',
          iconSize: 'w-4 h-4 sm:w-5 sm:h-5',
          spacing: 'ml-4 sm:ml-5',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <ul className={`${styles.container} ${className}`}>
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
              className="flex items-center justify-center w-full h-full rounded-full transition-all duration-200"
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