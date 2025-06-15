import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenus } from '../services/MenuService.ts';
import { fetchTables } from '../services/tableService.ts';
import { addOrder, updateOrder, getOrderById } from '../services/orderService.ts';  // เพิ่ม updateOrder, getOrderById
import { getCategories } from '../services/categoryService.ts';
import Swal from 'sweetalert2';  // Import SweetAlert2

export default function FoodOrder() {
  const { orderId } = useParams();  // ดึง orderId จาก URL
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createOrder, setCreateOrder] = useState([]);
  const [table_number, setTableName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // เพิ่ม error message สำหรับการแสดงข้อผิดพลาด
  const navigate = useNavigate();  // Initialize navigate in the component scope, not inside any function

  useEffect(() => {
    const fetchMenusAndCategories = async () => {
      try {
        // ดึงเมนูทั้งหมด
        const fetchedMenus = await getMenus();
        console.log('Fetched Menus:', fetchedMenus);
        setMenus(fetchedMenus);

        // ดึงหมวดหมู่ของเมนู
        const fetchedCategories = await getCategories();
        console.log('Fetched Categories:', fetchedCategories);
        setCategories([{ id: 'all', name: 'ทั้งหมด' }, ...fetchedCategories]);

        // ถ้ามี orderId ใช้ orderId เพื่อดึงข้อมูลออเดอร์
        if (orderId) {
          const orderData = await getOrderById(orderId);
          console.log('Fetched Order:', orderData);

          // ดึงข้อมูลโต๊ะจาก tableService
          const tablesResponse = await fetchTables();
          const selectedTable = tablesResponse.find(table => table.id === orderData.table_id);
          if (selectedTable) {
            setTableName(selectedTable.table_number);  // เก็บเลขโต๊ะ
          }

          // แสดงรายการอาหารในออเดอร์นั้น
          setCreateOrder(orderData.order_items.map(item => ({
            id: item.menu_id,
            name: item.menu_name,
            qty: item.quantity,
            price: item.price,
          })));
        }
      } catch (error) {
        console.error('Error fetching menus, categories, or order:', error);
        setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    };
    fetchMenusAndCategories();
  }, [orderId]);  // เรียกใหม่เมื่อ orderId เปลี่ยน

  const addItem = (food) => {
    setCreateOrder(prev => {
      const existing = prev.find(item => item.id === food.id);
      if (existing) {
        return prev.map(item => item.id === food.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: food.id, name: food.name, qty: 1, price: food.price }];
    });
  };

  const totalPrice = createOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const saveOrder = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Please log in');
        return;
      }

      if (createOrder.length === 0) {
        alert('Please add at least one item');
        return;
      }

      const orderData = {
        table_id: table_number,  // Keep table number from previous data
        user_id: userId,         // Keep user ID from local storage
        order_items: createOrder.map(item => ({
          menu_id: item.id,
          quantity: item.qty,
          price: item.price
        })),
        status: 'รอการชำระเงิน',  // Status remains unchanged
      };

      let response;
      if (orderId) {
        // If there's an orderId, fetch the existing order and only update the items
        const currentOrder = await getOrderById(orderId);  // Fetch the current order details
        const updatedOrderData = {
          table_id: currentOrder.table_id,  // Keep existing table id
          user_id: currentOrder.user_id,    // Keep existing user id
          order_items: orderData.order_items,  // Update only the items
          status: currentOrder.status,        // Keep existing status
          order_time: currentOrder.order_time,  // Keep existing order time
        };

        // Send the update request
        response = await updateOrder(orderId, updatedOrderData);
        console.log("Response from update order:", response);

        if (response && response.id) {
          Swal.fire({
            title: 'อัพเดตเสร็จแล้ว!',
            text: 'กำลังพาคุณไปหน้าหลักใน 2 วินาที...',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            navigate(`/cashier/manage-bill-cashier`);
          });
        } else {
          console.error("Update response didn't include expected data:", response);
          alert('Failed to save order');
        }

      } else {
        // Create a new order if no orderId
        response = await addOrder(orderData);
        alert('Order created successfully!');
        navigate(`/cashier/manager-bill/${userId}`);  // Navigate to the updated page after creating the order
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert(`Error occurred: ${error.message}`);
    }
  };





  const removeItem = (id) => {
    setCreateOrder(createOrder.filter(item => item.id !== id));
  };

  const filteredMenus = selectedCategory === 'all'
    ? menus
    : menus.filter(menu => menu.category_name === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Section - Food Menu */}
        <div className="flex-1">
          <h2 className="bg-green-800 text-white text-center py-3 rounded-full text-xl font-bold mb-6">
            รายการอาหาร
          </h2>

          {/* Category Selector */}
          <div className="mb-6 text-center">
            <label htmlFor="category" className="mr-2 text-lg">เลือกหมวดหมู่:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded-md"
            >
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Food Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-32">
            {filteredMenus.map(food => (
              <div
                key={food.id}
                className="flex flex-col items-center bg-white rounded-lg shadow-lg p-4 hover:scale-105 transition-all ease-in-out w-full"
                style={{ width: '220px' }} // Adjust for better proportion
              >
                <img
                  src={food.image_url}
                  alt={food.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <div className="text-center w-full mb-4">
                  <div className="font-semibold text-lg text-gray-800 mb-2">{food.name}</div>
                  <div className="font-semibold text-lg text-green-700 mb-4">
                    {isNaN(parseFloat(food.price)) ? 'ราคาผิดพลาด' : parseFloat(food.price).toFixed(2)} บาท
                  </div>
                </div>
                <button
                  className="w-full bg-green-800 text-white py-2 rounded-full text-lg hover:bg-green-700 transition-all ease-in-out"
                  onClick={(e) => { e.stopPropagation(); addItem(food); }}
                >
                  สั่งอาหาร
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-4">รายการอาหาร โต๊ะ: {table_number || 'กำลังโหลด...'} </h3>
          {/* Error Message */}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="bg-white border rounded-xl shadow-lg p-6">
            {createOrder.length === 0 ? (
              <div className="text-center text-gray-500">ยังไม่มีรายการอาหาร</div>
            ) : (
              createOrder.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-4">
                  <div className="flex-1 text-lg">{item.name}</div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={e => {
                        const newQty = parseInt(e.target.value);
                        if (newQty >= 1) {
                          setCreateOrder(prev => prev.map(existing =>
                            existing.id === item.id ? { ...existing, qty: newQty } : existing
                          ));
                        }
                      }}
                      className="w-12 text-center border rounded-md"
                    />
                    <div className="font-semibold">{(item.price * item.qty).toFixed(2)} บาท</div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">รวมทั้งหมด</div>
              <div className="text-xl font-bold">{totalPrice.toFixed(2)} บาท</div>
            </div>
            <div className="flex gap-6 mt-6">
              <button
                className="bg-green-800 text-white rounded px-6 py-2 hover:bg-green-700 transition-all"
                onClick={saveOrder}
              >
                บันทึก
              </button>
              <button
                className="bg-gray-400 text-gray-700 rounded px-6 py-2 hover:bg-gray-500 transition-all"
                onClick={() => setCreateOrder([])}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
