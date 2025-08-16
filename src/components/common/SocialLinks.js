import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaPinterest, FaWhatsapp, FaTiktok, FaSnapchatGhost, FaLink } from 'react-icons/fa';
import useHomepageSections from '@hooks/useHomepageSections';
import useUtilsFunction from '@hooks/useUtilsFunction';

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
  const { getSection } = useHomepageSections();
  const { showingTranslateValue } = useUtilsFunction();
  const section = getSection('social_links');

  if (!section || !section.isActive) return null;

  const links = section.content?.links || [];

  const formatUrl = (u) => {
    if (!u) return '#';
    return /^https?:\/\//i.test(u) ? u : `https://${u.replace(/^\/+/, '')}`;
  };

  // Different spacing and sizing based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'navigation':
        return {
          container: 'flex space-x-4 sm:space-x-5',
          icon: 'w-8 h-8 sm:w-9 sm:h-9',
          iconSize: 'w-4 h-4 sm:w-5 sm:h-5'
        };
      case 'footer':
        return {
          container: 'flex space-x-3 sm:space-x-4 md:space-x-5',
          icon: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10',
          iconSize: 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6'
        };
      default:
        return {
          container: 'flex space-x-3 sm:space-x-4',
          icon: 'w-8 h-8 sm:w-9 sm:h-9',
          iconSize: 'w-4 h-4 sm:w-5 sm:h-5'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <ul className={`${styles.container} ${className}`}>
      {links.map((item, idx) => {
        const Icon = iconMap[item.iconType] || FaLink;
        return (
          <li key={idx} className={`${styles.icon} rounded-full flex items-center justify-center group transition-all duration-200 hover:scale-105`}>
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