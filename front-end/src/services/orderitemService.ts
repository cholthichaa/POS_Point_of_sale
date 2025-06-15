import axios from 'axios';

const API_URL = 'http://localhost:8080/api/order_items';  // URL สำหรับการเข้าถึง order_items API

export const fetchOrderItemsByOrderId = async (orderId: string) => {
  try {
    const response = await axios.get(`${API_URL}?orderId=${orderId}`);  // API call with query params
    console.log('Fetched order items:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order items:', error);
    throw error;
  }
};
// Add a new order item
export const addOrderItem = async (orderItem: { order_id: number; menu_id: number; quantity: number; price: number }) => {
  try {
    const response = await axios.post(API_URL, orderItem);
    console.log('Added order item:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding order item:', error);
    throw error;
  }
};

// Update an existing order item
export const updateOrderItem = async (id: number, updatedOrderItem: { quantity: number; price: number }) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, updatedOrderItem);
    console.log('Updated order item:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order item:', error);
    throw error;
  }
};

// Delete an order item
export const deleteOrderItem = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log('Deleted order item:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting order item:', error);
    throw error;
  }
};

