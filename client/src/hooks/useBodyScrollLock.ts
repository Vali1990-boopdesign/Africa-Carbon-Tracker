import { useEffect } from "react";

/**
 * Custom hook to manage body scroll locking
 * Prevents conflicts when multiple components try to lock body scroll
 * Uses a counter to track how many components are requesting scroll lock
 */

let lockCount = 0;
const originalOverflow = document.body.style.overflow;

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // Increment lock count
      lockCount += 1;
      
      // Only set overflow on first lock
      if (lockCount === 1) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      if (isLocked) {
        // Decrement lock count
        lockCount -= 1;
        
        // Only restore overflow when all locks are released
        if (lockCount === 0) {
          document.body.style.overflow = originalOverflow || 'unset';
        }
      }
    };
  }, [isLocked]);
}
