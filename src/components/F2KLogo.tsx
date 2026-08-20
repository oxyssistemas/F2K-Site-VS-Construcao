import React, { useEffect, useState } from 'react';
import f2kLogoImg from '../assets/images/f2k_motors_logo_1787016727121.jpg';

interface F2KLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'hero';
  removeBackground?: boolean;
}

// Module-level cache so we process and crop the transparent version only once
let cachedTransparentLogoUrl: string | null = null;

export const F2KLogo: React.FC<F2KLogoProps> = ({ 
  className = '', 
  size = 'md',
  removeBackground = true
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(cachedTransparentLogoUrl || f2kLogoImg || '/f2k-logo.jpg');
  const [isLoaded, setIsLoaded] = useState<boolean>(!!cachedTransparentLogoUrl);

  useEffect(() => {
    if (!removeBackground || cachedTransparentLogoUrl) {
      if (cachedTransparentLogoUrl) setLogoSrc(cachedTransparentLogoUrl);
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = f2kLogoImg || '/f2k-logo.jpg';

    img.onload = () => {
      try {
        const tempCanvas = document.createElement('canvas');
        const rawW = img.naturalWidth || img.width || 600;
        const rawH = img.naturalHeight || img.height || 400;
        tempCanvas.width = rawW;
        tempCanvas.height = rawH;
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
          setIsLoaded(true);
          return;
        }

        tempCtx.drawImage(img, 0, 0, rawW, rawH);
        const imgData = tempCtx.getImageData(0, 0, rawW, rawH);
        const data = imgData.data;

        let minX = rawW;
        let minY = rawH;
        let maxX = 0;
        let maxY = 0;

        // Process pixels to remove black background and find true bounding box
        for (let y = 0; y < rawH; y++) {
          for (let x = 0; x < rawW; x++) {
            const idx = (y * rawW + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            const maxVal = Math.max(r, g, b);
            
            if (maxVal < 18) {
              // Pure black background -> transparent
              data[idx + 3] = 0;
            } else {
              // Track bounding box of actual logo content
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;

              if (maxVal < 65) {
                // Smooth anti-aliased edge
                const alphaFactor = (maxVal - 18) / 47;
                data[idx + 3] = Math.round(alphaFactor * 255);
                
                const boost = 1 / Math.max(alphaFactor, 0.25);
                data[idx] = Math.min(255, Math.round(r * boost * 0.9));
                data[idx + 1] = Math.min(255, Math.round(g * boost * 0.9));
                data[idx + 2] = Math.min(255, Math.round(b * boost * 0.9));
              } else {
                data[idx + 3] = 255;
              }
            }
          }
        }

        tempCtx.putImageData(imgData, 0, 0);

        // If bounding box was found, crop tightly to the logo
        if (maxX > minX && maxY > minY) {
          const padding = 4;
          const cropX = Math.max(0, minX - padding);
          const cropY = Math.max(0, minY - padding);
          const cropW = Math.min(rawW - cropX, (maxX - minX) + padding * 2);
          const cropH = Math.min(rawH - cropY, (maxY - minY) + padding * 2);

          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cropCtx = cropCanvas.getContext('2d');
          
          if (cropCtx) {
            cropCtx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            const transparentUrl = cropCanvas.toDataURL('image/png');
            cachedTransparentLogoUrl = transparentUrl;
            setLogoSrc(transparentUrl);
            setIsLoaded(true);
            return;
          }
        }

        const transparentUrl = tempCanvas.toDataURL('image/png');
        cachedTransparentLogoUrl = transparentUrl;
        setLogoSrc(transparentUrl);
        setIsLoaded(true);
      } catch (err) {
        console.warn('Transparent logo processing error:', err);
        setIsLoaded(true);
      }
    };

    img.onerror = () => {
      setIsLoaded(true);
    };
  }, [removeBackground]);

  // Height scaling classes - refined, harmonious proportions
  const heightClass = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-10',
    lg: 'h-10 sm:h-12 md:h-13',
    xl: 'h-13 sm:h-15 md:h-17',
    '2xl': 'h-16 sm:h-20 md:h-24',
    '3xl': 'h-22 sm:h-26 md:h-30',
    hero: 'h-20 sm:h-24 md:h-28'
  }[size];

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="F2K MOTORS"
        className={`${heightClass} w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] ${
          !isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        referrerPolicy="no-referrer"
        loading="eager"
        style={{
          mixBlendMode: removeBackground && !cachedTransparentLogoUrl ? 'screen' : 'normal'
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/f2k-logo.jpg';
        }}
      />
    </div>
  );
};
