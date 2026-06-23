'use client';

import React from 'react';
import { useFlag } from '@openfeature/react-sdk';

interface FeatureFlagGuardProps {
  flagKey: string;
  defaultValue: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlagGuard: React.FC<FeatureFlagGuardProps> = ({
  flagKey,
  defaultValue,
  children,
  fallback = null,
}) => {
  const { value: isEnabled } = useFlag(flagKey, defaultValue);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
