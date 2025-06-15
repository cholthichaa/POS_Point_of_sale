import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCashierById, updateCashier } from '../services/cashierService.ts';  // Make sure this matches your service
import Swal from 'sweetalert2';

// Function to format the created_at date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH'); // Format to Thai date format (DD/MM/YYYY)
};

export default function EditUserForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await getCashierById(id);
        console.log('🧪 response from API:', response); // << แก้แล้ว

        const user = response; // ✅ แก้ตรงนี้

        if (!user || typeof user !== 'object') {
          console.error('❌ ไม่พบข้อมูล user:', user);
          return;
        }

        // ✅ ตั้งค่าทุก field จาก object ที่ได้มา
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setUsername(user.username || '');
        setStatus(user.status || '');
        setCreatedAt(user.created_at || '');
      } catch (error) {
        console.error('❌ ดึงข้อมูลไม่สำเร็จ:', error);
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

const handleSubmit = async (e) => {
  e.preventDefault();

  // ตรวจสอบว่าข้อมูลไม่ว่างเปล่า
  if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !username.trim()) {
    Swal.fire({
      title: 'ข้อมูลไม่ครบถ้วน',
      text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      icon: 'warning',
      confirmButtonText: 'ตกลง',
    });
    return;  // หยุดการทำงานเมื่อข้อมูลไม่ครบถ้วน
  }

  // ตรวจสอบอีเมลซ้ำ
  const isEmailTaken = await checkEmailExistence(email);  // ฟังก์ชันนี้จะตรวจสอบในฐานข้อมูล
  if (isEmailTaken) {
    Swal.fire({
      title: 'อีเมลซ้ำ',
      text: 'อีเมลนี้ถูกใช้ไปแล้ว',
      icon: 'error',
      confirmButtonText: 'ตกลง',
    });
    return;
  }

  // ตรวจสอบชื่อผู้ใช้ซ้ำ
  const isUsernameTaken = await checkUsernameExistence(username);  // ฟังก์ชันนี้จะตรวจสอบในฐานข้อมูล
  if (isUsernameTaken) {
    Swal.fire({
      title: 'ชื่อผู้ใช้ซ้ำ',
      text: 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว',
      icon: 'error',
      confirmButtonText: 'ตกลง',
    });
    return;
  }

  const updatedUser = {
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    username,
    status,
  };

  try {
    // Call the updateCashier API
    await updateCashier(id, updatedUser);

    // Show success alert after successful update
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'ข้อมูลของผู้ใช้ได้อัปเดตเรียบร้อยแล้ว.',
      icon: 'success',
      timer: 5000,  // หายไปหลังจาก 5 วินาที
      showConfirmButton: false,  // ปิดปุ่ม "ตกลง"
    });

    // Redirect to the user management page after success
    navigate('/admin/manage-user');

  } catch (error) {
    console.error('Error updating user:', error);

    // Show error alert if the update fails
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้.',
      icon: 'error',
      timer: 2000,  // หายไปหลังจาก 2 วินาที
      showConfirmButton: false,  // ปิดปุ่ม "ตกลง"
    });
  }
};

// ฟังก์ชันที่ใช้ตรวจสอบอีเมลซ้ำ
const checkEmailExistence = async (email) => {
  try {
    const response = await axios.get(`/api/check-email?email=${email}`);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

// ฟังก์ชันที่ใช้ตรวจสอบชื่อผู้ใช้ซ้ำ
const checkUsernameExistence = async (username) => {
  try {
    const response = await axios.get(`/api/check-username?username=${username}`);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};



  if (loading) {
    return <div>Loading...</div>;  // Show loading state until user data is fetched
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-5">
      <h2 className="text-xl uppercase italic font-semibold text-gray-600 mb-4 border-b border-gray-300 pb-2">
        EDIT USER
      </h2>

      {/* First Name Field */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">First Name</label>
        <input
          type="text"
          placeholder="กรอกชื่อจริง"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      {/* Last Name Field */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          placeholder="กรอกนามสกุล"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="กรอกอีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Phone Field */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          placeholder="กรอกเบอร์โทรศัพท์"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Username Field */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Username</label>
        <input
          type="text"
          placeholder="กรอกชื่อผู้ใช้"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      {/* Status Field */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        >
          <option value="" disabled hidden>
            กรุณาเลือกสถานะ
          </option>
          <option value="admin">แอดมิน</option>
          <option value="cashier">แคสเชียร์</option>
        </select>
      </div>

      {/* Created At Field */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">วันที่สร้าง</label>
        <input
          type="text"
          value={createdAt ? formatDate(createdAt) : '-'}  // Format and display created_at
          disabled
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Buttons */}
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
