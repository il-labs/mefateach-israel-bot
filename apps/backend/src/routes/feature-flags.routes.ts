import { Router } from 'express';
import { FeatureFlagsController } from '../controllers/feature-flags.controller';

const router = Router();
const controller = new FeatureFlagsController();

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:key', (req, res) => controller.getByKey(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:key', (req, res) => controller.update(req, res));
router.delete('/:key', (req, res) => controller.delete(req, res));
router.post('/evaluate', (req, res) => controller.evaluate(req, res));

export default router;
