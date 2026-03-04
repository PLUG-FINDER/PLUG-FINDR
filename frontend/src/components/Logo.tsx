import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Logo.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'navbar';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  className = '',
  variant = 'default'
}) => {
  const { theme } = useTheme();
  
  const sizeMap = {
    small: { icon: 32, text: '1.25rem', gap: '10px' },
    medium: { icon: 52, text: '1.75rem', gap: '14px' },
    large: { icon: 64, text: '2.25rem', gap: '18px' },
  };

  const dimensions = sizeMap[size];
  const isNavbar = variant === 'navbar';
  const isDark = theme === 'dark';

  // Generate unique IDs for gradients to avoid conflicts
  const gradientId = `iconGrad-${size}-${variant}-${theme}`;
  const glowGradId = `glowGrad-${size}-${variant}-${theme}`;
  const filterId = `glow-${size}-${variant}-${theme}`;

  return (
    <div 
      className={`logo-container ${className} ${isNavbar ? 'logo-navbar' : ''}`} 
      style={{ fontSize: dimensions.text, gap: dimensions.gap }}
    >
      <svg
        className="logo-icon"
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for icon background */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            {isNavbar ? (
              <>
                <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </>
            ) : isDark ? (
              <>
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </>
            )}
          </linearGradient>
          
          {/* Glow gradient */}
          <linearGradient id={glowGradId} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer rounded square */}
        {isNavbar ? (
          <rect 
            width="52" 
            height="52" 
            rx="14" 
            fill={`url(#${gradientId})`} 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="1.2"
          />
        ) : (
          <>
            <rect width="52" height="52" rx="14" fill={`url(#${gradientId})`} />
            <rect width="52" height="52" rx="14" fill={`url(#${glowGradId})`} />
            <rect x="8" y="4" width="36" height="18" rx="9" fill="white" opacity="0.08" />
          </>
        )}

        {/* Location pin body */}
        <circle 
          cx="26" 
          cy="22" 
          r="9" 
          fill="white" 
          filter={!isNavbar ? `url(#${filterId})` : undefined}
        />
        <circle 
          cx="26" 
          cy="22" 
          r="5.5" 
          fill={isNavbar ? "#1a91d1" : `url(#${gradientId})`}
        />
        
        {/* Pin tail */}
        <path 
          d="M26 29 L22 37 Q26 40 30 37 Z" 
          fill="white" 
          opacity={isNavbar ? 1 : 0.95}
        />

        {/* Plug prongs (two small rectangles top of pin) */}
        <rect x="23" y="11" width="2.5" height="5" rx="1.2" fill="white" opacity="0.9" />
        <rect x="26.5" y="11" width="2.5" height="5" rx="1.2" fill="white" opacity="0.9" />

        {/* Signal arcs */}
        <path 
          d="M14 18 Q14 10 26 10 Q38 10 38 18" 
          stroke="white" 
          strokeWidth="1.4" 
          strokeLinecap="round" 
          fill="none" 
          opacity={isNavbar ? 0.4 : 0.3}
        />
        <path 
          d="M18 18 Q18 14 26 14 Q34 14 34 18" 
          stroke="white" 
          strokeWidth="1.4" 
          strokeLinecap="round" 
          fill="none" 
          opacity={isNavbar ? 0.6 : 0.5}
        />
      </svg>
      
      {showText && (
        <div className="logo-text-wrapper">
          <div className={`logotype ${isNavbar ? 'logotype-blue' : isDark ? 'logotype' : 'logotype-dark'}`}>
            <span className="plug">Plug</span>
            <span className="findr">Findr</span>
          </div>
          {size !== 'small' && (
            <div className={`tagline ${isNavbar ? 'tagline-blue-var' : isDark ? 'tagline' : 'tagline-light'}`}>
              Campus Vendor Network
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;




