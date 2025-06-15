import express from 'express';
import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable
} from '../controllers/tablesController';

const router = express.Router();

router.get('/', getTables);
router.get('/:id', getTableById);
router.post('/', createTable);
router.patch('/:id', updateTable);
router.delete('/:id', deleteTable);

export default router;
