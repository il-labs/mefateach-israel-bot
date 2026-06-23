import { OpenFeature, EvaluationContext } from '@openfeature/server-sdk';
import { logger } from '@mifal-israel/utils';

export const checkFeatureFlag = async (
  flagKey: string,
  defaultValue: boolean,
  context: EvaluationContext = {}
): Promise<boolean> => {
  try {
    const client = OpenFeature.getClient();
    return await client.getBooleanValue(flagKey, defaultValue, context);
  } catch (error) {
    logger.error({ error, flagKey }, 'Error evaluating feature flag');
    return defaultValue;
  }
};
