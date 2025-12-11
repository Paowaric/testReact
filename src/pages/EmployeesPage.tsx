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
    const [loading, setLoading] = useState(true);
    const [employeeStats, setEmployeeStats] = useState<Map<string, { weeklyTotal: number; monthlyTotal: number }>>(new Map());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const employeesData = await EmployeeService.getAll();
            setEmployees(employeesData);

            // Calculate stats for each employee
            const now = new Date();
            const statsMap = new Map<string, { weeklyTotal: number; monthlyTotal: number }>();

            for (const emp of employeesData) {
                const monthlyTotal = await DailyWageService.getMonthlyTotal(
                    emp.id,
                    now.getFullYear(),
                    now.getMonth() + 1
                );
                // For weekly we'll estimate from monthly for now (API doesn't have weekly endpoint)
                statsMap.set(emp.id, { weeklyTotal: 0, monthlyTotal });
            }
            setEmployeeStats(statsMap);
        } catch (error) {
            console.error('Failed to load employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = () => {
        setEditingEmployee(null);
        setShowForm(true);
    };

    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee(employee);
        setShowForm(true);
    };

    const handleDeleteEmployee = async (id: string) => {
        if (confirm('ต้องการลบพนักงานคนนี้?')) {
            await EmployeeService.delete(id);
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

    const getStats = (employeeId: string) => {
        return employeeStats.get(employeeId) || { weeklyTotal: 0, monthlyTotal: 0 };
    };

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
                    {filteredEmployees.map((employee) => {
                        const stats = getStats(employee.id);
                        return (
                            <EmployeeCard
                                key={employee.id}
                                employee={employee}
                                weeklyTotal={stats.weeklyTotal}
                                monthlyTotal={stats.monthlyTotal}
                                onEdit={() => handleEditEmployee(employee)}
                                onDelete={() => handleDeleteEmployee(employee.id)}
                            />
                        );
                    })}
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
