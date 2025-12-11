// src/components/DailyWageForm.tsx
import { useState, useEffect } from 'react';
import { DailyWageService } from '../services/DataService';
import type { DailyWage, Employee } from '../types/types';

interface DailyWageFormProps {
    wage: DailyWage | null;
    employees: Employee[];
    selectedEmployeeId?: string;
    defaultDate?: string;
    onSubmit: () => void;
    onCancel: () => void;
}

const REASON_OPTIONS = [
    { label: 'เลือกเหตุผล...', value: '' },
    { label: 'ทำงานดี', value: 'ทำงานดี' },
    { label: 'ทำงานล่วงเวลา', value: 'ทำงานล่วงเวลา' },
    { label: 'หยุดงาน', value: 'หยุดงาน' },
    { label: 'มาสาย', value: 'มาสาย' },
    { label: 'ลาป่วย', value: 'ลาป่วย' },
    { label: 'ลากิจ', value: 'ลากิจ' },
    { label: 'อื่นๆ', value: 'other' },
];

export default function DailyWageForm({
    wage,
    employees,
    selectedEmployeeId,
    defaultDate,
    onSubmit,
    onCancel
}: DailyWageFormProps) {
    const [employeeId, setEmployeeId] = useState(selectedEmployeeId || '');
    const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(0);
    const [adjustment, setAdjustment] = useState(0);
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (wage) {
            setEmployeeId(wage.employeeId);
            setDate(wage.date);
            setAmount(wage.amount);
            setAdjustment(wage.adjustment);
            setAdjustmentReason(wage.adjustmentReason);
            setNotes(wage.notes);
        } else if (employeeId) {
            const emp = employees.find(e => e.id === employeeId);
            if (emp) {
                setAmount(emp.baseDailyWage);
            }
        }
    }, [wage, employeeId, employees]);

    const handleEmployeeChange = (empId: string) => {
        setEmployeeId(empId);
        const emp = employees.find(e => e.id === empId);
        if (emp && !wage) {
            setAmount(emp.baseDailyWage);
        }
    };

    const handleAdjustmentChange = (adj: number) => {
        setAdjustment(adj);
        const emp = employees.find(e => e.id === employeeId);
        if (emp) {
            setAmount(emp.baseDailyWage + adj);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!employeeId) {
            setError('กรุณาเลือกพนักงาน');
            return;
        }

        if (!date) {
            setError('กรุณาเลือกวันที่');
            return;
        }

        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) {
            setError('ไม่พบพนักงาน');
            return;
        }

        const finalReason = adjustmentReason === 'other' ? customReason : adjustmentReason;

        const wageData = {
            employeeId,
            employeeName: employee.name,
            date,
            amount,
            adjustment,
            adjustmentReason: finalReason,
            notes,
        };

        try {
            if (wage) {
                await DailyWageService.update(wage.id, wageData);
            } else {
                await DailyWageService.create(wageData);
            }

            onSubmit();
        } catch (error) {
            console.error('Failed to save wage:', error);
            setError('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{wage ? '✏️ แก้ไขบันทึก' : '💰 บันทึกเงินรายวัน'}</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 2 }}>
                                <label className="form-label">พนักงาน *</label>
                                <select
                                    className="input"
                                    value={employeeId}
                                    onChange={(e) => handleEmployeeChange(e.target.value)}
                                    required
                                >
                                    <option value="">เลือกพนักงาน...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} (฿{emp.baseDailyWage}/วัน)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">วันที่</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">ปรับเพิ่ม/ลด (บาท)</label>
                            <div className="adjustment-input">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => handleAdjustmentChange(adjustment - 50)}
                                >
                                    -50
                                </button>
                                <input
                                    type="number"
                                    className="input"
                                    value={adjustment}
                                    onChange={(e) => handleAdjustmentChange(Number(e.target.value))}
                                    style={{ textAlign: 'center' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => handleAdjustmentChange(adjustment + 50)}
                                >
                                    +50
                                </button>
                            </div>
                            <small className="adjustment-hint">
                                {adjustment > 0 && <span className="text-success">เพิ่ม +{adjustment} บาท</span>}
                                {adjustment < 0 && <span className="text-danger">ลด {adjustment} บาท</span>}
                                {adjustment === 0 && <span className="text-muted">ไม่มีการปรับ</span>}
                            </small>
                        </div>

                        <div className="amount-display">
                            <span>จำนวนเงินที่ได้รับ:</span>
                            <span className="amount-value">฿{amount.toLocaleString()}</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">เหตุผล (ถ้ามีการปรับ)</label>
                            <select
                                className="input"
                                value={adjustmentReason}
                                onChange={(e) => setAdjustmentReason(e.target.value)}
                            >
                                {REASON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {adjustmentReason === 'other' && (
                            <div className="form-group">
                                <label className="form-label">ระบุเหตุผล</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="ระบุเหตุผล..."
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">หมายเหตุเพิ่มเติม</label>
                            <textarea
                                className="input"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="เช่น วันนี้ทำงานได้ดีมาก, หยุดเพราะลูกป่วย..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            ยกเลิก
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {wage ? 'บันทึกการแก้ไข' : 'บันทึกเงินวันนี้'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
