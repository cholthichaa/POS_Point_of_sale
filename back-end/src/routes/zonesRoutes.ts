import express from 'express';
import {
  getZones,
  getZoneById,
  createZone,
  patchUpdateZone,
  deleteZone
} from '../controllers/zonesController';

const router = express.Router();

router.get('/', getZones);
router.get('/:id', getZoneById);
router.post('/', createZone);
router.patch('/:id', patchUpdateZone);
router.delete('/:id', deleteZone);

export default router;
