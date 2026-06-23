import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';

const router = Router();
const controller = new UsersController();

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/discord/:discordId', (req, res) => controller.getByDiscordId(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
