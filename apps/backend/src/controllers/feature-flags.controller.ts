import { Request, Response } from 'express';
import { FeatureFlagsService } from '../services/feature-flags.service';

export class FeatureFlagsController {
  private service = new FeatureFlagsService();

  async getAll(req: Request, res: Response) {
    try {
      const flags = await this.service.getAllFlags();
      res.json(flags);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getByKey(req: Request, res: Response) {
    try {
      const flag = await this.service.getFlagByKey(req.params.key);
      if (!flag) return res.status(404).json({ error: 'Flag not found' });
      res.json(flag);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const flag = await this.service.createFlag(req.body);
      res.status(201).json(flag);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const flag = await this.service.updateFlag(req.params.key, req.body);
      res.json(flag);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.deleteFlag(req.params.key);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async evaluate(req: Request, res: Response) {
    try {
      const { flagKey, context, defaultValue } = req.body;
      const result = await this.service.evaluateFlag(flagKey, context, defaultValue);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
