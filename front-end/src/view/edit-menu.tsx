import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getMenuById, updateMenu } from '../services/MenuService.ts'; 

export default function EditMenuForm({ onCancel }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | string>('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams(); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchMenu = async () => {
      try {
        const menu = await getMenuById(id); 
        setName(menu.name);
        setPrice(menu.price.toString());
        setSelectedCategory(menu.category_id);
        setImageUrl(menu.image_url); 
      } catch (error) {
        console.error('Error fetching menu by id:', error);
      }
    };

    fetchCategories();
    fetchMenu();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire('กรุณากรอกชื่อเมนู');
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Swal.fire('กรุณากรอกราคาที่ถูกต้อง');
      return;
    }
    if (!selectedCategory) {
      Swal.fire('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!imageUrl.trim()) {
      Swal.fire('กรุณากรอกลิงก์รูปภาพ');
      return;
    }

    const updatedMenu = {
      name: name.trim(),
      price: Number(price),
      category_id: selectedCategory,  
      image_url: imageUrl.trim(),  
    };

    try {
      const result = await updateMenu(id, updatedMenu);
      console.log('Menu updated successfully:', result);
      
      Swal.fire({
        title: 'อัปเดตเมนูเรียบร้อย!',
        icon: 'success',
        timer: 2000,  
        timerProgressBar: true,  
        didClose: () => {
          navigate('/admin/menumanage-menu');  
        }
      });
    } catch (error) {
      console.error('Error updating menu:', error);
      Swal.fire('เกิดข้อผิดพลาดในการอัปเดตเมนู');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-xl italic font-semibold text-gray-600 mb-4 border-b border-gray-300 pb-2">
        EDIT MENU
      </h2>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Name</label>
        <input
          type="text"
          placeholder="กรอกชื่อเมนู"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Price</label>
        <input
          type="text"
          placeholder="กรอกราคา"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Category</label>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">เลือกหมวดหมู่</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">Image URL</label>
        <input
          type="text"
          placeholder="กรอกลิงก์รูปภาพ"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div className="flex space-x-4 justify-center">
        <button
          type="submit"
          className="bg-green-800 text-white px-6 py-2 rounded hover:bg-green-900 font-semibold"
        >
          บันทึก
        </button>
        <button
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
            else navigate(-1);
          }}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-semibold"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
