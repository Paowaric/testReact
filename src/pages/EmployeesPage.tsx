// src/pages/EmployeesPage.tsx
import { useState, useEffect } from 'react';
import { EmployeeService, DailyWageService } from '../services/DataService';
import type { Employee } from '../types/types';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeForm from '../components/EmployeeForm';
import '../styles/employees.css';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setEmployees(EmployeeService.getAll());
    };

    const handleAddEmployee = () => {
        setEditingEmployee(null);
        setShowForm(true);
    };

    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee(employee);
        setShowForm(true);
    };

    const handleDeleteEmployee = (id: string) => {
        if (confirm('ต้องการลบพนักงานคนนี้?')) {
            EmployeeService.delete(id);
            loadData();
        }
    };

    const handleFormSubmit = () => {
        setShowForm(false);
        setEditingEmployee(null);
        loadData();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingEmployee(null);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.includes(searchTerm)
    );

    const getWeeklyTotal = (employeeId: string) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return DailyWageService.getWeeklyTotal(employeeId, startOfWeek);
    };

    const getMonthlyTotal = (employeeId: string) => {
        const now = new Date();
        return DailyWageService.getMonthlyTotal(employeeId, now.getFullYear(), now.getMonth() + 1);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">👷 จัดการพนักงาน</h1>
                    <p className="page-subtitle">ข้อมูลพนักงานทั้งหมด {employees.length} คน</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddEmployee}>
                    ➕ เพิ่มพนักงาน
                </button>
            </div>

            {/* Search */}
            <div className="employees-search">
                <div className="search-input">
                    <span className="search-input-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="ค้นหาพนักงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Employee Cards */}
            {filteredEmployees.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👷</div>
                    <h3>ยังไม่มีพนักงาน</h3>
                    <p>กดปุ่ม "เพิ่มพนักงาน" เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="employees-grid">
                    {filteredEmployees.map((employee) => (
                        <EmployeeCard
                            key={employee.id}
                            employee={employee}
                            weeklyTotal={getWeeklyTotal(employee.id)}
                            monthlyTotal={getMonthlyTotal(employee.id)}
                            onEdit={() => handleEditEmployee(employee)}
                            onDelete={() => handleDeleteEmployee(employee.id)}
                        />
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <EmployeeForm
                    employee={editingEmployee}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}
        </div>
    );
}
