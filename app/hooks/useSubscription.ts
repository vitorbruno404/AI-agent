import { useState, useEffect } from 'react';

interface TimeSubscription {
  remainingTime: number; // in seconds
  expiresAt: number; // timestamp
}

export function useSubscription(customerId: string | null) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkTimeSubscription() {
      if (!customerId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stripe/time-remaining?customerId=${customerId}`);
        const data: TimeSubscription = await response.json();
        
        if (data.remainingTime > 0 && data.expiresAt > Date.now()) {
          setTimeRemaining(data.remainingTime);
        } else {
          setTimeRemaining(0);
        }
      } catch (error) {
        console.error('Error checking time subscription:', error);
        setTimeRemaining(0);
      } finally {
        setIsLoading(false);
      }
    }

    checkTimeSubscription();
    
    // Set up interval to update remaining time
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [customerId]);

  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return { 
    hasActiveTime: timeRemaining > 0,
    timeRemaining,
    formattedTimeRemaining: formatTimeRemaining(),
    isLoading 
  };
}