import axios from 'axios';

const API_URL = 'http://localhost:8080/api/cashiers';

// Function to get the token from localStorage dynamically
const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token not found');
  }
  return token;
};

// Helper function to add the Authorization header if the token exists
const getAuthHeaders = () => {
  const token = getToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  } else {
    console.error('Authorization token is missing');
    window.location.href = '/login';  // Redirect to login or handle as per your use case
    return {};
  }
};

// Helper function for handling API responses
const handleResponse = (response) => {
  console.log('API Response:', response.data);
  return response.data;
};

export const getCashiers = async () => {
  console.log("Fetching cashiers...");
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeaders(),
    });
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching cashiers:", error);
    throw error;
  }
};

// Function to create a new cashier
export const createCashier = async (data) => {
  console.log('Creating a new cashier:', data);
  try {
    const response = await axios.post(API_URL, data, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating cashier:', error);
    throw error;
  }
};

// Function to update a cashier
export const updateCashier = async (id, data) => {
  console.log(`Updating cashier with ID ${id}:`, data);
  try {
    const response = await axios.patch(`${API_URL}/${id}`, data, {  // Change PUT to PATCH here
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating cashier with ID ${id}:`, error);
    throw error;
  }
};

// Function to delete a cashier
export const deleteCashier = async (id) => {
  console.log(`Deleting cashier with ID ${id}...`);
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting cashier with ID ${id}:`, error);
    throw error;
  }
};

// Optional: Function to refresh the token (if your backend supports it)
export const refreshToken = async () => {
  console.log('Refreshing token...');
  try {
    const response = await axios.post('/api/refresh-token', {
      headers: getAuthHeaders(),
    });
    localStorage.setItem('token', response.data.token);  // Update the token
    return response.data.token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    window.location.href = '/login';  // Redirect to login on token refresh failure
    throw error;
  }
};

export const getCashierById = async (id) => {
  const url = `${API_URL}/${id}`;
  console.log('Requesting cashier with user_id:', id);  // ตรวจสอบ ID ที่ส่งไป
  try {
    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });
    // console.log('📦 Response from API:', response); // ตรวจสอบข้อมูลที่ตอบกลับ
    return response.data;
  } catch (error) {
    if (error.response) {
      // This is an HTTP error response from the server
      console.error(`API Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      // No response received from the server
      console.error('No response received from the server.');
    } else {
      // Something went wrong in setting up the request
      console.error('Error during request:', error.message);
    }
    throw error;
  }
};

