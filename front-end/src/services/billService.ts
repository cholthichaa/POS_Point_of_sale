import axios from 'axios';

const API_URL = 'http://localhost:8080/api/bills';  

// ดึงข้อมูลบิลทั้งหมด
export const getBills = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log("Bills data received:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching bills:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// ดึงข้อมูลบิลตาม ID
export const getBillById = async (billId) => {
  try {
    const response = await axios.get(`${API_URL}/${billId}`);
    console.log("Bill data received:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching bill:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// เพิ่มบิลใหม่
export const createBill = async (billData) => {
  try {
    const response = await axios.post(API_URL, billData);
    return response.data;
  } catch (error) {
    console.error('Error creating bill:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// อัพเดตบิล
export const updateBill = async (billId, billData) => {
  try {
    const response = await axios.patch(`${API_URL}/${billId}`, billData);
    return response.data;
  } catch (error) {
    console.error('Error updating bill:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// ลบบิล
export const deleteBill = async (billId) => {
  try {
    const response = await axios.delete(`${API_URL}/${billId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bill:', error.response ? error.response.data : error.message);
    throw error;
  }
};
