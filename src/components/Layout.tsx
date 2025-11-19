// src/components/Layout.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Icons } from "../icons";
import "./Layout.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`layout ${open ? "sidebar-open" : "sidebar-closed"}`}>
      <header className="topbar">
        <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
          {open ? <Icons.Times /> : <Icons.Bars />}
        </button>
        <h1 className="app-title">ร้านไก่ BAby</h1>
      </header>

      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <h2>📋 Menu</h2>
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icons.Home /> Dashboard
          </NavLink>
          <NavLink
            to="/chicken"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            ข้อมูลลูกค้า + ไก่
          </NavLink>
          <NavLink
            to="/salary"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icons.Money /> เงินเดือน
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icons.Calendar /> ปฏิทิน
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Login
          </NavLink>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
