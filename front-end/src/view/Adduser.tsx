import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCashier } from '../services/cashierService.ts'; // Import function
import Swal from 'sweetalert2';

export default function AddUserForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('cashier'); // Default to "cashier"
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่ได้รับการยืนยันตัวตน',
        text: 'กรุณาล็อกอินอีกครั้ง',
      });
      navigate('/login');  // ทำการเปลี่ยนเส้นทางไปที่หน้า Login
      return;
    }

    const newUser = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      username,
      password,
      status,  // Use "cashier" as the default value for status
    };

    try {
      console.log('Sending request to create cashier:', newUser);  // Log the data being sent
      const response = await createCashier(newUser);

      // แสดงข้อความ success เมื่อเพิ่มผู้ใช้สำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'ผู้ใช้ถูกเพิ่มเรียบร้อย!',
        showConfirmButton: false,
        timer: 1500,
      });

      // เปลี่ยนเส้นทางไปยังหน้า Manage Users
      navigate('/admin/manage-user');
    } catch (error) {
      // แสดงข้อความ error เมื่อเกิดปัญหา
      console.error('Error adding user:', error);
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถเพิ่มผู้ใช้ได้!',
        text: 'กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-5">
      <h2 className="text-xl uppercase italic font-semibold text-gray-600 mb-4 border-b border-gray-300 pb-2">
        ADD USER
      </h2>

      {/* Form Fields */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">First Name</label>
        <input
          type="text"
          placeholder="กรอกชื่อจริง"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          placeholder="กรอกนามสกุล"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="กรอกอีเมล"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          placeholder="กรอกเบอร์โทรศัพท์"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Username</label>
        <input
          type="text"
          placeholder="กรอกชื่อผู้ใช้"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Password</label>
        <input
          type="password"
          placeholder="กรอกรหัสผ่าน"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Status</label>
        <input
          type="text"
          value="cashier" // Status is fixed as "cashier"
          disabled
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          className="bg-green-800 text-white px-6 py-2 rounded hover:bg-green-900 font-semibold"
        >
          บันทึก
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/manage-user')}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-semibold"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
