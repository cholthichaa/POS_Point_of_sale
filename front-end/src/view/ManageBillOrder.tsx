import React, { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder } from '../services/orderService.ts';  // Import the service functions

const ITEMS_PER_PAGE = 3;

export default function ManageBillCashier() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch orders when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();  // Call the API to get orders
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(item =>
      item.id.toString().includes(term) ||
      item.status.toLowerCase().includes(term) ||
      item.datetime.toLowerCase().includes(term) ||
      item.cashier.toLowerCase().includes(term) ||
      item.totalPrice.toString().includes(term) ||
      item.table.toLowerCase().includes(term) ||
      item.paymentStatus.toLowerCase().includes(term)
    );
  }, [searchTerm, orders]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleDeleteOrder = async (id: number) => {
    try {
      await deleteOrder(id);  // Call the delete function from orderService
      setOrders(prev => prev.filter(order => order.id !== id));  // Remove the order from the state
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const totalPriceAll = useMemo(() => {
    return orders.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [orders]);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  function handleBillClick(item) {
    const orderId = item.id;  // ใช้ orderId จากข้อมูลของออเดอร์ที่คลิก
    if (item.paymentStatus === 'ชำระเงินแล้ว') {
      // หากชำระเงินแล้ว, นำทางไปที่หน้า /cashier/bill/:orderId
      navigate(`/cashier/bill/${orderId}`);
    } else {
      // หากยังไม่ชำระเงิน, นำทางไปที่หน้า /cashier/manager-bill/:orderId
      navigate(`/cashier/manager-bill/${orderId}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 border-b-2 border-gray-700 pb-2">จัดการบิล</h1>

        <div className="flex flex-col sm:flex-row justify-end items-center mb-6 sm:mb-8 gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search..."
              className="pl-12 pr-6 py-3 rounded-lg border-2 border-green-600 focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-transparent text-gray-700 text-base w-full"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <MagnifyingGlassIcon className="w-6 h-6 text-green-600 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <div className="text-base text-gray-700 bg-white px-5 py-2 rounded-lg border border-gray-300 whitespace-nowrap">
            Showing: {filteredData.length} items
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-[800px] w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[40px]">ลำดับ</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[90px]">โต๊ะ</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[80px]">สถานะ</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[150px] hidden sm:table-cell">วันที่ทำรายการ</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[100px] hidden md:table-cell">แคชเชียร์</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[100px]">ราคารวม</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400 text-lg">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                currentData.map((item, i) => (
                  <tr key={item.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{item.id}</td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{item.table}</td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300 min-w-[80px]">
                      {item.paymentStatus === 'ชำระเงินแล้ว' ? 'ชำระเงิน' : 'รอชำระเงิน'}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300 hidden sm:table-cell">
                      {item.datetime}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300 hidden md:table-cell">
                      {item.cashier}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{item.totalPrice.toFixed(2)}</td>
                    <td className="py-4 px-6 text-base border-b border-gray-300">
                      <button
                        onClick={() => handleBillClick(item)}  // เรียกใช้ handleBillClick เมื่อคลิกที่ปุ่ม
                        className="bg-green-800 text-white text-base font-semibold px-6 py-2 rounded-md hover:bg-green-900 transition whitespace-nowrap"
                      >
                        บิล
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(item.id)}
                        className="bg-red-600 text-white text-base font-semibold px-6 py-2 rounded-md hover:bg-red-700 transition mt-2"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 px-6 py-4 rounded-b-lg mt-6 text-gray-700 text-base select-none gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 whitespace-nowrap">
            <span className="bg-gray-300 rounded-full px-4 py-2">รวมยอดขายทั้งหมด</span>
            <span className="bg-gray-300 rounded-full px-5 py-2">
              {totalPriceAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-md border ${currentPage === page ? 'bg-green-800 text-white border-green-800' : 'bg-white border-gray-300 hover:bg-gray-100'}`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
