"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdsenseBanner() {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  useEffect(() => {
    if (!adClient || !adSlot) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ignore ad script race conditions.
    }
  }, [adClient, adSlot]);

  if (!adClient || !adSlot) {
    return null;
  }

  return (
    <>
      <Script
        id="google-adsense"
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "120px" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
}
