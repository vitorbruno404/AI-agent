'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      const checkStatus = async () => {
        try {
          // Wait for 2 seconds to allow webhook to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Notify the parent window that checkout is complete
          if (window.opener) {
            window.opener.postMessage('checkout_complete', '*');
          }
          
          // Close this window
          window.close();
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      };

      checkStatus();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
        <p className="mb-4">Payment successful! This window will close automatically.</p>
      </div>
    </div>
  );
} 