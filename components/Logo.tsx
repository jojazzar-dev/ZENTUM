import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      {/* تصميم شعار ZENTUM الذهبي الاحترافي */}
      <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* الدائرة التقنية الخارجية */}
        <circle cx="256" cy="256" r="230" stroke="#F3BA2F" stroke-width="10" stroke-dasharray="40 25" opacity="0.3" />
        
        {/* خلفية الشعار */}
        <circle cx="256" cy="256" r="200" fill="#181A20" stroke="#F3BA2F" stroke-width="2" />
        
        {/* حرف Z بأسلوب هندسي حديث */}
        <path 
          d="M160 180H352L160 332H352" 
          stroke="#F3BA2F" 
          stroke-width="50" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
        />
        
        {/* نقاط الإضاءة التكنولوجية */}
        <circle cx="352" cy="180" r="15" fill="#F3BA2F" />
        <circle cx="160" cy="332" r="15" fill="#F3BA2F" />
      </svg>
    </div>
  );
};

export default Logo;