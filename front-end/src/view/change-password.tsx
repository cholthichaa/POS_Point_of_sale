import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ChangePasswordForm({ initialUsername = '', onSave, onCancel }) {
  const [username] = useState(initialUsername)  // กำหนด readonly
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('รหัสผ่านใหม่กับยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    if (onSave) {
      onSave({ username, newPassword })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-5">
      <h2 className="text-xl uppercase italic font-semibold text-gray-600 mb-4 border-b border-gray-300 pb-2">
        เปลี่ยนรหัสผ่าน
      </h2>

      <div>
        <label className="block mb-1 font-medium text-gray-700">ชื่อผู้ใช้</label>
        <input
          type="text"
          value={username}
          readOnly
          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">รหัสผ่านใหม่</label>
        <input
          type="password"
          placeholder="กรอกรหัสผ่านใหม่"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
        <input
          type="password"
          placeholder="ยืนยันรหัสผ่านใหม่"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
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
  )
}
