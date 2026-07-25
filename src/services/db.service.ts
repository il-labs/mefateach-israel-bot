import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  discordId: string;
  username: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface RequestRecord {
  id: string;
  userId: string;
  discordId: string;
  username: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  data: {
    subdomain: string;
    targetType: string;
    targetValue: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  requests: RequestRecord[];
}

class DbService {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'db.json');
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    if (!fs.existsSync(this.dbPath)) {
      const initial: DatabaseSchema = { users: [], requests: [] };
      fs.writeFileSync(this.dbPath, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    try {
      const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
      return JSON.parse(fileContent) as DatabaseSchema;
    } catch {
      return { users: [], requests: [] };
    }
  }

  private saveData(): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public getOrCreateUser(discordId: string, username: string): UserRecord {
    let user = this.data.users.find((u) => u.discordId === discordId);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        discordId,
        username,
        role: 'USER',
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(user);
      this.saveData();
    } else if (user.username !== username) {
      user.username = username;
      this.saveData();
    }
    return user;
  }

  public isSubdomainTaken(subdomain: string): boolean {
    const cleanSubdomain = subdomain.trim().toLowerCase();
    return this.data.requests.some(
      (r) =>
        r.data.subdomain.toLowerCase() === cleanSubdomain &&
        (r.status === 'PENDING' || r.status === 'APPROVED')
    );
  }

  public createRequest(params: {
    discordId: string;
    username: string;
    subdomain: string;
    targetType: string;
    targetValue: string;
    description: string;
  }): RequestRecord {
    const user = this.getOrCreateUser(params.discordId, params.username);
    const newRequest: RequestRecord = {
      id: crypto.randomUUID().slice(0, 8),
      userId: user.id,
      discordId: params.discordId,
      username: params.username,
      type: 'SUBDOMAIN',
      status: 'PENDING',
      data: {
        subdomain: params.subdomain.trim().toLowerCase(),
        targetType: params.targetType,
        targetValue: params.targetValue.trim(),
        description: params.description.trim(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.requests.push(newRequest);
    this.saveData();
    return newRequest;
  }

  public getUserRequests(discordId: string): RequestRecord[] {
    return this.data.requests.filter((r) => r.discordId === discordId);
  }

  public getPendingRequests(): RequestRecord[] {
    return this.data.requests.filter((r) => r.status === 'PENDING');
  }

  public updateRequestStatus(
    requestId: string,
    status: 'APPROVED' | 'REJECTED'
  ): RequestRecord | null {
    const request = this.data.requests.find((r) => r.id === requestId);
    if (!request) return null;

    request.status = status;
    request.updatedAt = new Date().toISOString();
    this.saveData();
    return request;
  }

  public getStats() {
    return {
      totalRequests: this.data.requests.length,
      pending: this.data.requests.filter((r) => r.status === 'PENDING').length,
      approved: this.data.requests.filter((r) => r.status === 'APPROVED').length,
      rejected: this.data.requests.filter((r) => r.status === 'REJECTED').length,
    };
  }
}

export const dbService = new DbService();
