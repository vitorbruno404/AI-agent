'use client';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function SuccessContent() {
  const router = useRouter();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    
    if (sessionId) {
      setTimeout(() => {
        router.push('/');
      }, 5000);
    }
  }, [router]);

  return (
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
      <p className="mb-4">Your time has been added to your account.</p>
      <p>Redirecting you back to the chat...</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Suspense fallback={
        <div className="text-white">
          Loading...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
} 