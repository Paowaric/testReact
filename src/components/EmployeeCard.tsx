// src/components/EmployeeCard.tsx
import type { Employee } from '../types/types';
import { Link } from 'react-router-dom';

interface EmployeeCardProps {
    employee: Employee;
    weeklyTotal: number;
    monthlyTotal: number;
    onEdit: () => void;
    onDelete: () => void;
}

export default function EmployeeCard({
    employee,
    weeklyTotal,
    monthlyTotal,
    onEdit,
    onDelete
}: EmployeeCardProps) {
    return (
        <div className="employee-card card">
            <div className="employee-card-header">
                <div className="employee-avatar">
                    {employee.name.charAt(0)}
                </div>
                <div className="employee-info">
                    <h3>{employee.name}</h3>
                    <p className="employee-phone">📞 {employee.phone}</p>
                </div>
                <div className="employee-actions">
                    <button className="btn btn-ghost btn-icon" onClick={onEdit} title="แก้ไข">
                        ✏️
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={onDelete} title="ลบ">
                        🗑️
                    </button>
                </div>
            </div>

            <div className="employee-card-body">
                <div className="wage-info">
                    <div className="wage-item">
                        <span className="wage-label">ค่าแรงรายวัน</span>
                        <span className="wage-value">฿{employee.baseDailyWage.toLocaleString()}</span>
                    </div>
                    <div className="wage-item highlight">
                        <span className="wage-label">สัปดาห์นี้</span>
                        <span className="wage-value">฿{weeklyTotal.toLocaleString()}</span>
                    </div>
                    <div className="wage-item highlight-primary">
                        <span className="wage-label">เดือนนี้</span>
                        <span className="wage-value">฿{monthlyTotal.toLocaleString()}</span>
                    </div>
                </div>

                {employee.notes && (
                    <div className="employee-notes">
                        <span className="note-icon">📝</span>
                        <span>{employee.notes}</span>
                    </div>
                )}
            </div>

            <div className="employee-card-footer">
                <Link to={`/salary?employee=${employee.id}`} className="btn btn-secondary">
                    💰 บันทึกเงินรายวัน
                </Link>
            </div>
        </div>
    );
}
