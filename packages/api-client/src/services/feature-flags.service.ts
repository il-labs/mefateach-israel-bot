import { AxiosInstance } from 'axios';
import { FeatureFlag } from '@mifal-israel/shared-types';

export class FeatureFlagsService {
  constructor(private client: AxiosInstance) {}

  async getAll(): Promise<FeatureFlag[]> {
    const { data } = await this.client.get<FeatureFlag[]>('/feature-flags');
    return data;
  }

  async getByName(name: string): Promise<FeatureFlag> {
    const { data } = await this.client.get<FeatureFlag>(`/feature-flags/${name}`);
    return data;
  }

  async update(id: string, isEnabled: boolean): Promise<FeatureFlag> {
    const { data } = await this.client.patch<FeatureFlag>(`/feature-flags/${id}`, { isEnabled });
    return data;
  }
}
