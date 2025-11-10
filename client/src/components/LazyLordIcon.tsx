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

  // Fetch icon JSON from public folder
  useEffect(() => {
    const loadIcon = async () => {
      try {
        const response = await fetch(src);
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
        colors={colors}
      />
    </div>
  );
}
