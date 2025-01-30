'use client';
import { useEffect } from 'react';

export default function CancelPage() {
  useEffect(() => {
    // Close the window after 3 seconds
    const timer = setTimeout(() => {
      window.close();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="mb-4">This window will close automatically in 3 seconds.</p>
      </div>
    </div>
  );
} 