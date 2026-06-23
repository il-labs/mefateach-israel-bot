import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';

export class UsersController {
  private service = new UsersService();

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.service.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await this.service.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = await this.service.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = await this.service.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByDiscordId(req: Request, res: Response) {
    try {
      const { discordId } = req.params;
      const users = await this.service.getAllUsers();
      let user = users.find(u => u.discordId === discordId);
      if (!user) {
        user = await this.service.createUser({
          discordId,
          role: 'USER',
          name: req.query.name as string || undefined,
        });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
