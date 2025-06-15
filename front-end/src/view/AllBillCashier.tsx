import React, { useState, useMemo, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../services/orderService.ts';
import { fetchTables } from '../services/tableService.ts';
import { getBills } from '../services/billService.ts';

const ITEMS_PER_PAGE = 10;

export default function ManageBillCashier() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);  // Store all bills fetched from API
  const [orders, setOrders] = useState([]);  // Store all orders fetched from API
  const [tables, setTables] = useState([]);  // Store all tables fetched from API
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch orders, tables, and bills on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, tablesData, billsData] = await Promise.all([
          fetchOrders(),  // Fetch all orders
          fetchTables(),  // Fetch all tables
          getBills()      // Fetch all bills
        ]);

        setOrders(ordersData);  // Update orders state
        setTables(tablesData);  // Update tables state
        setBills(billsData);    // Update bills state
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();  // Fetch data when the component loads
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return bills;

    const term = searchTerm.toLowerCase(); // Convert search term to lowercase

    return bills.filter(bill => {
      if (!bill) return false;

      return (
        bill.order_id.toString().includes(term) ||
        bill.total_amount.toString().includes(term) ||
        bill.payment_status.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, bills]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  // Function to get the table name by table_id
  const getTableName = (tableId) => {
    const table = tables.find(t => t.id === tableId);  // Find table matching tableId
    return table ? table.table_number : 'ไม่พบโต๊ะ';  // Return table name or 'ไม่พบโต๊ะ' if not found
  };

  // Function to get order details based on order_id
  const getOrderDetails = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    return order ? order : { status: 'ไม่พบข้อมูลออเดอร์' };
  };

  // Calculate total number of bills and total sales
  const totalBills = filteredData.length;
  const totalSales = filteredData.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);

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
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[80px]">โต๊ะ</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[90px]">รหัสออเดอร์</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[80px]">ยอดบิล</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[80px]">สถานะการชำระเงิน</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[150px]">เวลา</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[100px]">รายการสินค้า</th>
                <th className="py-4 px-6 text-base font-semibold text-gray-700 border-b-4 border-gray-300 min-w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 text-lg">
                    ไม่พบข้อมูลบิล
                  </td>
                </tr>
              ) : (
                currentData.map((bill, i) => (
                  <tr key={bill.bill_id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{getTableName(bill.table_id)}</td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{bill.order_id}</td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{bill.total_amount}</td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{bill.payment_status}</td>
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">{'13/06/2025 08:08:19'}</td> {/* Static time */}
                    <td className="py-4 px-6 text-base text-gray-700 border-b border-gray-300">
                      <ul>
                        {bill.items.map((item, index) => (
                          <li key={index}>
                            {item.menu_name} (x{item.quantity}) - {item.price}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 px-6 text-base border-b border-gray-300">
                      <button
                        onClick={() => navigate(`/cashier/bill/${bill.order_id}`)}
                        className="bg-green-800 text-white text-base font-semibold px-6 py-2 rounded-md hover:bg-green-900 transition"
                      >
                        ดูบิล
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Sales and Total Bills */}
        <div className="flex justify-between bg-gray-100 px-6 py-4 mt-6">
          <div className="text-lg font-semibold text-gray-700">
            จำนวนบิลทั้งหมด: {totalBills} บิล
          </div>
          <div className="text-lg font-semibold text-gray-700">
            ยอดขายรวม: {totalSales.toFixed(2)} บาท
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 px-6 py-4 rounded-b-lg mt-6 text-gray-700 text-base select-none gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 whitespace-nowrap"></div>

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
