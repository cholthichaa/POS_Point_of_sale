import express from 'express';
import { getCashiers, createCashier, deleteCashier } from '../controllers/userController';

const router = express.Router();

router.get('/', getCashiers);
router.post('/', createCashier);
router.delete('/:id', deleteCashier);

export default router;
