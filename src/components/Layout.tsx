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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Don't show layout on login/register pages
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) {
    return <>{children}</>;
  }

  const isAdmin = hasRole('admin');

  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🐔</div>
          <div className="sidebar-brand-text">
            <h1>ร้านไก่ BAby</h1>
            <span>ระบบจัดการธุรกิจ</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="nav-section-title">เมนูหลัก</span>

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
              <span className="nav-section-title">ทรัพยากรบุคคล</span>

              <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">👷</span>
                <span className="nav-text">พนักงาน</span>
              </NavLink>

              <NavLink to="/salary" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">💰</span>
                <span className="nav-text">เงินรายวัน</span>
              </NavLink>

              <div className="nav-divider" />
              <span className="nav-section-title">อื่นๆ</span>

              <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">📅</span>
                <span className="nav-text">ปฏิทิน</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Sidebar Footer (User Profile) */}
        {isAuthenticated && user && (
          <div className="sidebar-footer">
            {showUserMenu && (
              <div className="user-menu-popup animate-slide-up">
                <div className="user-menu-header">
                  <div className="user-avatar small">
                    {getUserInitial()}
                  </div>
                  <div className="user-menu-info">
                    <span className="font-bold">{user.name}</span>
                    <span className="text-muted text-xs">@{user.username || 'user'}</span>
                  </div>
                </div>
                <div className="menu-divider" />
                <button className="menu-item text-danger" onClick={logout}>
                  <span className="menu-icon">🚪</span>
                  ออกจากระบบ
                </button>
              </div>
            )}

            <div className={`user-profile-sidebar ${showUserMenu ? 'active' : ''}`} onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">
                {getUserInitial()}
              </div>
              <div className="user-details sidebar-user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงาน'}</span>
              </div>
              <div className="profile-action-icon">
                {showUserMenu ? '▼' : '▲'}
              </div>
            </div>

            {/* Click outside listener could be implemented here or using a hook, 
                but for simplicity we assume user clicks the toggle again or we rely on page click */}
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />

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
            <div className="action-dropdown">
              <button
                className={`btn btn-ghost ${showExportMenu ? 'active' : ''}`}
                onClick={() => { setShowExportMenu(!showExportMenu); setShowUserMenu(false); }}
                title="นำข้อมูลออก"
              >
                📥 <span className="hidden-mobile">Export</span>
              </button>
              {showExportMenu && (
                <div className="dropdown-menu animate-fade-in">
                  <div className="dropdown-header">ส่งออกข้อมูล</div>
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
            className="btn btn-ghost btn-icon theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'เปิด Dark Mode' : 'เปิด Light Mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

        </div>
      </header>

      {/* Main Content */}
      <main className="content">{children}</main>
    </div>
  );
}
