import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { getStats, getAllConfigurations } from '../controllers/admin.controller';

const router = Router();

// Protect all admin routes
router.use(protect, isAdmin);

router.get('/stats', getStats);
router.get('/configurations', getAllConfigurations);

export default router;
