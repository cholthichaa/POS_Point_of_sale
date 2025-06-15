import axios from 'axios';

const API_URL = 'http://localhost:8080/api/table';  

// Fetch tables by zone
export const fetchTables = async (zone) => {
  try {
    const url = zone ? `${API_URL}?zone=${zone}` : API_URL;  // ถ้ามี zone ก็กำหนดให้เป็น query parameter
    console.log(`Fetching tables from ${url}`);
    const response = await axios.get(url);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error fetching tables:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Error fetching tables: No response received', error.request);
    } else {
      console.error('Error fetching tables:', error.message);
    }
    throw error;
  }
};


// ฟังก์ชันอื่นๆ ยังคงเหมือนเดิม
export const addTable = async (table: { tableNumber: string; zone: string; status: boolean }) => {
  try {
    console.log(`Adding table:`, table);
    const response = await axios.post(API_URL, table);
    console.log('Added table response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding table:', error);
    throw error;
  }
};

export const updateTable = async (id: number, updatedTable: { tableNumber: string; zone: string; status: boolean }) => {
  try {
    console.log(`Updating table with ID ${id}:`, updatedTable);
    const response = await axios.put(`${API_URL}/${id}`, updatedTable);
    console.log('Updated table response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating table:', error);
    throw error;
  }
};

export const deleteTable = async (id: number) => {
  try {
    console.log(`Deleting table with ID ${id}`);
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log('Delete table response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting table:', error);
    throw error;
  }
};

export const getTableById = async (tableId: string) => {
  try {
    const response = await axios.get(`${API_URL}/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching table:', error);
    throw error;
  }
};
