import React from 'react';
import officialLogoImg from '../assets/images/regenerated_image_1785635663671.png';

interface DeltaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light' | 'auto';
}

export const DeltaLogo: React.FC<DeltaLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  theme = 'dark',
}) => {
  const sizeMap = {
    sm: { img: 'h-8 md:h-9', text: 'text-base', subText: 'text-[9px]', gap: 'gap-2.5' },
    md: { img: 'h-10 md:h-12', text: 'text-lg md:text-xl', subText: 'text-[11px]', gap: 'gap-3' },
    lg: { img: 'h-12 md:h-14', text: 'text-xl md:text-2xl', subText: 'text-xs', gap: 'gap-3.5' },
    xl: { img: 'h-16 md:h-20', text: 'text-2xl md:text-3xl', subText: 'text-sm', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center select-none ${currentSize.gap} ${className}`}>
      {/* Official Delta Logo Image Badge */}
      <div className="relative flex-shrink-0 bg-white rounded-2xl p-1 shadow-md border border-slate-200/80 overflow-hidden flex items-center justify-center">
        <img
          src={officialLogoImg}
          alt="DELTA Logo"
          className={`${currentSize.img} w-auto object-contain rounded-xl`}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Brand Name Text: Delta Mithapukur */}
      <div className="flex flex-col justify-center">
        <h2 className={`font-black tracking-tight leading-none ${currentSize.text}`}>
          <span className="text-[#005baa]">Delta</span>{' '}
          <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>
            Mithapukur
          </span>
        </h2>
        {showSubtitle && (
          <p className={`font-mono font-semibold tracking-wide uppercase mt-1 leading-none ${currentSize.subText} ${
            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Broadband & NOC
          </p>
        )}
      </div>
    </div>
  );
};
