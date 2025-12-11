// src/pages/CustomersPage.tsx
import { useState, useEffect } from 'react';
import { CustomerService, OrderService } from '../services/DataService';
import type { Customer, Order } from '../types/types';
import '../styles/customers.css';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingHistory, setViewingHistory] = useState<{ customer: Customer; orders: Order[] } | null>(null);
    const [inactiveCustomers, setInactiveCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [customerStats, setCustomerStats] = useState<Map<string, { orderCount: number; totalSpent: number }>>(new Map());

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [customersData, inactiveData, ordersData] = await Promise.all([
                CustomerService.getAll(),
                CustomerService.getInactiveCustomers(),
                OrderService.getAll(),
            ]);

            setCustomers(customersData);
            setInactiveCustomers(inactiveData);

            // Calculate stats for each customer
            const statsMap = new Map<string, { orderCount: number; totalSpent: number }>();
            customersData.forEach(customer => {
                const validOrders = ordersData.filter(o => o.customerId === customer.id && o.status !== 'cancelled');
                const completedOrders = validOrders.filter(o => o.status === 'completed');

                const total = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

                statsMap.set(customer.id, {
                    orderCount: validOrders.length,
                    totalSpent: total
                });
            });
            setCustomerStats(statsMap);
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setPhone('');
        setAddress('');
        setNotes('');
        setEditingCustomer(null);
    };

    const handleAddCustomer = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setEditingCustomer(customer);
        setName(customer.name);
        setPhone(customer.phone);
        setAddress(customer.address);
        setNotes(customer.notes);
        setShowForm(true);
    };

    const handleDeleteCustomer = async (id: string) => {
        if (confirm('ต้องการลบลูกค้านี้?')) {
            await CustomerService.delete(id);
            loadData();
        }
    };

    const handleViewHistory = async (customer: Customer) => {
        try {
            const orders = await OrderService.getByCustomer(customer.id);
            setViewingHistory({ customer, orders });
        } catch (error) {
            console.error('Failed to load order history:', error);
        }
    };

    const [error, setError] = useState('');

    const validateForm = (): boolean => {
        if (!name.trim()) {
            setError('กรุณากรอกชื่อลูกค้า');
            return false;
        }
        if (phone && !/^\d{10}$/.test(phone)) {
            setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            if (editingCustomer) {
                await CustomerService.update(editingCustomer.id, { name, phone, address, notes });
            } else {
                await CustomerService.create({ name, phone, address, notes });
            }

            setShowForm(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to save customer:', error);
            setError('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const getCustomerStats = (customerId: string) => {
        return customerStats.get(customerId) || { orderCount: 0, totalSpent: 0 };
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
                    <h1 className="page-title">👥 จัดการลูกค้า</h1>
                    <p className="page-subtitle">ลูกค้าทั้งหมด {customers.length} ราย</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddCustomer}>
                    ➕ เพิ่มลูกค้า
                </button>
            </div>

            {/* Inactive Customer Alert */}
            {inactiveCustomers.length > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--space-lg)' }}>
                    ⚠️ มีลูกค้า {inactiveCustomers.length} รายไม่ได้สั่งมากกว่า 14 วัน: {inactiveCustomers.map(c => c.name).join(', ')}
                </div>
            )}

            {/* Search */}
            <div className="customers-search">
                <div className="search-input">
                    <span className="search-input-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="ค้นหาลูกค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Customer Table */}
            {filteredCustomers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>ยังไม่มีลูกค้า</h3>
                    <p>กดปุ่ม "เพิ่มลูกค้า" เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ชื่อลูกค้า</th>
                                <th>เบอร์โทร</th>
                                <th>ที่อยู่</th>
                                <th>สั่งซื้อ</th>
                                <th>ยอดรวม</th>
                                <th>หมายเหตุ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => {
                                const stats = getCustomerStats(customer.id);
                                const isInactive = inactiveCustomers.some(c => c.id === customer.id);
                                return (
                                    <tr key={customer.id} className={isInactive ? 'row-warning' : ''}>
                                        <td>
                                            <strong>{customer.name}</strong>
                                            {isInactive && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>ไม่ได้สั่งนาน</span>}
                                        </td>
                                        <td>
                                            {customer.phone
                                                ? customer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                                                : '-'}
                                        </td>
                                        <td>{customer.address || '-'}</td>
                                        <td>{stats.orderCount} ครั้ง</td>
                                        <td className="amount-cell">฿{stats.totalSpent.toLocaleString()}</td>
                                        <td className="notes-cell">{customer.notes || '-'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn btn-ghost btn-icon" onClick={() => handleViewHistory(customer)} title="ประวัติ">
                                                    📋
                                                </button>
                                                <button className="btn btn-ghost btn-icon" onClick={() => handleEditCustomer(customer)} title="แก้ไข">
                                                    ✏️
                                                </button>
                                                <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteCustomer(customer.id)} title="ลบ">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingCustomer ? '✏️ แก้ไขลูกค้า' : '➕ เพิ่มลูกค้า'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="form-group">
                                    <label className="form-label">ชื่อลูกค้า *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ชื่อร้าน หรือ ชื่อลูกค้า"
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
                                    <label className="form-label">ที่อยู่</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="ที่อยู่หรือสถานที่"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">หมายเหตุ</label>
                                    <textarea
                                        className="input"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="เช่น ลูกค้าประจำ, สั่งทุกวันจันทร์..."
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCustomer ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order History Modal */}
            {viewingHistory && (
                <div className="modal-overlay">
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">📋 ประวัติการสั่งซื้อ: {viewingHistory.customer.name}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setViewingHistory(null)}>✕</button>
                        </div>

                        <div className="modal-body">
                            {viewingHistory.orders.length === 0 ? (
                                <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                                    <p>ยังไม่มีประวัติการสั่งซื้อ</p>
                                </div>
                            ) : (
                                <div className="order-history-list">
                                    {viewingHistory.orders.map(order => (
                                        <div key={order.id} className="order-history-item">
                                            <div className="history-item-header">
                                                <div className="history-date">
                                                    <span className="calendar-icon">📅</span>
                                                    {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="history-status">
                                                    <span className={`status-badge status-${order.status}`}>
                                                        {order.status === 'completed' ? '✅ เสร็จสิ้น' :
                                                            order.status === 'cancelled' ? '❌ ยกเลิก' : '⏳ รอดำเนินการ'}
                                                    </span>
                                                    <span className="history-total">฿{order.totalAmount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="history-item-body">
                                                <table className="history-items-table">
                                                    <thead>
                                                        <tr>
                                                            <th>สินค้า</th>
                                                            <th className="text-right">จำนวน</th>
                                                            <th className="text-right">ราคา/หน่วย</th>
                                                            <th className="text-right">รวม</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {order.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td>{item.chickenPartName}</td>
                                                                <td className="text-right">{item.quantity} กก.</td>
                                                                <td className="text-right">฿{item.pricePerKg}</td>
                                                                <td className="text-right">฿{item.total.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
