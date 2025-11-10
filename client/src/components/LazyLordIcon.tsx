import { useEffect, useRef, useState } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

interface LazyLordIconProps {
  src: string;
  trigger?: string;
  colors?: string;
  style?: React.CSSProperties;
}

export function LazyLordIcon({ src, trigger = "hover", colors, style }: LazyLordIconProps) {
  const [isVisible, setIsVisible] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    if (iconRef.current) {
      observer.observe(iconRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={iconRef} style={style}>
      {isVisible ? (
        <lord-icon src={src} trigger={trigger} colors={colors} style={style} />
      ) : (
        <div style={{ width: "100%", height: "100%", ...style }} className="bg-surface-container-high/30 rounded-lg animate-pulse" />
      )}
    </div>
  );
}
