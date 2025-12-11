// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  OrderService,
  CustomerService,
  EmployeeService,
  DailyWageService,
  ChickenPartService,
  initializeDemoData
} from '../services/DataService';
import type { Customer, ChickenPart } from '../types/types';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    todayWages: 0,
    monthlyWages: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    totalOrders: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<ChickenPart[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [
        todayRevenue,
        monthlyRevenue,
        todayWages,
        monthlyWages,
        customers,
        employees,
        orders,
        lowStock,
        inactive
      ] = await Promise.all([
        OrderService.getTodayRevenue(),
        OrderService.getMonthlyRevenue(),
        DailyWageService.getTodayTotal(),
        DailyWageService.getMonthTotal(),
        CustomerService.getAll(),
        EmployeeService.getAll(),
        OrderService.getAll(),
        ChickenPartService.getLowStock(),
        CustomerService.getInactiveCustomers(),
      ]);

      setStats({
        todayRevenue,
        monthlyRevenue,
        todayWages,
        monthlyWages,
        totalCustomers: customers.length,
        totalEmployees: employees.length,
        totalOrders: orders.length,
      });
      setLowStockItems(lowStock);
      setInactiveCustomers(inactive);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayProfit = stats.todayRevenue - stats.todayWages;
  const monthlyProfit = stats.monthlyRevenue - stats.monthlyWages;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">🐔</div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🐔 ร้านไก่ BAby</h1>
          <p className="page-subtitle">สรุปภาพรวมธุรกิจวันนี้</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="dashboard-stats">
        <div className="stat-card stat-card-gradient">
          <div className="stat-icon">💰</div>
          <div>
            <div className="stat-value">฿{stats.todayRevenue.toLocaleString()}</div>
            <div className="stat-label">ยอดขายวันนี้</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div>
            <div className="stat-value">฿{stats.monthlyRevenue.toLocaleString()}</div>
            <div className="stat-label">ยอดขายเดือนนี้</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div>
            <div className="stat-value">฿{stats.todayWages.toLocaleString()}</div>
            <div className="stat-label">ค่าแรงวันนี้</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div>
            <div className="stat-value">฿{stats.monthlyWages.toLocaleString()}</div>
            <div className="stat-label">ค่าแรงเดือนนี้</div>
          </div>
        </div>
      </div>

      {/* Profit Stats */}
      <div className="dashboard-profit">
        <div className={`profit-card ${todayProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
          <h3>กำไรวันนี้</h3>
          <div className="profit-value">
            {todayProfit >= 0 ? '📈' : '📉'} ฿{todayProfit.toLocaleString()}
          </div>
        </div>
        <div className={`profit-card ${monthlyProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
          <h3>กำไรเดือนนี้</h3>
          <div className="profit-value">
            {monthlyProfit >= 0 ? '📈' : '📉'} ฿{monthlyProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-quick-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">ออเดอร์ทั้งหมด</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">ลูกค้า</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👷</div>
          <div>
            <div className="stat-value">{stats.totalEmployees}</div>
            <div className="stat-label">พนักงาน</div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="dashboard-alerts">
        {lowStockItems.length > 0 && (
          <div className="alert alert-warning">
            <strong>⚠️ สต็อกต่ำ:</strong> {lowStockItems.map(p => `${p.name} (${p.stock}กก.)`).join(', ')}
            <Link to="/stock" className="alert-link">ดูสต็อก →</Link>
          </div>
        )}

        {inactiveCustomers.length > 0 && (
          <div className="alert alert-warning">
            <strong>⚠️ ลูกค้าไม่ได้สั่งมากกว่า 14 วัน:</strong> {inactiveCustomers.map(c => c.name).join(', ')}
            <Link to="/customers" className="alert-link">ดูลูกค้า →</Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h2>⚡ การดำเนินการด่วน</h2>
        <div className="actions-grid">
          <Link to="/orders" className="action-card">
            <span className="action-icon">📦</span>
            <span>เพิ่มออเดอร์</span>
          </Link>
          <Link to="/salary" className="action-card">
            <span className="action-icon">💰</span>
            <span>บันทึกเงินรายวัน</span>
          </Link>
          <Link to="/calendar" className="action-card">
            <span className="action-icon">📅</span>
            <span>ปฏิทิน</span>
          </Link>
          <Link to="/stock" className="action-card">
            <span className="action-icon">🍗</span>
            <span>จัดการสต็อก</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
