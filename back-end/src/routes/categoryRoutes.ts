import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  patchUpdateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.patch('/:id', patchUpdateCategory);
router.delete('/:id', deleteCategory);

export default router;
