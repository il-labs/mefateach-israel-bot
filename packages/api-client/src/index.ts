import { AxiosInstance } from 'axios';
import { ApiClientConfig, createApiClient } from './client';
import { FeatureFlagsService } from './services/feature-flags.service';
import { RequestsService } from './services/requests.service';

export * from './client';
export * from './services/feature-flags.service';
export * from './services/requests.service';

export class MifalApiClient {
  public featureFlags: FeatureFlagsService;
  public requests: RequestsService;
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = createApiClient(config);
    this.featureFlags = new FeatureFlagsService(this.client);
    this.requests = new RequestsService(this.client);
  }
}
