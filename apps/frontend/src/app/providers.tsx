'use client';

import React from 'react';
import { OpenFeatureProvider } from "@openfeature/react-sdk";
import { OpenFeature } from "@openfeature/web-sdk";
import { CustomProviderWeb } from "@mifal-israel/feature-flags/dist/provider/custom-provider-web";

// Determine backend URL for client-side API calls
const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Initialize OpenFeature on the client side
if (typeof window !== "undefined") {
  OpenFeature.setProvider(new CustomProviderWeb(backendUrl));
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OpenFeatureProvider>
      {children}
    </OpenFeatureProvider>
  );
}
