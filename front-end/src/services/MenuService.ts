import axios from 'axios';

const API_URL = 'http://localhost:8080/api/menus';  // URL ของ API

export const getMenus = async () => {
  try {
    // console.log('Fetching menus...');  // Log การดึงข้อมูลเมนู
    const response = await axios.get(API_URL);
    const menus = response.data;

    // console.log('Menus fetched successfully:', menus);  // Log ข้อมูลเมนูที่ได้จาก API

    // ดึงข้อมูลหมวดหมู่ทั้งหมด
    // console.log('Fetching categories...');
    const categoriesResponse = await axios.get('http://localhost:8080/api/categories');
    const categories = categoriesResponse.data;

    // console.log('Categories fetched successfully:', categories);  // Log ข้อมูลหมวดหมู่

    // สร้าง object ที่เก็บข้อมูล category_id => category_name สำหรับการเชื่อมโยง
    const categoryMap = categories.reduce((map, category) => {
      map[category.id] = category.name;
      return map;
    }, {});

    // console.log('Category map created:', categoryMap);  // Log category map

    // เพิ่มชื่อหมวดหมู่ให้กับแต่ละเมนู
    const menusWithCategoryNames = menus.map((menu) => ({
      ...menu,
      category_name: categoryMap[menu.category_id] || 'ไม่พบหมวดหมู่' // ใช้ category_id เชื่อมโยงกับชื่อหมวดหมู่
    }));

    // console.log('Menus with category names:', menusWithCategoryNames);  // Log ข้อมูลเมนูพร้อมชื่อหมวดหมู่
    return menusWithCategoryNames;
  } catch (error) {
    console.error('Error fetching menus:', error);  // Log ข้อผิดพลาดในการดึงข้อมูล
    throw error;
  }
};

export const addMenu = async (menu: {
  category_id: number;
  image_url: string;
  name: string;
  description: string;
  price: number;
  status: boolean;
}) => {
  try {
    console.log('Adding menu:', menu); // Log ข้อมูลที่กำลังจะถูกเพิ่ม
    const response = await axios.post(API_URL, menu);
    console.log('Menu added successfully:', response.data); // Log ผลลัพธ์หลังจากเพิ่มเมนู
    return response.data;
  } catch (error) {
    console.error('Error adding menu:', error); // Log ข้อผิดพลาดในกรณีเกิดปัญหาขณะเพิ่มเมนู
    throw error;
  }
};

export const updateMenu = async (id: number, menu: {
  category_id: number;
  image_url: string;
  name: string;
  description: string;
  price: number;
  status: boolean;
}) => {
  try {
    console.log('Updating menu with ID:', id, 'Data:', menu); // Log ข้อมูลเมนูที่จะอัปเดต
    const response = await axios.patch(`${API_URL}/${id}`, menu);
    console.log('Menu updated successfully:', response.data); // Log ผลลัพธ์หลังจากอัปเดตเมนู
    return response.data;
  } catch (error) {
    console.error('Error updating menu:', error); // Log ข้อผิดพลาดในกรณีเกิดปัญหาขณะอัปเดตเมนู
    throw error;
  }
};

export const deleteMenu = async (id: number) => {
  try {
    console.log('Deleting menu with ID:', id); // Log ข้อมูลเมนูที่จะลบ
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log('Menu deleted successfully:', response.data); // Log ผลลัพธ์หลังจากลบเมนู
    return response.data;
  } catch (error) {
    console.error('Error deleting menu:', error); // Log ข้อผิดพลาดในกรณีเกิดปัญหาขณะลบเมนู
    throw error;
  }
};

export const checkDuplicateMenu = async (name: string) => {
  try {
    const response = await axios.get(`${API_URL}?name=${name}`);
    return response.data.length > 0; // ถ้ามีเมนูที่มีชื่อซ้ำ จะส่ง true
  } catch (error) {
    console.error('Error checking duplicate menu:', error);
    throw error;
  }
};

export const getMenuById = async (id: string) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/menus/${id}`);
    return response.data;  // ส่งกลับข้อมูลเมนู
  } catch (error) {
    console.error('Error fetching menu by ID:', error);
    throw error;
  }
};

// ฟังก์ชันอัปเดตสถานะเมนู
export const updateMenuStatus = async (id: number, status: string) => {
  try {
    console.log('Updating menu status with ID:', id, 'New status:', status);
    const response = await axios.patch(`${API_URL}/${id}`, { status });
    console.log('Menu status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating menu status:', error);
    throw error;
  }
};
