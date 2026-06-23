import { AxiosInstance } from 'axios';
import { RequestStatus } from '@mifal-israel/shared-types';

export interface CreateRequestDto {
  type: string;
  data: any;
}

export interface RequestResponse {
  id: string;
  status: RequestStatus;
  type: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export class RequestsService {
  constructor(private client: AxiosInstance) {}

  async submit(request: CreateRequestDto): Promise<RequestResponse> {
    const { data } = await this.client.post<RequestResponse>('/requests', request);
    return data;
  }

  async getStatus(id: string): Promise<RequestResponse> {
    const { data } = await this.client.get<RequestResponse>(`/requests/${id}`);
    return data;
  }

  async getAll(): Promise<RequestResponse[]> {
    const { data } = await this.client.get<RequestResponse[]>('/requests');
    return data;
  }
}
