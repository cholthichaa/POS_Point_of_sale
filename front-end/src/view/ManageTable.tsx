import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import Swal from 'sweetalert2';

type TableItem = {
  id: number;
  table_number: string;
  zone_id: number;
  status: string;
};

type ZoneItem = {
  id: number;
  name: string;
  status: string;
};

export default function TableManagement() {
  const [tables, setTables] = useState<TableItem[]>([]); // State สำหรับเก็บข้อมูลโต๊ะจาก API
  const [zones, setZones] = useState<ZoneItem[]>([]);  // State สำหรับเก็บข้อมูลโซนจาก API
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state สำหรับเพิ่มโต๊ะใหม่
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newZone, setNewZone] = useState('');  // ใช้เป็นค่าว่างก่อนเพื่อรอให้ข้อมูลโซนถูกโหลด

  // Modal state สำหรับแก้ไขโต๊ะ
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTable, setEditTable] = useState<TableItem | null>(null); // สำหรับการแก้ไขโต๊ะ
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editZone, setEditZone] = useState('');  // สำหรับแก้ไขโซน

  const fetchTables = async () => {
    try {
      const tablesResponse = await axios.get('http://localhost:8080/api/table');
      setTables(tablesResponse.data);
      console.log('Fetched tables:', tablesResponse.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchZones = async () => {
    try {
      const zonesResponse = await axios.get('http://localhost:8080/api/zones');
      setZones(zonesResponse.data);
      console.log('Fetched zones:', zonesResponse.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchZones();
  }, []);

  // กรองโซนที่มีสถานะเป็น 'available'
  const availableZones = zones.filter((zone) => zone.status === 'available');

  // คำนวณ newZone และ editZone ใน useEffect หลังจาก zones ถูกโหลด
  useEffect(() => {
    if (availableZones.length > 0) {
      setNewZone(availableZones[0]?.name || '');  // ใช้ชื่อโซนแรกเป็นค่าเริ่มต้น
      setEditZone(availableZones[0]?.name || '');  // สำหรับการแก้ไข
    }
  }, [zones]); // คำนวณเมื่อ zones เปลี่ยนแปลง

  const filteredTables = tables.filter((table) =>
    (table.table_number && table.table_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (table.zone_id && zones.find(zone => zone.id === table.zone_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddTable = async () => {
  if (!newTableNumber.trim() || !newZone.trim()) {
    Swal.fire({
      title: 'กรุณากรอกหมายเลขโต๊ะและเลือกโซน',
      icon: 'warning',
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  // หาค่า zone_id จากชื่อโซน
  const newZoneId = zones.find(zone => zone.name === newZone)?.id || 1;

  const newTable = {
    table_number: newTableNumber.trim(),
    zone_id: newZoneId,
    status: 'available',  // สถานะเริ่มต้นของโต๊ะ
  };

  try {
    // ส่งข้อมูลโต๊ะใหม่ไปที่ API
    const response = await axios.post('http://localhost:8080/api/table', newTable);

    // อัปเดตข้อมูลโต๊ะใน state
    setTables([...tables, response.data]);

    // ปิด modal
    setShowAddModal(false);

    Swal.fire({
      title: 'เพิ่มโต๊ะเรียบร้อย!',
      icon: 'success',
      timer: 2000,  // ปิดหลังจาก 2 วินาที
      showConfirmButton: false,
    });
  } catch (error) {
    console.error('Error adding table:', error);
    Swal.fire({
      title: 'เกิดข้อผิดพลาดในการเพิ่มโต๊ะ',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false,
    });
  }
};


const handleDelete = async (id: number) => {
  try {
    // ลบโต๊ะ
    await axios.delete(`http://localhost:8080/api/table/${id}`);
    
    // อัปเดตข้อมูลใน state
    setTables(tables.filter(table => table.id !== id));
    
    // แจ้งเตือนหลังจากลบสำเร็จ
    Swal.fire({
      title: 'ลบโต๊ะเรียบร้อย!',
      icon: 'success',
      timer: 2000,  // แสดง 2 วินาทีแล้วปิดเอง
      showConfirmButton: false,  // ไม่มีปุ่มยืนยัน
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    Swal.fire({
      title: 'เกิดข้อผิดพลาดในการลบโต๊ะ',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false,
    });
  }
};

const toggleStatus = async (id: number) => {
  const table = tables.find((t) => t.id === id);
  if (!table) return;

  const updatedStatus = table.status === 'available' ? 'unavailable' : 'available';

  try {
    // ส่งข้อมูลที่อัปเดตไปที่ backend
    await axios.patch(`http://localhost:8080/api/table/${id}`, {
      table_number: table.table_number,
      zone_id: table.zone_id,
      status: updatedStatus,
    });

    // อัปเดตสถานะใน state
    setTables(
      tables.map((t) =>
        t.id === id ? { ...t, status: updatedStatus } : t
      )
    );

    // แจ้งเตือนการเปลี่ยนสถานะ
    Swal.fire({
      title: `โต๊ะ ${table.table_number} สถานะเปลี่ยนเป็น ${updatedStatus === 'available' ? 'เปิด' : 'ปิด'}`,
      icon: 'success',
      timer: 2000,  // ปิดหลังจาก 2 วินาที
      showConfirmButton: false,  // ไม่มีปุ่มยืนยัน
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

const handleSaveEdit = async () => {
  if (!editTableNumber.trim() || !editZone.trim()) {
    Swal.fire({
      title: 'กรุณากรอกหมายเลขโต๊ะและเลือกโซน',
      icon: 'warning',
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  if (!editTable?.id) {
    Swal.fire({
      title: 'ไม่พบข้อมูลโต๊ะ',
      icon: 'warning',
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  const newZoneId = zones.find(zone => zone.name === editZone)?.id || 1;

  const updatedTable = {
    table_number: editTableNumber.trim(),
    zone_id: newZoneId,
    status: 'available',
  };

  try {
    console.log(`Updating table with ID ${editTable.id}`);
    const response = await axios.patch(`http://localhost:8080/api/table/${editTable.id}`, updatedTable);
    console.log('Table updated:', response.data);

    // อัปเดตข้อมูลใน state
    setTables(tables.map((t) =>
      t.id === editTable.id ? { ...t, table_number: updatedTable.table_number, zone_id: updatedTable.zone_id } : t
    ));

    setShowEditModal(false);
    Swal.fire({
      title: 'แก้ไขโต๊ะเรียบร้อย!',
      icon: 'success',
      timer: 2000,  // แสดง 2 วินาทีแล้วปิด
      showConfirmButton: false,
    });
  } catch (error) {
    console.error('Error updating table:', error);
    Swal.fire({
      title: 'เกิดข้อผิดพลาดในการอัปเดตโต๊ะ',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false,
    });
  }
};

  const openEditModal = (table: TableItem) => {
    setEditTable(table);
    setEditTableNumber(table.table_number);
    setEditZone(zones.find(zone => zone.id === table.zone_id)?.name || '');  // Set zone based on table data
    setShowEditModal(true);
    console.log("Edit Table ID:", table.id);  // เช็คว่า id ของ table มีค่า
  };
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 border-b border-gray-400 pb-2">
        Manage Tables
      </h1>

      <div className="flex justify-end mb-5 space-x-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-green-800 hover:bg-green-900 text-white font-semibold px-4 py-2 rounded"
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          ADD TABLE
        </button>
      </div>

      {/* Modal เพิ่มโต๊ะ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white p-6 rounded shadow-lg w-80" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">เพิ่มโต๊ะ</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="หมายเลขโต๊ะ"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
            />
            <select
              className="w-full border border-gray-300 rounded p-2 mb-4"
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
            >
              {availableZones.map(zone => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => setShowAddModal(false)}>
                ยกเลิก
              </button>
              <button className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900" onClick={handleAddTable} disabled={availableZones.length === 0}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แก้ไขโต๊ะ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white p-6 rounded shadow-lg w-80" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">แก้ไขโต๊ะ</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              value={editTableNumber}
              onChange={(e) => setEditTableNumber(e.target.value)}
            />
            <select
              className="w-full border border-gray-300 rounded p-2 mb-4"
              value={editZone}
              onChange={(e) => setEditZone(e.target.value)}
            >
              {availableZones.map(zone => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => setShowEditModal(false)}>
                ยกเลิก
              </button>
              <button className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900" onClick={handleSaveEdit}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ตารางการแสดงโต๊ะ */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">ลำดับ</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">หมายเลขโต๊ะ</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">โซน</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Action</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTables.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">ไม่พบข้อมูลโต๊ะ</td>
              </tr>
            ) : (
              paginatedTables.map((table, idx) => (
                <tr key={table.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-3 text-sm text-gray-700 font-bold">{table.table_number}</td>
                  <td className="p-3 text-sm text-gray-700">{zones.find(zone => zone.id === table.zone_id)?.name || 'ไม่ทราบ'}</td>
                  <td className="p-3 text-center flex justify-center space-x-4">
                    <button onClick={() => openEditModal(table)} title="แก้ไข" className="text-gray-600 hover:text-gray-900">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button title="ลบ" className="text-gray-400 hover:text-red-600" onClick={() => handleDelete(table.id)}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={table.status === 'available'}
                        onChange={() => toggleStatus(table.id)} // Toggle table status
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
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className={`px-4 py-1 rounded-md border ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 bg-white'}`}>
          Previous
        </button>
        {[...Array(totalPages).keys()].map((pageNum) => (
          <button key={pageNum + 1} onClick={() => setCurrentPage(pageNum + 1)} className={`px-4 py-1 rounded-md border ${currentPage === pageNum + 1 ? 'bg-green-800 text-white border-green-800' : 'bg-white hover:bg-gray-200'}`}>
            {pageNum + 1}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className={`px-4 py-1 rounded-md border ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 bg-white'}`}>
          Next
        </button>
      </div>
    </div>
  );
}
