// FeedbackModal.jsx - Add this timing logic

import { useState, useEffect } from 'react';

const FEEDBACK_CONFIG = {
  MIN_TIME_ON_PAGE: 75000,        // 75 seconds in milliseconds
  MIN_INTERACTIONS: 3,             // Number of clicks/interactions
  MIN_SCROLL_DEPTH: 50,            // Percentage scrolled
  REPEAT_INTERVAL_DAYS: 45,        // Days before showing again
  SESSION_STORAGE_KEY: 'dashboard_session',
  LOCAL_STORAGE_KEYS: {
    lastShown: 'feedback_modal_last_shown',
    submitted: 'feedback_submitted',
    dismissed: 'feedback_dismissed'
  }
};

export default function FeedbackModal({ isOpen, onClose }) {
  // ... existing state ...

  // Add this useEffect for smart timing
  useEffect(() => {
    // Check if user has already seen/submitted feedback recently
    const lastShown = localStorage.getItem(FEEDBACK_CONFIG.LOCAL_STORAGE_KEYS.lastShown);
    const submitted = localStorage.getItem(FEEDBACK_CONFIG.LOCAL_STORAGE_KEYS.submitted);
    
    if (lastShown) {
      const daysSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      
      // Don't show if within the repeat interval
      if (daysSinceLastShown < FEEDBACK_CONFIG.REPEAT_INTERVAL_DAYS) {
        return;
      }
    }

    // Track session activity
    let timeOnPage = 0;
    let interactionCount = 0;
    let maxScrollDepth = 0;
    let hasTriggered = false;

    // Timer
    const startTime = Date.now();
    const timeCheckInterval = setInterval(() => {
      timeOnPage = Date.now() - startTime;
      checkTriggerConditions();
    }, 1000);

    // Interaction tracking
    const trackInteraction = () => {
      interactionCount++;
      checkTriggerConditions();
    };

    // Scroll tracking
    const trackScroll = () => {
      const scrollPercentage = 
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
      checkTriggerConditions();
    };

    // Check if conditions are met
    const checkTriggerConditions = () => {
      if (hasTriggered) return;

      const timeCondition = timeOnPage >= FEEDBACK_CONFIG.MIN_TIME_ON_PAGE;
      const interactionCondition = interactionCount >= FEEDBACK_CONFIG.MIN_INTERACTIONS;
      const scrollCondition = maxScrollDepth >= FEEDBACK_CONFIG.MIN_SCROLL_DEPTH;

      // Trigger if time is met AND (interactions OR scroll)
      if (timeCondition && (interactionCondition || scrollCondition)) {
        hasTriggered = true;
        setShowFeedback(true);
        
        // Record that we showed the modal
        localStorage.setItem(
          FEEDBACK_CONFIG.LOCAL_STORAGE_KEYS.lastShown, 
          Date.now().toString()
        );
      }
    };

    // Add event listeners
    document.addEventListener('click', trackInteraction);
    document.addEventListener('scroll', trackScroll);

    // Cleanup
    return () => {
      clearInterval(timeCheckInterval);
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('scroll', trackScroll);
    };
  }, []);

  // ... rest of existing code ...
}