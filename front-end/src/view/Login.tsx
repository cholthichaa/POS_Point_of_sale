import { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ใช้ navigate เพื่อเปลี่ยนเส้นทางหลังจาก login สำเร็จ

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });

      if (response.data && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);

        // Decode the token
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded); // ตรวจสอบข้อมูลที่ decode ออกมา

        // เก็บข้อมูลใน localStorage หลังจากล็อกอินสำเร็จ
        localStorage.setItem('role', decoded.role);

        // ตรวจสอบว่า userId อยู่ในโครงสร้างไหนของ decoded token
        if (decoded.userId) {
          localStorage.setItem('userId', decoded.userId); // เก็บ userId ลง localStorage
        } else {
          // ถ้าไม่พบ userId ให้ลองตรวจสอบว่าใช้คีย์ไหน
          console.error('userId not found in decoded token');
        }

        // เรียก onLoginSuccess พร้อมกับ decoded.role
        onLoginSuccess(decoded.role);

        // เปลี่ยนเส้นทางไปยังหน้าที่เหมาะสมหลังจากล็อกอินสำเร็จ
        if (decoded.role === 'cashier') {
          navigate('/cashier/home');
        } else if (decoded.role === 'admin') {
          navigate('/admin/dashboard');
        }
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เข้าสู่ระบบไม่สำเร็จ โปรดลองอีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-rose-200">
      <div className="bg-white rounded-3xl p-10 w-96 flex flex-col items-center shadow-lg">
        <div className="bg-cyan-400 rounded-full p-4 mb-8">
          <UserIcon className="h-12 w-12 text-cyan-700" />
        </div>
        <form className="w-full" onSubmit={handleSubmit}>
          {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
          <div className="mb-6">
            <label htmlFor="username" className="block text-blue-800 font-semibold mb-1">
              USERNAME
            </label>
            <div className="flex items-center border border-blue-400 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-300">
              <UserIcon className="h-6 w-6 text-blue-400 mr-2" />
              <input
                id="username"
                type="text"
                placeholder="กรุณากรอกชื่อผู้ใช้"
                className="outline-none w-full text-blue-400 placeholder-blue-300 bg-transparent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="block text-blue-800 font-semibold mb-1">
              PASSWORD
            </label>
            <div className="flex items-center border border-blue-400 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-300">
              <LockClosedIcon className="h-6 w-6 text-blue-400 mr-2" />
              <input
                id="password"
                type="password"
                placeholder="กรุณากรอกรหัสผ่าน"
                className="outline-none w-full text-blue-400 placeholder-blue-300 bg-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-cyan-400 text-white rounded-lg py-2 w-full font-semibold hover:bg-cyan-500 transition"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
