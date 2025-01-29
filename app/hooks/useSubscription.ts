import { useState, useEffect } from 'react';

export function useSubscription(customerId: string | null) {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!customerId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stripe?customerId=${customerId}`);
        const data = await response.json();
        setHasActiveSubscription(data.hasActiveSubscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSubscription();
  }, [customerId]);

  return { hasActiveSubscription, isLoading };
}