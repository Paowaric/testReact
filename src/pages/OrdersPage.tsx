// src/pages/OrdersPage.tsx
import { useState, useEffect } from 'react';
import { OrderService, CustomerService, ChickenPartService } from '../services/DataService';
import type { Order, Customer, ChickenPart } from '../types/types';
import OrderTable from '../components/OrderTable';
import OrderForm from '../components/OrderForm';
import '../styles/orders.css';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [chickenParts, setChickenParts] = useState<ChickenPart[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ordersData, customersData, partsData, todayRev, monthlyRev] = await Promise.all([
                OrderService.getAll(),
                CustomerService.getAll(),
                ChickenPartService.getAll(),
                OrderService.getTodayRevenue(),
                OrderService.getMonthlyRevenue(),
            ]);
            setOrders(ordersData);
            setCustomers(customersData);
            setChickenParts(partsData);
            setTodayRevenue(todayRev);
            setMonthlyRevenue(monthlyRev);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrder = () => {
        setEditingOrder(null);
        setShowForm(true);
    };

    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
        setShowForm(true);
    };

    const handleDeleteOrder = async (id: string) => {
        if (confirm('ต้องการลบออเดอร์นี้?')) {
            await OrderService.delete(id);
            loadData();
        }
    };

    const handleFormSubmit = () => {
        setShowForm(false);
        setEditingOrder(null);
        loadData();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingOrder(null);
    };

    const handleUpdateStatus = async (id: string, status: Order['status']) => {
        await OrderService.update(id, { status });
        loadData();
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => (item.chickenPartName || '').toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                    <h1 className="page-title">📦 จัดการออเดอร์</h1>
                    <p className="page-subtitle">ตารางบันทึกลูกค้าและชิ้นส่วนไก่</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddOrder}>
                    ➕ เพิ่มออเดอร์
                </button>
            </div>

            {/* Stats */}
            <div className="orders-stats">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div>
                        <div className="stat-value">฿{todayRevenue.toLocaleString()}</div>
                        <div className="stat-label">ยอดขายวันนี้</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div>
                        <div className="stat-value">฿{monthlyRevenue.toLocaleString()}</div>
                        <div className="stat-label">ยอดขายเดือนนี้</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div>
                        <div className="stat-value">{orders.length}</div>
                        <div className="stat-label">ออเดอร์ทั้งหมด</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div>
                        <div className="stat-value">{customers.length}</div>
                        <div className="stat-label">ลูกค้าทั้งหมด</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="orders-filters">
                <div className="search-input">
                    <span className="search-input-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="ค้นหาลูกค้าหรือชิ้นส่วนไก่..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="all">สถานะทั้งหมด</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="completed">เสร็จสิ้น</option>
                    <option value="cancelled">ยกเลิก</option>
                </select>
            </div>

            {/* Table */}
            <OrderTable
                orders={filteredOrders}
                customers={customers}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onUpdateStatus={handleUpdateStatus}
            />

            {/* Form Modal */}
            {showForm && (
                <OrderForm
                    order={editingOrder}
                    customers={customers}
                    chickenParts={chickenParts}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}
        </div>
    );
}
