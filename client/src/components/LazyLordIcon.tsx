import { useState, useEffect, useRef } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        ref?: React.Ref<any>;
        src?: string;
        trigger?: string;
        colors?: string;
        loading?: 'lazy' | 'interaction' | 'delay';
        style?: React.CSSProperties;
      };
    }
  }
}

interface LazyLordIconProps {
  src: string;
  trigger?: string;
  colors?: string;
  loading?: 'lazy' | 'interaction' | 'delay';
  style?: React.CSSProperties;
}

export function LazyLordIcon({ 
  src, 
  trigger = "hover", 
  colors, 
  loading = "lazy",
  style 
}: LazyLordIconProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const iconRef = useRef<any>(null);

  useEffect(() => {
    const icon = iconRef.current;
    if (!icon) return;

    const handleReady = () => setIsReady(true);
    const handleComplete = () => {
      // After first play, disable further interactions
      setHasPlayed(true);
    };

    icon.addEventListener('ready', handleReady);
    icon.addEventListener('complete', handleComplete);

    return () => {
      icon.removeEventListener('ready', handleReady);
      icon.removeEventListener('complete', handleComplete);
    };
  }, []);

  return (
    <div style={style} className="relative flex items-center justify-center">
      {!isReady && (
        <div 
          className="absolute inset-0 bg-surface-container-high/20 rounded-lg animate-pulse pointer-events-none"
          style={style}
        />
      )}
      <lord-icon 
        ref={iconRef}
        src={src} 
        trigger={hasPlayed ? "none" : trigger}
        colors={colors} 
        loading={loading}
        style={{ 
          ...style, 
          opacity: isReady ? 1 : 0,
          transition: 'opacity 200ms ease-in-out'
        }}
      />
    </div>
  );
}
