// src/components/OrderTable.tsx
import type { Order, Customer } from '../types/types';
import '../styles/orders.css';

interface OrderTableProps {
    orders: Order[];
    customers: Customer[];
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onUpdateStatus: (id: string, status: Order['status']) => void;
}

export default function OrderTable({ orders, customers, onEdit, onDelete, onUpdateStatus }: OrderTableProps) {
    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return <span className="badge badge-warning">⏳ รอดำเนินการ</span>;
            case 'completed':
                return <span className="badge badge-success">✅ เสร็จสิ้น</span>;
            case 'cancelled':
                return <span className="badge badge-danger">❌ ยกเลิก</span>;
        }
    };

    const getCustomerName = (customerId: string, fallbackName: string) => {
        const customer = customers.find(c => String(c.id) === String(customerId));
        return customer ? customer.name : fallbackName;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (orders.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h3>ยังไม่มีออเดอร์</h3>
                <p>กดปุ่ม "เพิ่มออเดอร์" เพื่อเริ่มต้น</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>วันที่</th>
                        <th>ลูกค้า</th>
                        <th>รายการสินค้า</th>
                        <th>ยอดรวม</th>
                        <th>สถานะ</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>
                                <div className="customer-cell">
                                    <strong>{getCustomerName(order.customerId, order.customerName)}</strong>
                                    {order.notes && <small className="order-notes">{order.notes}</small>}
                                </div>
                            </td>
                            <td>
                                <div className="items-cell">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="order-item">
                                            <span className="item-name">{item.chickenPartName}</span>
                                            <span className="item-qty">{item.quantity} กก. × ฿{item.pricePerKg}</span>
                                            <span className="item-total">= ฿{item.total.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </td>
                            <td className="amount-cell">
                                <strong>฿{order.totalAmount.toLocaleString()}</strong>
                            </td>
                            <td>
                                <select
                                    className="status-select input"
                                    value={order.status}
                                    onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                                >
                                    <option value="pending">รอดำเนินการ</option>
                                    <option value="completed">เสร็จสิ้น</option>
                                    <option value="cancelled">ยกเลิก</option>
                                </select>
                                {getStatusBadge(order.status)}
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => onEdit(order)}
                                        title="แก้ไข"
                                        disabled={order.status === 'completed' || order.status === 'cancelled'}
                                        style={{ opacity: order.status === 'completed' || order.status === 'cancelled' ? 0.3 : 1 }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => onDelete(order.id)}
                                        title="ลบ"
                                        disabled={order.status === 'completed'}
                                        style={{ opacity: order.status === 'completed' ? 0.3 : 1 }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
