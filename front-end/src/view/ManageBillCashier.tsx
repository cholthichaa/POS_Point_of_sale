'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../services/orderService.ts';
import { fetchTables } from '../services/tableService.ts';
import { getCashierById } from '../services/cashierService.ts';
import { getBills } from '../services/billService.ts';  

const ITEMS_PER_PAGE = 5;

export default function ManageBillCashier() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);  // Store orders fetched from API
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cashiers, setCashiers] = useState({});  // Store cashier names by user_id
  const [tables, setTables] = useState([]);  // Store tables data
  const [bills, setBills] = useState([]);  // Store all bills fetched from API

const formatDate = (dateString) => {
  const date = new Date(dateString); // Convert from ISO 8601 to Date object

  // Format the date as "DD/MM/YYYY HH:MM:SS"
  const day = String(date.getDate()).padStart(2, '0');  // Ensure two digits for day
  const month = String(date.getMonth() + 1).padStart(2, '0');  // Ensure two digits for month
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');  // Ensure two digits for hours
  const minutes = String(date.getMinutes()).padStart(2, '0');  // Ensure two digits for minutes
  const seconds = String(date.getSeconds()).padStart(2, '0');  // Ensure two digits for seconds

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};


  // Fetch orders and tables on page load
  useEffect(() => {
    const fetchOrdersAndTables = async () => {
      try {
        const ordersData = await fetchOrders(); // Fetch all orders
        setOrders(ordersData);  // Update orders state

        // Fetch tables data
        const tablesResponse = await fetchTables();
        setTables(tablesResponse);  // Store tables

        // Fetch cashier names based on user_id
        const cashierData = await Promise.all(
          ordersData.map(order => getCashierById(order.user_id)) // Fetch cashier info based on user_id
        );

        const cashierNames = {};
        cashierData.forEach((cashier, index) => {
          cashierNames[ordersData[index].user_id] = cashier.first_name;  // Assuming `first_name` is the cashier's name
        });

        setCashiers(cashierNames);  // Store cashier names
      } catch (error) {
        console.error('Error fetching orders, tables, or cashiers:', error);
      }
    };

    fetchOrdersAndTables();
  }, [currentPage]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return orders;

    const term = searchTerm.toLowerCase(); // Convert search term to lowercase

    return orders.filter(item => {
      if (!item) return false; // Ensure item is defined

      // Safely check and handle undefined values for each property
      const statusMatch = item.status ? item.status.toLowerCase().includes(term) : false;
      const datetimeMatch = item.datetime ? item.datetime.toLowerCase().includes(term) : false;
      const paymentStatusMatch = item.paymentStatus ? item.paymentStatus.toLowerCase().includes(term) : false;

      return (
        (item.id && item.id.toString().includes(term)) ||
        statusMatch ||
        datetimeMatch ||
        (item.totalPrice && item.totalPrice.toString().includes(term)) ||
        paymentStatusMatch ||
        (item.paymentStatus === 'ชำระเงินแล้ว' && 'ชำระเงิน'.includes(term)) ||
        (item.paymentStatus !== 'ชำระเงินแล้ว' && 'รอชำระเงิน'.includes(term))
      );
    });
  }, [searchTerm, orders]);



  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPriceAll = useMemo(() => {
    return orders.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [orders]);

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }
  function handleBillClick(order) {
    console.log('Order:', order); // Debugging the order object
    console.log('Payment Status:', order.status); // Log the status instead of paymentStatus

    const status = order.status.trim();  // Use `status` instead of `paymentStatus`
    console.log('Trimmed Status:', status); // Debug trimmed status

    // Check the displayed payment status
    if (status === 'ชำระเงินแล้ว') {
      console.log('Navigating to /cashier/bill');
      navigate(`/cashier/bill/${order.id}`);
    } else {
      console.log('Navigating to /cashier/manager-bill');
      navigate(`/cashier/manager-bill/${order.id}`);
    }
  }

  const getTableName = (tableId) => {
    const table = tables.find(t => t.id === tableId);  // Find table matching tableId
    return table ? table.table_number : 'ไม่พบโต๊ะ';  // Return table name or 'ไม่พบโต๊ะ' if not found
  };

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
                setCurrentPage(1);  // Reset to page 1 when search term changes
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
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td> {/* Display sequence number */}
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{getTableName(item.table_id)}</td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300 min-w-[80px]">
                      {item.status === 'ชำระเงินแล้ว' ? 'ชำระเงินแล้ว' : 'รอชำระเงิน'}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300 hidden sm:table-cell">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300 hidden md:table-cell">
                      {cashiers[item.user_id] || 'ไม่พบชื่อแคชเชียร์'}
                    </td>
                    <td className="py-4 px-6 text-base border-b border-gray-300">
                      <button
                        onClick={() => handleBillClick(item)}
                        className="bg-green-800 text-white text-base font-semibold px-6 py-2 rounded-md hover:bg-green-900 transition whitespace-nowrap"
                      >
                        บิล
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
