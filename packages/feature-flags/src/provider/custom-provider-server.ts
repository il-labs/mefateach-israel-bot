import {
  Provider,
  ResolutionDetails,
  EvaluationContext,
  JsonValue,
  ResolutionReason,
  ErrorCode,
} from '@openfeature/server-sdk';
import axios from 'axios';

export class CustomProviderServer implements Provider {
  readonly metadata = {
    name: 'CustomProviderServer',
  } as const;

  constructor(private readonly backendUrl: string) {}

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    return this.evaluate<boolean>(flagKey, defaultValue, context);
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext
  ): Promise<ResolutionDetails<string>> {
    return this.evaluate<string>(flagKey, defaultValue, context);
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext
  ): Promise<ResolutionDetails<number>> {
    return this.evaluate<number>(flagKey, defaultValue, context);
  }

  async resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext
  ): Promise<ResolutionDetails<T>> {
    return this.evaluate<T>(flagKey, defaultValue, context);
  }

  private async evaluate<T>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext
  ): Promise<ResolutionDetails<T>> {
    try {
      // Fix endpoint from /api/v1/... to /api/...
      const response = await axios.post(`${this.backendUrl}/api/feature-flags/evaluate`, {
        flagKey,
        context: {
          targetingKey: context.targetingKey,
          userId: context.userId || context.targetingKey,
          role: context.role,
          environment: context.environment,
          ...context,
        },
      });

      return {
        value: (response.data.value as T) ?? defaultValue,
        reason: (response.data.reason as ResolutionReason) || 'STATIC',
        variant: response.data.variant,
      };
    } catch (error) {
      return {
        value: defaultValue,
        reason: 'ERROR',
        errorCode: ErrorCode.GENERAL,
      };
    }
  }
}
