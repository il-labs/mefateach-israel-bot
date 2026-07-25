import { logger } from '../utils/logger';

export const checkFeatureFlag = async (
  flagKey: string,
  defaultValue: boolean = true
): Promise<boolean> => {
  try {
    // Standalone bot defaults to true unless specified via environment variable
    const envKey = `FLAG_${flagKey.toUpperCase()}`;
    if (process.env[envKey] !== undefined) {
      return process.env[envKey] === 'true';
    }
    return defaultValue;
  } catch (error) {
    logger.error({ error, flagKey }, 'Error evaluating feature flag');
    return defaultValue;
  }
};
