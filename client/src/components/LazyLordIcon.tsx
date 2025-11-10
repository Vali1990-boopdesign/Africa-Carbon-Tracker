import { useState, useEffect, useRef } from "react";
import { Player } from "@lordicon/react";

interface LazyLordIconProps {
  src: string;
  colors?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function LazyLordIcon({ 
  src, 
  colors,
  size = 48,
  style 
}: LazyLordIconProps) {
  const [iconData, setIconData] = useState<any>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const playerRef = useRef<Player>(null);

  // Fetch icon JSON from CDN
  useEffect(() => {
    const loadIcon = async () => {
      try {
        // Convert public path to CDN URL
        const cdnUrl = `https://cdn.lordicon.com${src}`;
        const response = await fetch(cdnUrl);
        const data = await response.json();
        setIconData(data);
      } catch (error) {
        console.error('Error loading icon:', error);
      }
    };

    loadIcon();
  }, [src]);

  // Play animation on first hover only
  useEffect(() => {
    if (isHovered && !hasPlayed && playerRef.current && iconData) {
      playerRef.current.playFromBeginning();
    }
  }, [isHovered, hasPlayed, iconData]);

  // Handle animation complete
  const handleComplete = () => {
    setHasPlayed(true);
  };

  if (!iconData) {
    return (
      <div 
        className="bg-surface-container-high/20 rounded-lg animate-pulse"
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  // Parse colors string (e.g., "primary:#10b981,secondary:#059669")
  const colorMapping = colors?.split(',').reduce((acc, pair) => {
    const [key, value] = pair.split(':');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {} as Record<string, string>);

  return (
    <div 
      style={{ width: size, height: size, ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Player
        ref={playerRef}
        icon={iconData}
        size={size}
        onComplete={handleComplete}
        colors={colorMapping}
      />
    </div>
  );
}
