'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrder } from '../services/orderService.ts';  // Import the updateOrder function
import { getTableById } from '../services/tableService.ts';
import { getMenus } from '../services/MenuService.ts';

export default function FoodOrderInvoice() {
  const { orderId } = useParams();  // Extract orderId from the URL
  const [order, setOrder] = useState<any>(null);  // To store fetched order data
  const [table, setTable] = useState<any>(null);  // To store fetched table data
  const [menus, setMenus] = useState<any>([]);  // To store fetched menu data
  const [updatedItems, setUpdatedItems] = useState<any>([]);  // To store the updated order items
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Set default date if not provided
  const date = new Date().toLocaleString(); // Current date and time

  // Fetch order and table details when component loads
  useEffect(() => {
    const fetchOrderAndTableDetails = async () => {
      try {
        if (orderId) {
          // Fetch the order details using the orderId
          const fetchedOrder = await getOrderById(orderId);
          console.log('Fetched Order:', fetchedOrder); // Debugging log
          setOrder(fetchedOrder);  // Set the order data in state

          // Fetch the table details using table_id from the order
          const fetchedTable = await getTableById(fetchedOrder.table_id);
          console.log('Fetched Table:', fetchedTable); // Debugging log
          setTable(fetchedTable);  // Set the table data in state

          // Fetch menus to match menu_id with menu_name
          const fetchedMenus = await getMenus();  // Get all menus
          console.log('Fetched Menus:', fetchedMenus);
          setMenus(fetchedMenus);  // Set menus data in state

          // Initialize updatedItems with the fetched order items
          setUpdatedItems(fetchedOrder.order_items);
        }
      } catch (error) {
        console.error('Error fetching order or table details:', error);
      }
    };

    fetchOrderAndTableDetails(); // Fetch the data when component mounts
  }, [orderId]);  // Re-run effect when orderId changes

  // Handle printing the invoice
  const handlePrint = () => {
    if (printRef.current) {
      const originalContents = document.body.innerHTML;
      const printContents = printRef.current.innerHTML;

      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  // Handle updating the order and navigate to the Edit Order page
  const handleUpdateOrder = async () => {
    const updatedOrder = {
      table_id: order.table_id,
      user_id: order.user_id,
      status: 'updated', // Set status to updated or any value as needed
      order_items: updatedItems, // Use updatedItems instead of the original order items
    };

    try {
      const response = await updateOrder(orderId, updatedOrder);
      if (response) {
        console.log('Order updated successfully:', response);
        // Navigate to the Edit Order page with the orderId in the URL
        navigate(`/cashier/order-update/${orderId}`);  // Pass the orderId in the URL
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update the order');
    }
  };

  // Handle quantity change in order items
  const handleQuantityChange = (menuId: number, newQuantity: number) => {
    setUpdatedItems((prevItems) => {
      return prevItems.map((item) =>
        item.menu_id === menuId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      {/* Only render the order and table details if they're fetched successfully */}
      {order && table ? (
        <div ref={printRef} className="max-w-3xl mx-auto bg-white p-8 rounded shadow-md font-sans text-gray-800">
          <h1 className="text-2xl font-bold text-center mb-6">ใบแจ้งค่าอาหาร</h1>

          <div className="mb-6 text-sm">
            <div className="flex justify-between mb-1"><span>Order ID :</span><span>{orderId}</span></div>
            <div className="flex justify-between mb-1"><span>หมายเลขโต๊ะ :</span><span>{table.table_number}</span></div>
            <div className="flex justify-between mb-1"><span>วันที่ :</span><span>{date}</span></div> {/* Display the date */}
          </div>

          <table className="w-full text-left mb-6">
            <thead>
              <tr className="border-b border-gray-300 font-semibold">
                <th className="pb-2">รายการ</th>
                <th className="pb-2 text-center w-20">จำนวน</th>
                <th className="pb-2 text-right w-28">ราคา</th>
              </tr>
            </thead>
            <tbody>
              {updatedItems && updatedItems.length > 0 ? (
                updatedItems.map((item, i) => {
                  const menu = menus.find(menu => menu.id === item.menu_id);  // Match menu by menu_id
                  return (
                    <tr key={i} className={i !== updatedItems.length - 1 ? 'border-b border-gray-200' : ''}>
                      <td className="py-2">{menu ? menu.name : 'ไม่พบชื่อเมนู'}</td> {/* Show menu name */}
                      <td className="text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.menu_id, parseInt(e.target.value))}
                          className="w-16 text-center border rounded-md"
                        />
                      </td>
                      <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td> {/* Calculate total price */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">ไม่พบรายการสินค้า</td>
                </tr>
              )}
              <tr className="border-t border-gray-300 font-semibold">
                <td className="py-3 text-right" colSpan={2}>ราคา</td>
                <td className="text-right">{updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</td> {/* Show total price */}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>  // Show loading message until order and table are fetched
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-4 print:hidden">
        <button
          className="bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded hover:bg-gray-400"
          onClick={handleUpdateOrder}  // Call the update function
        >
          แก้ไขออเดอร์
        </button>

        <button
          className="bg-green-800 text-white font-semibold px-6 py-2 rounded hover:bg-green-900"
          onClick={() => navigate(`/cashier/payment/${orderId}`)} // Navigate to payment page with orderId
        >
          ชำระเงิน
        </button>
      </div>

    </div>
  );
}
