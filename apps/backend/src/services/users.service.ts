import prisma from '../prisma';

export class UsersService {
  async getAllUsers() {
    return prisma.user.findMany();
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: { discordId?: string; email?: string; name?: string; role?: string }) {
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: { discordId?: string; email?: string; name?: string; role?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
