'use client';
import { useState } from 'react';

interface PurchaseButtonProps {
  duration: number;
  price: string;
}

export default function PurchaseButton({ duration, price }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchaseTime = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/create-time-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration }),
      });

      const data = await response.json();

      if (data.url) {
        // Open Stripe checkout in a new tab
        const checkoutWindow = window.open(data.url, '_blank');
        
        // Listen for messages from the success page
        window.addEventListener('message', function(event) {
          // Make sure the message is from our success page
          if (event.data === 'checkout_complete') {
            // Close the checkout window
            checkoutWindow?.close();
            
            // Notify the parent website (vitorbruno.com)
            if (window.parent !== window) {
              window.parent.postMessage('ai_time_purchased', '*');
            }
            
            // Refresh the AI agent interface
            window.location.reload();
          }
        });
      }
    } catch (error) {
      console.error('Error in handlePurchaseTime:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchaseTime}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {isLoading ? 'Processing...' : `${duration} minutes - ${price}`}
    </button>
  );
} 