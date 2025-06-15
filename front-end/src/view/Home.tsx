import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTables } from '../services/tableService.ts';
import { getZones } from '../services/zonesService.ts';
import { fetchOrders } from '../services/orderService.ts';

export default function CashierSystem() {
  const [selectedZone, setSelectedZone] = useState('A');  // ตั้งค่าเป็น A ทันทีเมื่อเริ่มต้น
  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // ดึงข้อมูลโซนและโต๊ะจาก API เมื่อหน้าโหลด
  useEffect(() => {
    const fetchData = async () => {
      try {
        const zonesResponse = await getZones();
        setZones(zonesResponse);

        const tablesResponse = await fetchTables('A');
        console.log('Tables in zone A:', tablesResponse);  // ตรวจสอบข้อมูลโต๊ะในโซน A

        setTables(tablesResponse);
      } catch (error) {
        console.error('Error fetching zones or tables:', error);
      }
    };

    fetchData();
  }, []);  // ดึงข้อมูลเมื่อหน้าโหลดครั้งแรก


  // ดึงข้อมูลออเดอร์ทุกครั้งเมื่อเลือกโต๊ะ
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const ordersData = await fetchOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrdersData();
  }, [selectedTable]);

  // ฟังก์ชันกรองโต๊ะที่อยู่ในโซนที่เลือก
  const filteredTables = tables.filter((table) => table.zone_id.toString() === selectedZone);
  console.log(filteredTables);  // ดูว่า filteredTables ได้ข้อมูลหรือไม่

  // เมื่อคลิกที่โต๊ะ เก็บ table_id และนำทางไปที่หน้า Manager Bill ด้วย orderId
  const handleTableClick = (tableId) => {
    setSelectedTable(tableId);
    console.log('Selected Table ID:', tableId);

    const order = orders.find(order => order.table_id === tableId && order.status === 'รอการชำระเงิน');

    if (order) {
      navigate(`/cashier/manager-bill/${order.id}`); // ใช้ order.id ไปที่หน้าบิล
    } else {
      // ถ้าไม่มีออเดอร์หรือสถานะไม่ตรง, อาจจะนำทางไปที่หน้าแก้ไขออเดอร์
      navigate(`/cashier/edit-order/${tableId}`);
    }
  };


  const isTableOrdered = (tableId) => {
    const order = orders.find(order => order.table_id === tableId);
    console.log(`Checking table ${tableId}:`, order); // Debugging log for orders
    return order ? order.status === 'รอการชำระเงิน' : false;
  };


  const isTableBooked = (tableId) => {
    const table = tables.find((table) => table.id === tableId);
    return table && table.status === 'booked';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-4 border-b-2 border-gray-700 pb-2">ระบบแคชเชียร์</h1>

      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0 mb-6">
        <p className="text-gray-700">กรุณาเลือกโต๊ะก่อนเพิ่มรายการอาหาร</p>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-600 rounded" />
          <span>จองแล้ว</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded" />
          <span>ว่าง</span>
        </div>

        <div className="flex-grow" />

        {/* แสดงโซน A โดยไม่ต้องให้ผู้ใช้เลือก */}
        <div className="flex items-center space-x-2 self-end lg:self-auto">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}  // ให้ผู้ใช้เลือกโซนได้
            className="border border-gray-300 rounded px-3 py-1 text-gray-600"
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-4">
        {filteredTables.length > 0 ? (
          filteredTables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table.id)}
              className={`py-3 rounded font-bold text-center transition-all cursor-pointer 
    ${isTableOrdered(table.id) ? 'bg-red-600 text-white border-4 border-yellow-400' : // Ordered tables as red with yellow border
                  isTableBooked(table.id) ? 'bg-gray-600 text-white hover:bg-gray-700' :
                    table.id === selectedTable ? 'bg-blue-500 text-white hover:bg-blue-600' :
                      'bg-gray-300 text-black hover:bg-gray-400'}`}
            >
              {table.table_number}
            </button>


          ))
        ) : (
          <div className="col-span-5 text-center text-gray-500">ไม่มีโต๊ะในโซนนี้</div>
        )}
      </div>
    </div>
  );
}
