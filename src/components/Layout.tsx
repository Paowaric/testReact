// src/components/Layout.tsx
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { exportOrders, exportCustomers, exportEmployeeWages, exportStock, exportMonthlySummary } from '../services/ExportService';
import './Layout.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Don't show layout on login/register pages
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) {
    return <>{children}</>;
  }

  const isAdmin = hasRole('admin');

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="sidebar-toggle btn btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <h1 className="app-title">🐔 ร้านไก่ BAby</h1>
        </div>

        <div className="topbar-right">
          {/* Export Button */}
          {isAdmin && (
            <div className="export-dropdown">
              <button
                className="btn btn-secondary"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                📥 Export
              </button>
              {showExportMenu && (
                <div className="dropdown-menu">
                  <button onClick={() => { exportOrders(); setShowExportMenu(false); }}>
                    📦 ออเดอร์
                  </button>
                  <button onClick={() => { exportCustomers(); setShowExportMenu(false); }}>
                    👥 ลูกค้า
                  </button>
                  <button onClick={() => { exportEmployeeWages(); setShowExportMenu(false); }}>
                    💰 เงินเดือน
                  </button>
                  <button onClick={() => { exportStock(); setShowExportMenu(false); }}>
                    🍗 สต็อก
                  </button>
                  <button onClick={() => { exportMonthlySummary(); setShowExportMenu(false); }}>
                    📊 สรุปรายเดือน
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn btn btn-ghost btn-icon"
            onClick={toggleTheme}
            title={theme === 'light' ? 'เปิด Dark Mode' : 'เปิด Light Mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`user-role badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                {user.role === 'admin' ? 'Admin' : 'Staff'}
              </span>
              <button className="btn btn-ghost" onClick={logout}>
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📦</span>
            <span className="nav-text">ออเดอร์</span>
          </NavLink>

          {isAdmin && (
            <>
              <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">👥</span>
                <span className="nav-text">ลูกค้า</span>
              </NavLink>

              <NavLink to="/stock" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">🍗</span>
                <span className="nav-text">สต็อก</span>
              </NavLink>

              <div className="nav-divider" />

              <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">👷</span>
                <span className="nav-text">พนักงาน</span>
              </NavLink>

              <NavLink to="/salary" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">💰</span>
                <span className="nav-text">เงินรายวัน</span>
              </NavLink>

              <div className="nav-divider" />

              <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">📅</span>
                <span className="nav-text">ปฏิทิน</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="content">{children}</main>
    </div>
  );
}
