import { Request, Response } from 'express';
import { RequestsService } from '../services/requests.service';

export class RequestsController {
  private service = new RequestsService();

  async getAll(req: Request, res: Response) {
    try {
      const requests = await this.service.getAllRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const request = await this.service.getRequestById(req.params.id);
      if (!request) return res.status(404).json({ error: 'Request not found' });
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const request = await this.service.createRequest(req.body);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const request = await this.service.updateRequest(req.params.id, req.body);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.deleteRequest(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async validate(req: Request, res: Response) {
    try {
      const { subdomain } = req.body;
      const result = await this.service.validateSubdomain(subdomain);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
