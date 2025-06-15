import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { getZones, addZone, updateZone, deleteZone } from '../services/zonesService.ts';

type ZoneItem = {
  id: number;
  name: string;
  status: string; 
};

export default function ManageZone() {
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Modal state สำหรับเพิ่มโซนใหม่
  const [showAddModal, setShowAddModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');

  // Modal state แก้ไขโซน
  const [showEditModal, setShowEditModal] = useState(false);
  const [editZone, setEditZone] = useState<ZoneItem | null>(null);
  const [editZoneName, setEditZoneName] = useState('');

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await getZones();
        setZones(data);
      } catch (error) {
        console.error('Error fetching zones:', error);
      }
    };
    fetchZones();
  }, []);

  const filteredZones = zones.filter((zone) =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) // ใช้ zone.name แทน zone.zoneName
  );

  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const paginatedZones = filteredZones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ลบโซน
  const handleDelete = async (id: number) => {
    try {
      await deleteZone(id);  // ลบโซนจาก API
      setZones(zones.filter((zone) => zone.id !== id));  // อัปเดตรายการโซนหลังจากลบ
      Swal.fire({
        title: 'ลบโซนเรียบร้อย!',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        timer: 2000,  // แสดง 2 วินาทีแล้วหายไป
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting zone:', error);
      Swal.fire({
        title: 'ไม่สามารถลบโซนได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // เปิด modal แก้ไขโซน
  const openEditModal = (zone: ZoneItem) => {
    setEditZone(zone);
    setEditZoneName(zone.name);
    setShowEditModal(true);
  };

  // บันทึกการแก้ไขโซน
  const handleSaveEdit = async () => {
    if (!editZoneName.trim()) {
      alert('กรุณากรอกชื่อโซน');
      return;
    }
    if (zones.some((z) => z.name === editZoneName.trim() && z.id !== editZone?.id)) {
      alert('ชื่อโซนนี้มีอยู่แล้ว');
      return;
    }
    if (editZone) {
      try {
        const updatedZone = { name: editZoneName.trim(), status: editZone.status };
        const result = await updateZone(editZone.id, updatedZone); // อัปเดตโซนใน API
        setZones(zones.map((z) => (z.id === editZone.id ? { ...z, name: result.name, status: result.status } : z)));
        setShowEditModal(false);
        setEditZone(null);
        setEditZoneName('');
        Swal.fire({
          title: 'แก้ไขโซนเรียบร้อย!',
          icon: 'success',
          confirmButtonText: 'ตกลง',
          timer: 2000,  // แสดง 2 วินาทีแล้วหายไป
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error updating zone:', error);
        Swal.fire({
          title: 'ไม่สามารถแก้ไขโซนได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
      }
    }
  };

  // เพิ่มโซนใหม่
  const handleAddZone = async () => {
    if (!newZoneName.trim()) {
      alert('กรุณากรอกชื่อโซน');
      return;
    }
    if (zones.find((z) => z.name === newZoneName.trim())) {
      alert('ชื่อโซนนี้มีอยู่แล้ว');
      return;
    }
    try {
      const newZone = { name: newZoneName.trim(), status: 'available' };
      const addedZone = await addZone(newZone);  // ส่งข้อมูลไปยัง API
      setZones([...zones, addedZone]);  // อัปเดตรายการโซน
      setNewZoneName('');
      setShowAddModal(false);
      Swal.fire({
        title: 'เพิ่มโซนเรียบร้อย!',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        timer: 2000,  // แสดง 2 วินาทีแล้วหายไป
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding zone:', error);
      Swal.fire({
        title: 'ไม่สามารถเพิ่มโซนได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // เปลี่ยนสถานะโซน
  const toggleStatus = async (id: number) => {
    const zone = zones.find((z) => z.id === id);  // ค้นหาโซนที่ต้องการ
    if (!zone) return;

    const updatedStatus = zone.status === 'available' ? 'unavailable' : 'available';
    const updatedZone = { ...zone, status: updatedStatus };

    try {
      await updateZone(id, { name: zone.name, status: updatedStatus });
      setZones(zones.map((z) => (z.id === id ? updatedZone : z)));

      Swal.fire({
        title: updatedStatus === 'available' ? 'เปิดโซนเรียบร้อย!' : 'ปิดโซนเรียบร้อย!',
        icon: updatedStatus === 'available' ? 'success' : 'info',
        confirmButtonText: 'ตกลง',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: 'ไม่สามารถเปลี่ยนสถานะโซนได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 border-b border-gray-400 pb-2">
        Manage Zones
      </h1>

      {/* ปุ่มเพิ่มโซน */}
      <div className="flex justify-end mb-5 space-x-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-green-800 hover:bg-green-900 text-white font-semibold px-4 py-2 rounded"
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          ADD ZONE
        </button>
      </div>

      {/* Modal เพิ่มโซน */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-80"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">เพิ่มโซน</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="ชื่อโซน"
              value={newZoneName}
              onChange={e => setNewZoneName(e.target.value)}
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
                onClick={handleAddZone}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แก้ไขโซน */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-80"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">แก้ไขโซน</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="ชื่อโซน"
              value={editZoneName}
              onChange={e => setEditZoneName(e.target.value)}
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

      {/* Search */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center border border-green-600 rounded-md px-3 py-1 w-64">
          <MagnifyingGlassIcon className="w-5 h-5 text-green-600" />
          <input
            type="text"
            placeholder="ค้นหาโซน..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="ml-2 outline-none w-full text-sm"
          />
        </div>
        <div className="bg-white border rounded-md px-3 py-1 text-sm shadow">
          แสดงผล: {filteredZones.length} รายการ
        </div>
      </div>

      {/* ตาราง */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ลำดับ</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ชื่อโซน</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Action</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedZones.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  ไม่พบข้อมูลโซน
                </td>
              </tr>
            ) : (
              paginatedZones.map((zone, idx) => (
                <tr key={zone.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-sm text-gray-700">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="p-3 text-sm text-gray-700 font-bold">{zone.name}</td> {/* ใช้ zone.name */}
                  <td className="p-3 text-center flex justify-center space-x-4">
                    <button
                      onClick={() => openEditModal(zone)}
                      title="แก้ไข"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      title="ลบ"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDelete(zone.id)}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                  {/* ตารางส่วนที่แสดงสถานะ */}
                  <td className="p-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      {/* เปลี่ยนการตรวจสอบสถานะจาก boolean เป็น string */}
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={zone.status === 'available'}  // ตรวจสอบสถานะเป็น string
                        onChange={() => toggleStatus(zone.id)}  // เมื่อคลิกให้สลับสถานะ
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
          className={`px-4 py-1 rounded-md border ${currentPage === 1
            ? 'bg-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-200 bg-white'
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
  )
}
