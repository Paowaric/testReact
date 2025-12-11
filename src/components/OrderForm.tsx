// src/components/OrderForm.tsx
import { useState, useEffect } from 'react';
import { OrderService } from '../services/DataService';
import type { Order, Customer, ChickenPart, OrderItem } from '../types/types';

interface OrderFormProps {
    order: Order | null;
    customers: Customer[];
    chickenParts: ChickenPart[];
    onSubmit: () => void;
    onCancel: () => void;
}

export default function OrderForm({ order, customers, chickenParts, onSubmit, onCancel }: OrderFormProps) {
    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (order) {
            setCustomerId(order.customerId);
            setItems(order.items.map(i => ({
                ...i,
                chickenPartId: String(i.chickenPartId),
                quantity: Number(i.quantity),
                pricePerKg: Number(i.pricePerKg),
                total: Number(i.total)
            })));
            setNotes(order.notes);
        } else {
            // Default empty item
            addItem();
        }
    }, [order]);

    const addItem = () => {
        setItems([...items, {
            chickenPartId: '',
            chickenPartName: '',
            quantity: 1,
            pricePerKg: 0,
            total: 0,
        }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        if (field === 'chickenPartId') {
            const part = chickenParts.find(p => String(p.id) === String(value));
            if (part) {
                item.chickenPartId = String(part.id);
                item.chickenPartName = part.name;
                item.pricePerKg = part.pricePerKg;
                item.total = item.quantity * part.pricePerKg;
            }
        } else if (field === 'quantity') {
            item.quantity = Number(value);
            item.total = item.quantity * item.pricePerKg;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const getTotalAmount = () => {
        return items.reduce((sum, item) => sum + Number(item.total), 0);
    };

    const validate = (): boolean => {
        const errs: string[] = [];

        if (!customerId) {
            errs.push('กรุณาเลือกลูกค้า');
        }

        if (items.length === 0 || items.every(i => !i.chickenPartId)) {
            errs.push('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
        }

        const selectedParts = new Set<string>();
        items.forEach((item, idx) => {
            if (item.chickenPartId) {
                const partId = String(item.chickenPartId);
                if (selectedParts.has(partId)) {
                    errs.push(`รายการที่ ${idx + 1}: สินค้าซ้ำกับรายการอื่น`);
                }
                selectedParts.add(partId);

                if (item.quantity <= 0) {
                    errs.push(`รายการที่ ${idx + 1}: จำนวนต้องมากกว่า 0`);
                }
            }
        });

        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const customer = customers.find(c => c.id === customerId)!;
        const validItems = items.filter(i => i.chickenPartId);

        try {
            if (order) {
                await OrderService.update(order.id, {
                    customerId,
                    customerName: customer.name,
                    items: validItems,
                    notes,
                });
            } else {
                await OrderService.create({
                    customerId,
                    customerName: customer.name,
                    items: validItems,
                    notes,
                });
            }

            onSubmit();
        } catch (error) {
            console.error('Failed to save order:', error);
            setErrors(['เกิดข้อผิดพลาดในการบันทึก']);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{order ? '✏️ แก้ไขออเดอร์' : '➕ เพิ่มออเดอร์'}</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {errors.length > 0 && (
                            <div className="alert alert-danger">
                                {errors.map((err, i) => <div key={i}>{err}</div>)}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">ลูกค้า *</label>
                            <select
                                className="input"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                required
                            >
                                <option value="">เลือกลูกค้า...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">รายการสินค้า</label>
                            <div className="order-items-list">
                                {items.map((item, index) => (
                                    <div key={index} className="order-item-row">
                                        <select
                                            className="input"
                                            value={item.chickenPartId}
                                            onChange={(e) => updateItem(index, 'chickenPartId', e.target.value)}
                                        >
                                            <option value="">เลือกชิ้นส่วนไก่...</option>
                                            {chickenParts.map(p => {
                                                const isSelectedInOtherRow = items.some((i, iIdx) => iIdx !== index && String(i.chickenPartId) === String(p.id));
                                                return (
                                                    <option
                                                        key={p.id}
                                                        value={p.id}
                                                        disabled={isSelectedInOtherRow}
                                                        style={isSelectedInOtherRow ? { color: 'var(--text-muted)' } : {}}
                                                    >
                                                        {p.name} (฿{p.pricePerKg}/กก. - สต็อก: {p.stock}){isSelectedInOtherRow ? ' (เลือกแล้ว)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        <div className="quantity-wrapper">
                                            <button
                                                type="button"
                                                className="btn-quantity"
                                                onClick={() => {
                                                    const newValue = Math.max(0.1, Number(item.quantity) - 1);
                                                    updateItem(index, 'quantity', newValue);
                                                }}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                className="input qty-input"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                min="0.1"
                                                step="0.1"
                                                placeholder="0.0"
                                            />
                                            <button
                                                type="button"
                                                className="btn-quantity"
                                                onClick={() => {
                                                    const newValue = Number(item.quantity) + 1;
                                                    updateItem(index, 'quantity', newValue);
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <span className="item-subtotal">
                                            ฿{item.total.toLocaleString()}
                                        </span>

                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => removeItem(index)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}

                                <button type="button" className="btn btn-dashed w-full" onClick={addItem}>
                                    ➕ เพิ่มรายการ
                                </button>
                            </div>
                        </div>

                        <div className="order-total">
                            <strong>ยอดรวมทั้งหมด:</strong>
                            <span className="total-amount">฿{getTotalAmount().toLocaleString()}</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">หมายเหตุ</label>
                            <textarea
                                className="input"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="หมายเหตุเพิ่มเติม..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            ยกเลิก
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {order ? 'บันทึกการแก้ไข' : 'สร้างออเดอร์'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
