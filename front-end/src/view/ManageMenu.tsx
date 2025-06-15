import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenus, deleteMenu, updateMenuStatus } from '../services/MenuService.ts';
import Swal from 'sweetalert2';

import {
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function MenuTable() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;
  const navigate = useNavigate();

  // ฟิลเตอร์เมนูตาม search term
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // การแบ่งหน้า
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ฟังก์ชันดึงข้อมูลเมนูจาก API (GET)
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const fetchedMenus = await getMenus();  // ใช้ฟังก์ชัน getMenus จาก MenuService
        setItems(fetchedMenus);  // เซ็ตข้อมูลที่ดึงมาใน state
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchMenus();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('ต้องการลบเมนูนี้หรือไม่?')) {
      try {
        await deleteMenu(id);  // ใช้ฟังก์ชัน deleteMenu จาก MenuService
        setItems(items.filter((item) => item.id !== id));  // ลบเมนูที่เลือกจาก state
        alert('ลบเมนูเรียบร้อย!');
      } catch (error) {
        console.error('Error deleting menu:', error);
        alert('เกิดข้อผิดพลาดในการลบเมนู');
      }
    }
  };

  const toggleMenuStatus = async (id: number, currentStatus: boolean) => {
    const updatedStatus = currentStatus === 'available' ? 'unavailable' : 'available'; // เปลี่ยนสถานะเป็นตรงข้าม

    try {
      // เรียกฟังก์ชัน updateMenuStatus เพื่ออัปเดตสถานะในฐานข้อมูล
      await updateMenuStatus(id, updatedStatus);

      // อัปเดตสถานะใน state
      setItems(items.map(item =>
        item.id === id ? { ...item, status: updatedStatus } : item
      ));

      Swal.fire({
        title: `สถานะของเมนู ${updatedStatus === 'available' ? 'เปิด' : 'ปิด'}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };



  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 border-b border-gray-400 pb-2">
        Manage Menu
      </h1>

      {/* ปุ่ม ADD CATEGORY และ ADD MENU */}
      <div className="flex justify-end mb-5 space-x-4">
        <button
          onClick={() => navigate('/admin/add-menu')}
          className="bg-green-800 hover:bg-green-900 text-white font-semibold px-5 py-2 rounded"
        >
          ADD MENU
        </button>
      </div>

      {/* Search Input */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center border border-green-600 rounded-md px-3 py-1 w-64">
          <MagnifyingGlassIcon className="w-5 h-5 text-green-600" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="ml-2 outline-none w-full text-sm"
          />
        </div>
        <div className="bg-white border rounded-md px-3 py-1 text-sm shadow">
          Showing: {filteredItems.length} items
        </div>
      </div>

      {/* Table of Menus */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ลำดับ</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ชื่อ</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">หมวดหมู่</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ราคา</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">รูปภาพ</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Action</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  ไม่พบข้อมูลเมนู
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-3 text-sm text-gray-700">{item.name}</td>
                  <td className="p-3 text-sm text-gray-700 font-bold">{item.category_name}</td>
                  <td className="p-3 text-sm text-gray-700">
                    {isNaN(parseFloat(item.price)) ? 'N/A' : parseFloat(item.price).toFixed(2)} ฿
                  </td>
                  <td className="p-3 text-sm text-gray-700">
                    <img src={item.image_url} alt={item.name} width="50" />
                  </td>
                  <td className="p-3 text-center flex justify-center space-x-4">
                    <button
                      onClick={() => navigate(`/admin/edit-menu/${item.id}`)}
                      title="แก้ไข"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      title="ลบ"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDelete(item.id)}  // ลบเมนู
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.status === 'available'}  // สถานะจะเป็น 'available' หรือ 'unavailable'
                        onChange={() => toggleMenuStatus(item.id, item.status)}  // เปลี่ยนสถานะเมนู
                      />
                      <div className="w-14 h-8 bg-gray-400 rounded-full peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:bg-green-800 transition"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full border border-gray-300 peer-checked:translate-x-6 peer-checked:border-green-800 transition-transform"></div>
                    </label>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end items-center bg-gray-100 rounded p-4 space-x-1">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className={`px-4 py-1 rounded-md border ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 bg-white'}`}
        >
          Previous
        </button>
        {[...Array(totalPages).keys()].map((pageNum) => (
          <button
            key={pageNum + 1}
            onClick={() => setCurrentPage(pageNum + 1)}
            className={`px-4 py-1 rounded-md border ${currentPage === pageNum + 1 ? 'bg-green-800 text-white border-green-800' : 'bg-white hover:bg-gray-200'}`}
          >
            {pageNum + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className={`px-4 py-1 rounded-md border ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 bg-white'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
