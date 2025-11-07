import { useEffect, useRef } from 'react';
import { trackEngagement, trackDataExplored, trackReferrer } from '@/lib/analytics';

interface EngagementThresholds {
  30: boolean;
  120: boolean;
  300: boolean;
}

export function useAnalytics() {
  const engagementTimeRef = useRef(0);
  const thresholdsRef = useRef<EngagementThresholds>({
    30: false,
    120: false,
    300: false
  });
  const hasInteractedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const referrer = document.referrer;
    if (referrer.includes('thecatalystfund.com')) {
      trackReferrer(referrer, 'carbon_modules_report');
    }

    intervalRef.current = setInterval(() => {
      engagementTimeRef.current += 10;

      const thresholds = thresholdsRef.current;
      Object.keys(thresholds).forEach((threshold) => {
        const thresholdNum = parseInt(threshold) as keyof EngagementThresholds;
        if (
          engagementTimeRef.current >= thresholdNum &&
          !thresholds[thresholdNum]
        ) {
          const level = thresholdNum >= 120 ? 'high' : thresholdNum >= 30 ? 'medium' : 'low';
          trackEngagement(thresholdNum, level);
          thresholds[thresholdNum] = true;
        }
      });
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const markUserAsEngaged = () => {
    if (!hasInteractedRef.current) {
      trackDataExplored(engagementTimeRef.current);
      hasInteractedRef.current = true;
    }
  };

  return {
    markUserAsEngaged,
    engagementTime: engagementTimeRef.current
  };
}
