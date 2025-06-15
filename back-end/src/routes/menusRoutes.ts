import express from 'express';
import {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menusController'; // ใช้ controller สำหรับจัดการ business logic

const router = express.Router();

// กำหนดเส้นทางต่าง ๆ สำหรับเมนู
router.get('/', getMenus); // ดึงข้อมูลเมนูทั้งหมด
router.get('/:id', getMenuById); // ดึงเมนูตาม id
router.post('/', createMenu); // เพิ่มเมนูใหม่
router.patch('/:id', updateMenu); // อัปเดตเมนู
router.delete('/:id', deleteMenu); // ลบเมนู

export default router;
