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

const SocialLinks = ({ className = '' }) => {
  const { getSection } = useHomepageSections();
  const { showingTranslateValue } = useUtilsFunction();
  const section = getSection('social_links');

  if (!section || !section.isActive) return null;

  const links = section.content?.links || [];

  const formatUrl = (u) => {
    if (!u) return '#';
    return /^https?:\/\//i.test(u) ? u : `https://${u.replace(/^\/+/, '')}`;
  };

  return (
    <ul className={`flex space-x-3 ${className}`}>
      {links.map((item, idx) => {
        const Icon = iconMap[item.iconType] || FaLink;
        return (
          <li key={idx} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group transition-all duration-200 hover:scale-105">
            <a 
              href={formatUrl(item.url)} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label={showingTranslateValue(item.label) || item.iconType} 
              className="flex items-center justify-center w-full h-full rounded-full transition-all duration-200"
              style={{
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: '#74338c' }
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#74338c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Icon 
                className="w-4 h-4 transition-colors duration-200" 
                style={{ color: '#6b7280' }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#6b7280'}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SocialLinks; 