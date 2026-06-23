import { CustomProviderServer } from '../provider/custom-provider-server';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CustomProviderServer', () => {
  let provider: CustomProviderServer;

  beforeEach(() => {
    provider = new CustomProviderServer('http://localhost:3001');
    jest.clearAllMocks();
  });

  it('should resolve boolean flag correctly when API succeeds', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { value: true }
    });

    const result = await provider.resolveBooleanEvaluation('enable_bot_commands', false, {});
    expect(result.value).toBe(true);
  });

  it('should fallback to default value when API fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

    const result = await provider.resolveBooleanEvaluation('enable_bot_commands', false, {});
    expect(result.value).toBe(false);
  });
});
