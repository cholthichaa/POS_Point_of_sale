'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCashiers, deleteCashier, updateCashier } from '../services/cashierService.ts';
import {
  KeyIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';



export default function UserTable() {
  const [users, setUsers] = useState([]); // Ensure users is an empty array by default
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const navigate = useNavigate();

  // Fetch users from the API
  useEffect(() => {

    async function fetchUsers() {
      try {
        const response = await getCashiers();
        console.log("response.data:", response.data);
        console.log("Full response:", response);
        console.log("response.data:", response.data);
        console.log("isArray:", Array.isArray(response.data));

        setUsers(response || []);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Please log in again',
          });
          navigate('/login');
        } else {
          console.error('Error fetching users:', error);
        }
      }
    }

    fetchUsers();
  }, [navigate]);

  const filteredUsers = (users || []).filter((user) => {
    const username = user.username?.toLowerCase() || '';
    const keyword = searchTerm.toLowerCase();
    return username.includes(keyword);
  });


  console.log('Filtered Users:', filteredUsers); // เพิ่มบรรทัดนี้เพื่อตรวจสอบ


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH');
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id) => {
    deleteCashier(id)
      .then(() => {
        setUsers(users.filter((user) => user.id !== id));

        Swal.fire({
          icon: 'success',
          title: 'ลบผู้ใช้สำเร็จ!',
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error('Error deleting user:', error);

        Swal.fire({
          icon: 'error',
          title: 'ลบไม่สำเร็จ!',
          timer: 2000,
          showConfirmButton: false,
        });
      });
  };


  const toggleUserStatus = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) {
      console.error('❌ ไม่พบข้อมูล user');
      return;
    }

    // เปลี่ยนสถานะเป็น active หรือ inactive
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน';

    // ส่งคำขอไปยัง backend
    updateCashier(id, { status: newStatus })  // ส่งสถานะใหม่
      .then(() => {
        setUsers(
          users.map((u) =>
            u.id === id ? { ...u, status: newStatus } : u
          )
        );

        Swal.fire({
          icon: 'success',
          title: `${actionText} สำเร็จ`,
          timer: 1000,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error('Error updating user status:', error);
        Swal.fire('ไม่สามารถเปลี่ยนสถานะได้!', '', 'error');  // ข้อความ error ถ้าเกิดปัญหา
      });
  };


  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 border-b border-gray-400 pb-2">Manage User</h1>

      {/* Add User Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/admin/add-user')}
          className="bg-green-800 hover:bg-green-900 text-white font-semibold px-5 py-2 rounded"
        >
          ADD USER
        </button>
      </div>

      {/* Search Bar and Show Number of Items */}
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
          Showing: {filteredUsers.length} items
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ลำดับ</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ชื่อผู้ใช้</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">บทบาท</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">อีเมล</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ชื่อจริง</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">นามสกุล</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">เบอร์โทร</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">วันที่สร้าง</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Status</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, idx) => (
                <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-sm text-gray-700">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="p-3 text-sm text-gray-700">{user.username}</td>
                  <td className="p-3 text-sm text-gray-700">{user.role}</td>
                  <td className="p-3 text-sm text-gray-700">{user.email}</td>
                  <td className="p-3 text-sm text-gray-700">{user.first_name || '-'}</td>
                  <td className="p-3 text-sm text-gray-700">{user.last_name || '-'}</td>
                  <td className="p-3 text-sm text-gray-700">{user.phone || '-'}</td>
                  <td className="p-3 text-sm text-gray-700">{user.created_at ? formatDate(user.created_at) : '-'}</td>
                  <td className="p-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={user.status === 'active'} // ตรวจสอบสถานะ active/inactive
                        onChange={() => toggleUserStatus(user.id)}  // ฟังก์ชัน toggle ที่จะสลับสถานะ
                      />
                      <div className={`w-14 h-8 rounded-full transition ${user.status === 'active' ? 'bg-green-800' : 'bg-gray-500'}`}></div> {/* สีเขียวเมื่อ active, เทาเมื่อ inactive */}
                      <div className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full border border-gray-300 peer-checked:translate-x-6 transition-transform`}></div> {/* ปุ่มสวิตซ์ */}
                    </label>
                  </td>

                  <td className="p-3 text-center flex justify-center space-x-4">
                    <button
                      onClick={() => navigate('/admin/change-password')}
                      title="เปลี่ยนรหัสผ่าน"
                      className="text-black hover:text-green-900"
                    >
                      <KeyIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/edit-user/${user.id}`)}  // ต้องมี `${user.id}`
                      title="แก้ไข"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>

                    <button
                      title="ลบ"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDelete(user.id)}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
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
