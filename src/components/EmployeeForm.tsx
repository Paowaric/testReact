// src/components/EmployeeForm.tsx
import { useState, useEffect } from 'react';
import { EmployeeService } from '../services/DataService';
import type { Employee } from '../types/types';

interface EmployeeFormProps {
    employee: Employee | null;
    onSubmit: () => void;
    onCancel: () => void;
}

export default function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [baseDailyWage, setBaseDailyWage] = useState(350);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (employee) {
            setName(employee.name);
            setPhone(employee.phone);
            setBaseDailyWage(employee.baseDailyWage);
            setNotes(employee.notes);
        }
    }, [employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('กรุณากรอกชื่อพนักงาน');
            return;
        }

        if (phone && !/^\d{10}$/.test(phone)) {
            setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
            return;
        }

        if (baseDailyWage <= 0) {
            setError('ค่าแรงต้องมากกว่า 0');
            return;
        }

        try {
            if (employee) {
                await EmployeeService.update(employee.id, { name, phone, baseDailyWage, notes });
            } else {
                await EmployeeService.create({ name, phone, baseDailyWage, notes });
            }

            onSubmit();
        } catch (error) {
            console.error('Failed to save employee:', error);
            setError('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{employee ? '✏️ แก้ไขพนักงาน' : '➕ เพิ่มพนักงาน'}</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">ชื่อพนักงาน *</label>
                            <input
                                type="text"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="กรอกชื่อพนักงาน"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">เบอร์โทร</label>
                            <input
                                type="tel"
                                className="input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="081-xxx-xxxx"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">ค่าแรงรายวัน (บาท)</label>
                            <input
                                type="number"
                                className="input"
                                value={baseDailyWage}
                                onChange={(e) => setBaseDailyWage(Number(e.target.value))}
                                min="0"
                                step="10"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">หมายเหตุ</label>
                            <textarea
                                className="input"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="เช่น พนักงานอาวุโส, พนักงานใหม่..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            ยกเลิก
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {employee ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงาน'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
