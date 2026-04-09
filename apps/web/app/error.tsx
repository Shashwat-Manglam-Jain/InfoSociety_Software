"use client";

import Link from 'next/link';
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSiteCopy } from "@/shared/i18n/site-copy";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { locale } = useLanguage();
  const copy = getSiteCopy(locale).errorStates;

  return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{copy.genericTitle}</h1>
      <p>{error?.message || copy.genericFallback}</p>
      <button onClick={() => reset()} style={{ marginRight: '1rem' }}>
        {copy.retry}
      </button>
      <Link href="/">{copy.home}</Link>
    </div>
  );
}
