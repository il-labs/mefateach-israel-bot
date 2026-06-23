import {
  Provider,
  ResolutionDetails,
  EvaluationContext,
  JsonValue,
  ErrorCode,
} from '@openfeature/web-sdk';
import axios from 'axios';

export class CustomProviderWeb implements Provider {
  readonly metadata = {
    name: 'CustomProviderWeb',
  } as const;

  private flags: Record<string, { value: any; enabled: boolean }> = {};

  constructor(private readonly backendUrl: string) {}

  async initialize(context?: EvaluationContext): Promise<void> {
    try {
      const response = await axios.get(`${this.backendUrl}/api/feature-flags`);
      const flagsArray = response.data;
      if (Array.isArray(flagsArray)) {
        this.flags = {};
        for (const flag of flagsArray) {
          this.flags[flag.key] = {
            value: flag.value,
            enabled: flag.enabled,
          };
        }
      }
    } catch (error) {
      // Log or handle error if needed
    }
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean
  ): ResolutionDetails<boolean> {
    return this.evaluate<boolean>(flagKey, defaultValue);
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string
  ): ResolutionDetails<string> {
    return this.evaluate<string>(flagKey, defaultValue);
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number
  ): ResolutionDetails<number> {
    return this.evaluate<number>(flagKey, defaultValue);
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T
  ): ResolutionDetails<T> {
    return this.evaluate<T>(flagKey, defaultValue);
  }

  private evaluate<T>(flagKey: string, defaultValue: T): ResolutionDetails<T> {
    const flag = this.flags[flagKey];
    if (!flag) {
      return {
        value: defaultValue,
        reason: 'ERROR',
        errorCode: ErrorCode.FLAG_NOT_FOUND,
      };
    }

    if (!flag.enabled) {
      return {
        value: defaultValue,
        reason: 'DISABLED',
      };
    }

    return {
      value: flag.value as T,
      reason: 'STATIC',
      variant: 'default',
    };
  }
}
