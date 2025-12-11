// src/pages/SalaryPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmployeeService, DailyWageService } from '../services/DataService';
import type { Employee, DailyWage } from '../types/types';
import DailyWageForm from '../components/DailyWageForm';
import '../styles/salary.css';

export default function SalaryPage() {
    const [searchParams] = useSearchParams();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [wages, setWages] = useState<DailyWage[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);
    const [editingWage, setEditingWage] = useState<DailyWage | null>(null);
    const [loading, setLoading] = useState(true);
    const [employeeStats, setEmployeeStats] = useState<{ weeklyTotal: number; monthlyTotal: number }>({ weeklyTotal: 0, monthlyTotal: 0 });

    useEffect(() => {
        loadData();
        const empId = searchParams.get('employee');
        if (empId) {
            setSelectedEmployeeId(empId);
        }
    }, [searchParams]);

    useEffect(() => {
        loadWages();
    }, [selectedEmployeeId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const employeesData = await EmployeeService.getAll();
            setEmployees(employeesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadWages = async () => {
        try {
            let wagesData: DailyWage[];
            if (selectedEmployeeId) {
                wagesData = await DailyWageService.getByEmployee(selectedEmployeeId);
                // Load stats for selected employee
                const now = new Date();
                const monthlyTotal = await DailyWageService.getMonthlyTotal(
                    selectedEmployeeId,
                    now.getFullYear(),
                    now.getMonth() + 1
                );
                setEmployeeStats({ weeklyTotal: 0, monthlyTotal });
            } else {
                wagesData = await DailyWageService.getAll();
            }
            setWages(wagesData);
        } catch (error) {
            console.error('Failed to load wages:', error);
        }
    };

    const handleAddWage = () => {
        setEditingWage(null);
        setShowForm(true);
    };

    const handleEditWage = (wage: DailyWage) => {
        setEditingWage(wage);
        setShowForm(true);
    };

    const handleDeleteWage = async (id: string) => {
        if (confirm('ต้องการลบรายการนี้?')) {
            await DailyWageService.delete(id);
            loadWages();
        }
    };

    const handleFormSubmit = () => {
        setShowForm(false);
        setEditingWage(null);
        loadWages();
    };

    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

    const filteredWages = wages
        .filter(w => !selectedEmployeeId || w.employeeId === selectedEmployeeId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
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
                    <h1 className="page-title">💰 บันทึกเงินรายวัน</h1>
                    <p className="page-subtitle">บันทึกและติดตามค่าแรงพนักงาน</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddWage}>
                    ➕ บันทึกเงินวันนี้
                </button>
            </div>

            {/* Employee Selection */}
            <div className="salary-filters">
                <select
                    className="input"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                >
                    <option value="">-- ดูพนักงานทั้งหมด --</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>

                <input
                    type="date"
                    className="input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {/* Stats for Selected Employee */}
            {selectedEmployee && (
                <div className="salary-stats">
                    <div className="stat-card">
                        <div className="stat-icon">👤</div>
                        <div>
                            <div className="stat-value">{selectedEmployee.name}</div>
                            <div className="stat-label">พนักงาน</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💵</div>
                        <div>
                            <div className="stat-value">฿{selectedEmployee.baseDailyWage.toLocaleString()}</div>
                            <div className="stat-label">ค่าแรงต่อวัน</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div>
                            <div className="stat-value">฿{employeeStats.weeklyTotal.toLocaleString()}</div>
                            <div className="stat-label">สัปดาห์นี้</div>
                        </div>
                    </div>
                    <div className="stat-card stat-card-gradient">
                        <div className="stat-icon">📊</div>
                        <div>
                            <div className="stat-value">฿{employeeStats.monthlyTotal.toLocaleString()}</div>
                            <div className="stat-label">เดือนนี้</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Wage Records Table */}
            {filteredWages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💰</div>
                    <h3>ยังไม่มีบันทึก</h3>
                    <p>กดปุ่ม "บันทึกเงินวันนี้" เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>วันที่</th>
                                <th>พนักงาน</th>
                                <th>จำนวนเงิน</th>
                                <th>ปรับเพิ่ม/ลด</th>
                                <th>เหตุผล</th>
                                <th>หมายเหตุ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWages.map((wage) => (
                                <tr key={wage.id}>
                                    <td>{formatDate(wage.date)}</td>
                                    <td><strong>{wage.employeeName}</strong></td>
                                    <td className="amount-cell">฿{wage.amount.toLocaleString()}</td>
                                    <td>
                                        {wage.adjustment !== 0 && (
                                            <span className={`badge ${wage.adjustment > 0 ? 'badge-success' : 'badge-danger'}`}>
                                                {wage.adjustment > 0 ? '+' : ''}{wage.adjustment.toLocaleString()}
                                            </span>
                                        )}
                                    </td>
                                    <td className="reason-cell">{wage.adjustmentReason || '-'}</td>
                                    <td className="notes-cell">{wage.notes || '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn btn-ghost btn-icon" onClick={() => handleEditWage(wage)}>
                                                ✏️
                                            </button>
                                            <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteWage(wage.id)}>
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <DailyWageForm
                    wage={editingWage}
                    employees={employees}
                    selectedEmployeeId={selectedEmployeeId}
                    defaultDate={selectedDate}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
}
