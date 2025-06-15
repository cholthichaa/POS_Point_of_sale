import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for routing
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const stats = [
  { label: 'ยอดขายทั้งหมด', value: 10, unit: 'บาท', bg: 'bg-green-600 text-white' },
  { label: 'จำนวนบิล', value: 0, unit: 'บิล', bg: 'bg-white text-green-600 border border-green-600' },
  { label: 'จำนวนสินค้า', value: 0, unit: 'ชิ้น', bg: 'bg-white text-green-600 border border-green-600' },
  { label: 'จำนวนโต๊ะ', value: 0, unit: 'โต๊ะ', bg: 'bg-white text-green-600 border border-green-600' },
];

const monthlyData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Monthly Sales',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(22, 163, 74, 0.8)',
      borderRadius: 6,
      barPercentage: 0.6,
    },
  ],
};

export default function Dashboard() {
  const navigate = useNavigate();  // Initialize the useNavigate hook
  const [activeTab, setActiveTab] = useState('daily');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  if (!dashboardData) {
    return <div className="text-center text-xl">กำลังโหลดข้อมูล...</div>;
  }

  const updatedStats = stats.map(stat => {
    let value = 0;

    switch (stat.label) {
      case 'ยอดขายทั้งหมด':
        value = Number(dashboardData.total_sales);
        break;
      case 'จำนวนบิล':
        value = Number(dashboardData.total_bills);
        break;
      case 'จำนวนสินค้า':
        value = Number(dashboardData.total_menus);
        break;
      case 'จำนวนโต๊ะ':
        value = Number(dashboardData.total_tables);
        break;
      default:
        value = stat.value;
        break;
    }

    return { ...stat, value };
  });

  const updatedMonthlyData = {
    ...monthlyData,
    datasets: [
      {
        ...monthlyData.datasets[0],
        data: dashboardData.monthlySales
          ? dashboardData.monthlySales.map(sale => Number(sale))
          : monthlyData.datasets[0].data,
      },
    ],
  };

  const handleDetailClick = (stat) => {
    if (stat.label === 'ยอดขายทั้งหมด') {
      navigate('/admin/dashboard');  
    } else if (stat.label === 'จำนวนบิล') {
      navigate('/admin/manage-bill'); 
    } else if (stat.label === 'จำนวนสินค้า') {
      navigate('/admin/manage-menu'); 
    } else if (stat.label === 'จำนวนโต๊ะ') {
      navigate('/admin/manage-table'); 
    } 

  };

  return (
    <div className="p-8 bg-gradient-to-r from-green-300 to-green-600 rounded-xl shadow-2xl max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="flex flex-wrap gap-6 justify-start mb-8">
        {updatedStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-300 flex flex-col justify-between p-6 rounded-2xl shadow-lg flex-1 min-w-[220px] cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl"
            style={{ maxWidth: '23%' }}
          >
            <div className="text-sm font-semibold tracking-wide text-gray-700">{stat.label}</div>
            <div className="text-4xl font-extrabold my-3 flex items-baseline text-gray-800">
              <span>{stat.value}</span>
              <span className="ml-2 text-lg font-medium text-gray-600">{stat.unit}</span>
            </div>
            {/* Button to navigate */}
            <div
              className={`text-center text-sm ${stat.bg} py-2 mt-4 rounded-xl shadow-inner cursor-pointer`}
              onClick={() => handleDetailClick(stat)}  // On click, navigate to the relevant page
            >
              ดูรายละเอียด
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Sales Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">กราฟยอดขายรายเดือน</h3>
        <Bar data={updatedMonthlyData} options={{ responsive: true, plugins: { legend: { position: 'top' }, tooltip: { mode: 'index' } } }} />
      </div>
    </div>
  );
}
