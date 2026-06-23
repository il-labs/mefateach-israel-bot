import { useFlag } from '@openfeature/react-sdk';
import { FlagKeys, FLAG_DEFAULTS } from './flags';

export function useFeatureFlag(flagKey: FlagKeys): boolean {
  const defaultValue = FLAG_DEFAULTS[flagKey];
  const { value } = useFlag(flagKey, defaultValue);
  return !!value;
}
