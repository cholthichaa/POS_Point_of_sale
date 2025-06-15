'use client'
import React, { useState, useEffect } from 'react'
import { getCategories } from '../services/categoryService.ts';  // ใช้ Service ที่สร้างขึ้น
import { addCategory, updateCategory, deleteCategory } from '../services/categoryService.ts';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid'
import Swal from 'sweetalert2';

export default function CategoryTable() {
  const [categories, setCategories] = useState([]); // ข้อมูลหมวดหมู่
  const [searchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState('');

  const itemsPerPage = 3;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleAddCategory = async () => {
    const trimmedName = newCategory.trim();
    if (!trimmedName) {
      alert('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    if (categories.find((cat) => cat.name === trimmedName)) {
      alert('หมวดหมู่นี้มีอยู่แล้ว');
      return;
    }

    try {
      // ส่งคำขอเพิ่มหมวดหมู่ไปยัง API
      const newCategoryData = { name: trimmedName, status: 'available' }; // เตรียมข้อมูลใหม่ที่จะส่ง
      const addedCategory = await addCategory(newCategoryData);  // ส่งคำขอไปที่ API

      // อัปเดตหมวดหมู่ในสถานะหน้า
      setCategories([...categories, addedCategory]);  // เพิ่มหมวดหมู่ใหม่ใน state

      // เคลียร์ข้อมูลในฟอร์ม
      setNewCategory('');
      setShowAddModal(false);

      // แสดงการแจ้งเตือนเมื่อเพิ่มหมวดหมู่สำเร็จ และให้หายไปหลังจาก 2 วินาที
      Swal.fire({
        title: 'เพิ่มหมวดหมู่เรียบร้อย!',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        timer: 2000,  // กำหนดให้หายไปหลังจาก 2000ms หรือ 2 วินาที
        showConfirmButton: false  // ซ่อนปุ่ม "ตกลง"
      });
    } catch (error) {
      console.error('Error adding category:', error);
      // แสดงการแจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        title: 'ไม่สามารถเพิ่มหมวดหมู่ได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        timer: 2000,  // กำหนดให้หายไปหลังจาก 2000ms หรือ 2 วินาที
        showConfirmButton: false  // ซ่อนปุ่ม "ตกลง"
      });
    }
  };


  const handleDelete = async (id: number) => {
    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    try {
      // ลบหมวดหมู่จาก API
      await deleteCategory(id);  // ลบจาก API

      // อัปเดตสถานะในหน้า
      setCategories(categories.filter((cat) => cat.id !== id));

      // แสดงข้อความแจ้งเตือนว่าลบสำเร็จ
      Swal.fire({
        title: 'ลบหมวดหมู่เรียบร้อย!',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      // แสดงข้อความแจ้งเตือนเมื่อไม่สามารถลบหมวดหมู่
      Swal.fire({
        title: 'ไม่สามารถลบหมวดหมู่ได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const toggleStatus = async (id: number) => {
    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    const newStatus = category.status === 'available' ? 'unavailable' : 'available'; // สลับสถานะ
    try {
      const updatedCategory = {
        name: category.name,
        status: newStatus
      };

      // อัปเดตสถานะ
      const result = await updateCategory(id, updatedCategory);

      // อัปเดตสถานะในหน้า
      setCategories(
        categories.map((cat) =>
          cat.id === id ? { ...cat, status: newStatus } : cat
        )
      );

      // แจ้งเตือนการเปลี่ยนสถานะ
      Swal.fire({
        title: `สถานะถูกเปลี่ยนเป็น ${newStatus}`,
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

    } catch (error) {
      console.error('Error updating category status:', error);
      alert('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const openEditModal = (category) => {
    setEditCategory(category);  // ตรวจสอบว่า category ที่รับมามีข้อมูลถูกต้อง
    setEditName(category.name);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      alert('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    if (categories.some((cat) => cat.name === editName.trim() && cat.id !== editCategory?.id)) {
      alert('ชื่อหมวดหมู่นี้มีอยู่แล้ว');
      return;
    }

    if (editCategory) {
      try {
        // แก้ไขค่าของ status ให้เป็น 'available' หรือ 'unavailable'
        const updatedCategory = {
          name: editName.trim(),
          status: editCategory.status ? 'available' : 'unavailable'
        };

        const result = await updateCategory(editCategory.id, updatedCategory);

        if (result) {
          setCategories(
            categories.map((cat) =>
              cat.id === editCategory.id ? { ...cat, name: editName.trim(), status: updatedCategory.status } : cat
            )
          );
          setShowEditModal(false);
          setEditCategory(null);
          setEditName('');

          // แจ้งเตือนการบันทึกสำเร็จ
          Swal.fire({
            title: 'แก้ไขหมวดหมู่เรียบร้อย!',
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
        }
      } catch (error) {
        console.error('Error updating category:', error);
        alert('ไม่สามารถแก้ไขหมวดหมู่ได้');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 border-b border-gray-400 pb-2">Manage Categories</h1>

      {/* ปุ่มเพิ่มหมวดหมู่ */}
      <div className="flex justify-end mb-5 space-x-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-green-800 hover:bg-green-900 text-white font-semibold px-4 py-2 rounded"
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          ADD CATEGORY
        </button>
      </div>

      {/* Modal เพิ่มหมวดหมู่ */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">เพิ่มหมวดหมู่</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="ชื่อหมวดหมู่"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setShowAddModal(false)}
              >
                ยกเลิก
              </button>
              <button
                className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900"
                onClick={handleAddCategory}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แก้ไขหมวดหมู่ */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">แก้ไขหมวดหมู่</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setShowEditModal(false)}
              >
                ยกเลิก
              </button>
              <button
                className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900"
                onClick={handleSaveEdit}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ตารางหมวดหมู่ */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ลำดับ</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ชื่อหมวดหมู่</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Action</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  ไม่พบข้อมูลหมวดหมู่
                </td>
              </tr>
            ) : (
              paginatedCategories.map((cat, idx) => (
                <tr key={cat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-3 text-sm text-gray-700 font-bold">{cat.name}</td>
                  <td className="p-3 text-center flex justify-center space-x-4">
                    <button onClick={() => openEditModal(cat)} title="แก้ไข" className="text-gray-600 hover:text-gray-900">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button title="ลบ" className="text-gray-400 hover:text-red-600" onClick={() => handleDelete(cat.id)}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cat.status === 'available'} // ใช้ค่า string แทน boolean
                        onChange={() => toggleStatus(cat.id)} // สลับสถานะ
                        className="sr-only peer" // ซ่อน input checkbox
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
          className={`px-4 py-1 rounded-md border ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 bg-white'
            }`}
        >
          Previous
        </button>
        {[...Array(totalPages).keys()].map((pageNum) => (
          <button
            key={pageNum + 1}
            onClick={() => setCurrentPage(pageNum + 1)}
            className={`px-4 py-1 rounded-md border ${currentPage === pageNum + 1
              ? 'bg-green-800 text-white border-green-800'
              : 'bg-white hover:bg-gray-200'
              }`}
          >
            {pageNum + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className={`px-4 py-1 rounded-md border ${currentPage === totalPages
            ? 'bg-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-200 bg-white'
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
