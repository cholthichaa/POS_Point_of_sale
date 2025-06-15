import axios from 'axios';

const API_URL = 'http://localhost:8080/api/order';  // Update the URL to your API endpoint

// Fetch all orders
export const fetchOrders = async () => {
  try {
    console.log(`Fetching orders from ${API_URL}`);
    const response = await axios.get(API_URL);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Fetch order by ID
export const getOrderById = async (orderId: string) => {
  try {
    console.log(`Fetching order with ID ${orderId}`);
    const response = await axios.get(`${API_URL}/${orderId}`);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Add a new order
export const addOrder = async (order) => {
  try {
    console.log('Adding order:', order);  // Log the order data being sent
    const response = await axios.post(API_URL, order, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response from API:', response); // Log the response from the API
    if (response.status === 201) {
      console.log('Added order response:', response.data);
      return response.data;  // Assuming the response contains the orderId
    } else {
      console.error('Failed to add order:', response.status, response.data);
    }
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};



// Update an existing order
export const updateOrder = async (id: number, updatedOrder: {
  table_id?: number;
  user_id?: number;
  status?: string;
  order_time?: string;
  order_items?: { menu_id: number; quantity: number; price: number }[];
}) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, updatedOrder);
    console.log('Updated order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order:', error.response ? error.response.data : error.message);
    alert('Error updating order: ' + (error.response ? error.response.data : error.message));
    throw error;
  }

};


// Delete an order
export const deleteOrder = async (id: number) => {
  try {
    console.log(`Deleting order with ID ${id}`);  // Log the ID of the order being deleted
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log('Delete order response:', response.data);  // Log the response data
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Error handling function
const handleError = (error: any) => {
  if (error.response) {
    // Server responded with an error status code
    console.error('Error fetching orders:', error.response.status, error.response.data);
  } else if (error.request) {
    // The request was made, but no response was received
    console.error('Error fetching orders: No response received', error.request);
  } else {
    // Something else went wrong while setting up the request
    console.error('Error fetching orders:', error.message);
  }
  throw error;
};
