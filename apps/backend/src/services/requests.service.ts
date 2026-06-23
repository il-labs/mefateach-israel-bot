import prisma from '../prisma';
import punycode from 'punycode';

export class RequestsService {
  async getAllRequests() {
    return prisma.request.findMany({ include: { user: true } });
  }

  async getRequestById(id: string) {
    return prisma.request.findUnique({ where: { id }, include: { user: true } });
  }

  async createRequest(data: { userId: string; type: string; data: any; status?: string }) {
    return prisma.request.create({ data });
  }

  async updateRequest(id: string, data: { status?: string; type?: string; data?: any }) {
    return prisma.request.update({
      where: { id },
      data,
    });
  }

  async deleteRequest(id: string) {
    return prisma.request.delete({ where: { id } });
  }

  async validateSubdomain(subdomain: string): Promise<{ valid: boolean; error?: string; code?: string }> {
    if (!subdomain) {
      return { valid: false, error: 'שם הדומיין אינו יכול להיות ריק', code: 'EMPTY' };
    }

    let normalized = subdomain.trim().toLowerCase();

    // Convert Unicode Hebrew to Punycode
    if (/[^\x00-\x7F]/.test(normalized)) {
      try {
        normalized = punycode.toASCII(normalized);
      } catch (e) {
        return { valid: false, error: 'שם הדומיין בעברית אינו תקין', code: 'INVALID_CHARACTERS' };
      }
    }

    // Check pattern (Punycode / English alphanumeric and dashes)
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!regex.test(normalized)) {
      return { valid: false, error: 'שם הדומיין יכול להכיל אותיות באנגלית, מספרים, מקפים ותווים בעברית בלבד, ואינו יכול להתחיל או להסתיים במקף', code: 'INVALID_CHARACTERS' };
    }

    if (normalized.length < 3 || normalized.length > 63) {
      return { valid: false, error: 'אורך הדומיין חייב להיות בין 3 ל-63 תווים', code: 'INVALID_LENGTH' };
    }

    // Reserved names check
    const reserved = ['admin', 'www', 'mail', 'api', 'blog', 'dev', 'status', 'test', 'moderator', 'mefateach', 'mifal', 'root', 'security', 'support', 'help', 'dns'];
    if (reserved.includes(normalized)) {
      return { valid: false, error: 'שם דומיין זה שמור לשימוש המערכת בלבד', code: 'RESERVED' };
    }

    // Check if already taken in database (APPROVED or PENDING requests)
    const existing = await prisma.request.findFirst({
      where: {
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    // Check JSON content manually or dynamically
    if (existing) {
      const allRequests = await prisma.request.findMany();
      const isTaken = allRequests.some(r => {
        const reqData = r.data as any;
        if (!reqData || typeof reqData.subdomain !== 'string') return false;
        
        let storedSub = reqData.subdomain.toLowerCase().trim();
        if (/[^\x00-\x7F]/.test(storedSub)) {
          try {
            storedSub = punycode.toASCII(storedSub);
          } catch (e) {}
        }

        return (r.status === 'PENDING' || r.status === 'APPROVED') && 
               storedSub === normalized;
      });

      if (isTaken) {
        return { valid: false, error: 'שם דומיין זה כבר תפוס או נמצא בתהליך בדיקה', code: 'ALREADY_TAKEN' };
      }
    }

    return { valid: true };
  }
}
