import axios from 'axios';

const API_URL = 'http://localhost:8080/api/zones';  

export const getZones = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log("Zones data received:", response.data);  // ตรวจสอบข้อมูลที่ได้จาก API
    return response.data;
  } catch (error) {
    console.error('Error fetching zones:', error.response ? error.response.data : error.message);  // แสดงข้อผิดพลาดที่ได้รับ
    throw error;
  }
};


// เพิ่มโซนใหม่
export const addZone = async (zoneData: { zoneName: string; status: string }) => {
  try {
    const response = await axios.post(API_URL, zoneData);
    return response.data;
  } catch (error) {
    // เพิ่มการจัดการข้อผิดพลาดที่ละเอียด
    if (error.response) {
      console.error('Error adding zone:', error.response.data); // ข้อผิดพลาดที่เกิดขึ้นจาก API
    } else if (error.request) {
      console.error('No response received:', error.request); // ถ้าไม่มีการตอบกลับจาก API
    } else {
      console.error('Error', error.message); // ข้อผิดพลาดที่เกิดจากการตั้งค่า
    }
    throw error; // ให้โค้ดโปรแกรมรู้ว่ามีข้อผิดพลาดเกิดขึ้น
  }
};

export const updateZone = async (id: number, zoneData: { name: string; status: string }) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, zoneData);
    return response.data;
  } catch (error) {
    console.error('Error updating zone:', error);
    throw error;
  }
};

// ลบโซน
export const deleteZone = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting zone:', error);
    throw error;
  }
};
