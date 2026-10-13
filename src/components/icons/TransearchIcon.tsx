import React from 'react';

interface TransearchIconProps {
  className?: string;
}

export const TransearchIcon: React.FC<TransearchIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Circle Background - Premium Executive Dark Navy */}
      <circle cx="50" cy="50" r="40" fill="#0D1B2A" />
      
      {/* Concentric global leadership rings in gold */}
      <circle cx="50" cy="50" r="30" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 2" />
      <circle cx="50" cy="50" r="22" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.6" />
      
      {/* Vertical axis line representing precision and target search */}
      <line x1="50" y1="20" x2="50" y2="80" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="20" y1="50" x2="80" y2="50" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Styled T for TRANSEARCH with search/loupe integration */}
      <path 
        d="M34 38H66" 
        stroke="#D4AF37" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      <path 
        d="M50 38V66" 
        stroke="#D4AF37" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      
      {/* Small dot/spark at the top-right of T representing leadership/success */}
      <circle cx="66" cy="32" r="3" fill="#D4AF37" />
    </svg>
  );
};
