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
            setItems(order.items);
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
            const part = chickenParts.find(p => p.id === value);
            if (part) {
                item.chickenPartId = part.id;
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
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const validate = (): boolean => {
        const errs: string[] = [];

        if (!customerId) {
            errs.push('กรุณาเลือกลูกค้า');
        }

        if (items.length === 0 || items.every(i => !i.chickenPartId)) {
            errs.push('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
        }

        items.forEach((item, idx) => {
            if (item.chickenPartId && item.quantity <= 0) {
                errs.push(`รายการที่ ${idx + 1}: จำนวนต้องมากกว่า 0`);
            }
        });

        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const customer = customers.find(c => c.id === customerId)!;
        const validItems = items.filter(i => i.chickenPartId);

        if (order) {
            OrderService.update(order.id, {
                customerId,
                customerName: customer.name,
                items: validItems,
                notes,
            });
        } else {
            OrderService.create({
                customerId,
                customerName: customer.name,
                items: validItems,
                notes,
            });
        }

        onSubmit();
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
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
                                            {chickenParts.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} (฿{p.pricePerKg}/กก. - สต็อก: {p.stock})
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="number"
                                            className="input qty-input"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            min="0.1"
                                            step="0.1"
                                            placeholder="จำนวน (กก.)"
                                        />

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

                                <button type="button" className="btn btn-secondary" onClick={addItem}>
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
