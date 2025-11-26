import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getSettings, updateSettings } from '../controllers/settings.controller';

const router = Router();

router.use(protect);

router.get('/', getSettings);
router.post('/', updateSettings);

export default router;