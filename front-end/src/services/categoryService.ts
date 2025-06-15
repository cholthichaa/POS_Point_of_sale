import axios from 'axios';

// API URL สำหรับหมวดหมู่
const API_URL = 'http://localhost:8080/api/categories';

// Function สำหรับดึงข้อมูลหมวดหมู่ทั้งหมด
export const getCategories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // คืนค่าผลลัพธ์จาก API
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Function สำหรับเพิ่มหมวดหมู่
export const addCategory = async (categoryData: { name: string; status: string }) => {
  try {
    const response = await axios.post(API_URL, categoryData);
    return response.data; // คืนค่าผลลัพธ์จาก API
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};
// ฟังก์ชันสำหรับอัปเดตหมวดหมู่
export const updateCategory = async (id: number, updatedCategory: { name: string; status: boolean }) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, updatedCategory, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error.response ? error.response.data : error);
    throw error;
  }
};

// Function สำหรับลบหมวดหมู่
export const deleteCategory = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data; // คืนค่าผลลัพธ์จาก API
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
