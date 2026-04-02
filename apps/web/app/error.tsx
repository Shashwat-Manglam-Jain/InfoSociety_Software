"use client";

import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Something went wrong</h1>
      <p>{error?.message || 'An unexpected error occurred.'}</p>
      <button onClick={() => reset()} style={{ marginRight: '1rem' }}>
        Retry
      </button>
      <Link href="/">Go to Home</Link>
    </div>
  );
}
