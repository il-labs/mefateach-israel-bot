import prisma from '../prisma';
import { OpenFeature, Client, EvaluationContext } from '@openfeature/server-sdk';

export class FeatureFlagsService {
  private client: Client;

  constructor() {
    this.client = OpenFeature.getClient();
  }

  async getAllFlags() {
    return prisma.featureFlag.findMany();
  }

  async getFlagByKey(key: string) {
    return prisma.featureFlag.findUnique({ where: { key } });
  }

  async createFlag(data: { key: string; value: any; description?: string; enabled?: boolean }) {
    return prisma.featureFlag.create({ data });
  }

  async updateFlag(key: string, data: { value?: any; description?: string; enabled?: boolean }) {
    return prisma.featureFlag.update({
      where: { key },
      data,
    });
  }

  async deleteFlag(key: string) {
    return prisma.featureFlag.delete({ where: { key } });
  }

  async evaluateFlag(key: string, context: EvaluationContext, defaultValue: any) {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    
    if (!flag) {
      return {
        value: defaultValue,
        reason: 'FLAG_NOT_FOUND'
      };
    }

    if (!flag.enabled) {
      return {
        value: defaultValue,
        reason: 'DISABLED'
      };
    }

    // Simple evaluation logic: just return the stored value if enabled
    return {
      value: flag.value,
      reason: 'STATIC',
      variant: 'default'
    };
  }
}
