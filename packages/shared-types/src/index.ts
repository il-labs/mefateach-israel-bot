export interface User {
  id: string;
  discordId?: string;
  email?: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag {
  id: string;
  key: string;
  description?: string;
  value: any;
  enabled: boolean;
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES';

export interface Request {
  id: string;
  userId: string;
  status: RequestStatus;
  type: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  userId: string;
  status: 'OPEN' | 'CLOSED';
  subject: string;
  messages: any;
  createdAt: Date;
  updatedAt: Date;
}
