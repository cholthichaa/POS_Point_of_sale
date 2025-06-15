import express from 'express';
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
} from '../controllers/billsController';

const router = express.Router();

router.get('/', getBills);
router.get('/:id', getBillById);  
router.post('/', createBill);
router.patch('/:id', updateBill);
router.delete('/:id', deleteBill);

export default router;
