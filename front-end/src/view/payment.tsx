'use client';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/orderService.ts';
import { getTableById } from '../services/tableService.ts';
import { createBill } from '../services/billService.ts';  // Import createBill service
import { updateOrder } from '../services/orderService.ts';  // Import updateOrder service

export default function PaymentPage() {
  const [totalAmount] = useState(340.0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [status] = useState('รอชำระเงิน');
  const changeAmount = receivedAmount - totalAmount;
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);  // To store the order details
  const [table, setTable] = useState<any>(null);  // To store the table details
  const navigate = useNavigate();

  // Fetch order and table details when the component loads
  useEffect(() => {
    const fetchOrderAndTableDetails = async () => {
      try {
        if (orderId) {
          // Fetch the order details using orderId
          const fetchedOrder = await getOrderById(orderId);
          console.log('Fetched Order:', fetchedOrder);
          setOrder(fetchedOrder); // Set order data

          // Fetch the table details using table_id from the order
          const fetchedTable = await getTableById(fetchedOrder.table_id);
          console.log('Fetched Table:', fetchedTable);
          setTable(fetchedTable); // Set table data
        }
      } catch (error) {
        console.error('Error fetching order or table details:', error);
      }
    };

    fetchOrderAndTableDetails(); // Call the fetch function
  }, [orderId]);  // Re-run effect when orderId changes

  const handleReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setReceivedAmount(val);
    } else {
      setReceivedAmount(0);
    }
  };

  const handlePay = async () => {
    if (receivedAmount >= totalAmount) {
      try {
        // Create a new bill
        const billData = {
          order_id: order.id,
          total_amount: totalAmount,
          payment_status: 'ชำระเงินแล้ว',
          payment_time: new Date().toISOString(),
        };
        const createdBill = await createBill(billData);  // Create the bill

        // Update the order status to "ชำระเงินแล้ว"
        const updatedOrder = await updateOrder(order.id, { status: 'ชำระเงินแล้ว' });

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'ชำระบิลสำเร็จ',
          text: 'ขอบคุณครับ! บิลของคุณถูกสร้างแล้วและสถานะออเดอร์เปลี่ยนเป็นชำระเงินแล้ว',
          confirmButtonColor: '#22c55e',
        }).then(() => {
          navigate(`/orders`);  // Optionally navigate to the orders list or any other page
        });
      } catch (error) {
        console.error('Error during payment process:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถชำระบิลได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonColor: '#ef4444',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'เงินไม่พอ',
        text: 'กรุณารับเงินให้ครบก่อนชำระ',
        confirmButtonColor: '#ef4444',
      });
    }
  };

const handleTransfer = async () => {
  try {
    // Step 1: Create the bill
    const billData = {
      order_id: order.id,
      total_amount: totalAmount,
      payment_status: 'ชำระเงินแล้ว',
      payment_time: new Date().toISOString(), // Set the payment time
    };
    
    const createdBill = await createBill(billData); // Call the createBill function
    console.log('Bill created:', createdBill);

    // Step 2: Update the order status to "ชำระเงินแล้ว"
    const updatedOrder = await updateOrder(order.id, { status: 'ชำระเงินแล้ว' });

    // Step 3: Show success message with Swal
    Swal.fire({
      icon: 'success',
      title: 'โอนเงินเรียบร้อย',
      text: 'บิลของคุณถูกสร้างและสถานะออเดอร์เปลี่ยนเป็นชำระเงินแล้ว',
      confirmButtonColor: '#22c55e',  // Green color for success
    }).then(() => {
      navigate(`/orders`);  // Navigate to the orders page or wherever you want
    });
  } catch (error) {
    console.error('Error during transfer and bill creation:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถสร้างบิลได้ กรุณาลองใหม่อีกครั้ง',
      confirmButtonColor: '#ef4444', // Red color for errors
    });
  }
};


  const handleEditOrder = () => {
    Swal.fire({
      icon: 'info',
      title: 'แก้ไขออเดอร์',
      confirmButtonColor: '#3b82f6',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex justify-center">
      <div className="max-w-7xl w-full flex gap-12">
        {/* ใบแจ้งค่าอาหาร */}
        <div className="bg-white p-8 rounded-lg shadow-md w-1/2">
          <h2 className="text-xl font-bold mb-6 text-center">ใบแจ้งค่าอาหาร</h2>

          <div className="mb-6 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Order ID :</span>
              <span>{order?.id || 'ไม่พบข้อมูล'}</span>
            </div>
            <div className="flex justify-between">
              <span>หมายเลขโต๊ะ :</span>
              <span>{table?.table_number || 'ไม่พบข้อมูล'}</span>
            </div>
            <div className="flex justify-between">
              <span>วันที่ :</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-2 font-semibold">
              <span>สถานะ :</span>
              <span className={status === 'ชำระเงินแล้ว' ? 'text-green-700 font-semibold' : ''}>{status}</span>
            </div>
          </div>

          {/* Order items table */}
          <table className="w-full text-left mb-6">
            <thead>
              <tr className="border-b border-gray-300 font-semibold">
                <th className="pb-2">รายการ</th>
                <th className="pb-2 text-center w-20">จำนวน</th>
                <th className="pb-2 text-right w-28">ราคา</th>
              </tr>
            </thead>
            <tbody>
              {/* You can iterate over order items here */}
              {order?.order_items?.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{item.menu_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t border-gray-300 font-semibold">
                <td className="py-3 text-right" colSpan={2}>ราคา</td>
                <td className="text-right">
                  {order?.order_items
                    ? order.order_items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
                    : '0.00'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment form */}
        <div className="bg-white p-8 rounded-lg shadow-md w-1/3 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <label className="font-semibold">รวมทั้งหมด (บาท)</label>
            <input
              type="text"
              readOnly
              value={totalAmount.toFixed(2)}
              className="border border-gray-300 rounded px-4 py-2 w-32 text-right bg-gray-100"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="font-semibold">รับเงินมา (บาท)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={receivedAmount}
              onChange={handleReceivedChange}
              className="border border-gray-300 rounded px-4 py-2 w-32 text-right"
            />
          </div>

          <button
            className="bg-white border border-gray-400 py-2 rounded text-gray-700 font-semibold hover:bg-gray-100"
            onClick={handleTransfer}
          >
            โอน
          </button>

          <button
            className="bg-white border border-gray-400 py-2 rounded text-gray-700 font-semibold hover:bg-gray-100"
            onClick={handlePay} // Trigger the payment process
          >
            ชำระเงิน
          </button>

          <div className="flex justify-between items-center">
            <label className="font-semibold">ถอน (บาท)</label>
            <input
              type="text"
              readOnly
              value={changeAmount.toFixed(2)}
              className="border border-gray-300 rounded px-4 py-2 w-32 text-right bg-gray-100"
            />
          </div>


        </div>
      </div>
    </div>
  );
}
