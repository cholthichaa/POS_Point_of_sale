import express from 'express';
import {
  getImages,
  getImageById,
  createImage,
  updateImage,
  deleteImage
} from '../controllers/imagesController'; 

const router = express.Router();

router.get('/', getImages);  
router.get('/:id', getImageById);  
router.post('/', createImage);  
router.patch('/:id', updateImage);  
router.delete('/:id', deleteImage); 

export default router;
