import { Router } from 'express';
import featureFlagRoutes from './feature-flags.routes';
import requestsRoutes from './requests.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/feature-flags', featureFlagRoutes);
router.use('/requests', requestsRoutes);
router.use('/users', usersRoutes);

export default router;
