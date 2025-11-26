import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { 
    getConfigurations, 
    createConfiguration, 
    updateConfiguration, 
    deleteConfiguration 
} from '../controllers/configuration.controller';

const router = Router();

// All configuration routes are protected
router.use(protect);

router.get('/', getConfigurations);
router.post('/', createConfiguration);
router.put('/:id', updateConfiguration);
router.delete('/:id', deleteConfiguration);


export default router;