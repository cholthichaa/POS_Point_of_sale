import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './view/Login.tsx';
import AppRoutes from './routes/index';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [userId, setUserId] = useState(null);  // สร้าง state สำหรับเก็บ userId
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        setUserId(decoded.userId);  // เก็บ userId จาก decoded token
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setRole(null);
        setUserId(null);  // รีเซ็ท userId ถ้า token ไม่ถูกต้อง
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUserId(user.id);  // เก็บ userId หลังจาก login
    setRole(user.role);   // เก็บ role หลังจาก login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setRole(null);
    setUserId(null);  // รีเซ็ท userId เมื่อ logout
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // หากล็อกอินแล้วให้ส่งข้อมูล role และ userId ไปยัง AppRoutes
  return <AppRoutes role={role} userId={userId} onLogout={handleLogout} />;
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
