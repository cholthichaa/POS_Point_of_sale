import express from 'express';
import {
  getCashiers,
  getCashierById,
  createCashier,
  patchUpdateCashier,
  deleteCashier
} from '../controllers/cashierController';

const router = express.Router();

router.get('/', getCashiers);
router.get('/:id', getCashierById);
router.post('/', createCashier);
router.patch('/:id', patchUpdateCashier);
router.delete('/:id', deleteCashier);

export default router;
