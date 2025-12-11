// src/pages/StockPage.tsx
import { useState, useEffect } from 'react';
import { ChickenPartService } from '../services/DataService';
import type { ChickenPart } from '../types/types';
import '../styles/stock.css';

export default function StockPage() {
    const [parts, setParts] = useState<ChickenPart[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPart, setEditingPart] = useState<ChickenPart | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [lowStockParts, setLowStockParts] = useState<ChickenPart[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [pricePerKg, setPricePerKg] = useState(0);
    const [stock, setStock] = useState(0);
    const [unit, setUnit] = useState('กก.');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [partsData, lowStockData] = await Promise.all([
                ChickenPartService.getAll(),
                ChickenPartService.getLowStock(),
            ]);
            setParts(partsData);
            setLowStockParts(lowStockData);
        } catch (error) {
            console.error('Failed to load stock:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setPricePerKg(0);
        setStock(0);
        setUnit('กก.');
        setEditingPart(null);
    };

    const handleAddPart = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditPart = (part: ChickenPart) => {
        setEditingPart(part);
        setName(part.name);
        setPricePerKg(part.pricePerKg);
        setStock(part.stock);
        setUnit(part.unit);
        setShowForm(true);
    };

    const handleDeletePart = async (id: string) => {
        if (confirm('ต้องการลบชิ้นส่วนนี้?')) {
            await ChickenPartService.delete(id);
            loadData();
        }
    };

    const handleAdjustStock = async (id: string, amount: number) => {
        await ChickenPartService.adjustStock(id, amount);
        loadData();
    };

    const [error, setError] = useState('');

    const validateForm = (): boolean => {
        if (!name.trim()) {
            setError('กรุณากรอกชื่อชิ้นส่วน');
            return false;
        }
        if (pricePerKg < 0) {
            setError('ราคาต้องไม่ติดลบ');
            return false;
        }
        if (stock < 0) {
            setError('ปริมาณคงเหลือต้องไม่ติดลบ');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            if (editingPart) {
                await ChickenPartService.update(editingPart.id, { name, pricePerKg, stock, unit });
            } else {
                await ChickenPartService.create({ name, pricePerKg, stock, unit });
            }

            setShowForm(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to save part:', error);
            setError('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    const filteredParts = parts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStockValue = parts.reduce((sum, p) => sum + (Number(p.stock) * Number(p.pricePerKg)), 0);

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
                    <h1 className="page-title">🍗 จัดการสต็อก</h1>
                    <p className="page-subtitle">ชิ้นส่วนไก่ทั้งหมด {parts.length} รายการ</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddPart}>
                    ➕ เพิ่มชิ้นส่วน
                </button>
            </div>

            {/* Stats */}
            <div className="stock-stats">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div>
                        <div className="stat-value">{parts.length}</div>
                        <div className="stat-label">ประเภท</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚖️</div>
                    <div>
                        <div className="stat-value">{parts.reduce((sum, p) => sum + Number(p.stock), 0).toLocaleString()} กก.</div>
                        <div className="stat-label">สต็อกทั้งหมด</div>
                    </div>
                </div>
                <div className="stat-card stat-card-gradient">
                    <div className="stat-icon">💰</div>
                    <div>
                        <div className="stat-value">฿{totalStockValue.toLocaleString()}</div>
                        <div className="stat-label">มูลค่าสต็อก</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div>
                        <div className="stat-value">{lowStockParts.length}</div>
                        <div className="stat-label">สต็อกต่ำ</div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockParts.length > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--space-lg)' }}>
                    ⚠️ สต็อกต่ำ: {lowStockParts.map(p => `${p.name} (${p.stock}กก.)`).join(', ')}
                </div>
            )}

            {/* Search */}
            <div className="stock-search">
                <div className="search-input">
                    <span className="search-input-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="ค้นหาชิ้นส่วนไก่..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stock Grid */}
            {filteredParts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🍗</div>
                    <h3>ยังไม่มีข้อมูลสต็อก</h3>
                    <p>กดปุ่ม "เพิ่มชิ้นส่วน" เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="stock-grid">
                    {filteredParts.map((part) => {
                        const isLowStock = part.stock < 15;
                        return (
                            <div key={part.id} className={`stock-card card ${isLowStock ? 'low-stock' : ''}`}>
                                <div className="stock-card-header">
                                    <h3>{part.name}</h3>
                                    <div className="stock-actions">
                                        <button className="btn btn-ghost btn-icon" onClick={() => handleEditPart(part)}>
                                            ✏️
                                        </button>
                                        <button className="btn btn-ghost btn-icon" onClick={() => handleDeletePart(part.id)}>
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="stock-card-body">
                                    <div className="price-display">
                                        <span className="price">฿{part.pricePerKg}</span>
                                        <span className="unit">/ {part.unit}</span>
                                    </div>

                                    <div className="stock-display">
                                        <span className="stock-label">คงเหลือ:</span>
                                        <span className={`stock-value ${isLowStock ? 'text-danger' : ''}`}>
                                            {part.stock} {part.unit}
                                        </span>
                                    </div>

                                    {isLowStock && (
                                        <span className="badge badge-danger">สต็อกต่ำ</span>
                                    )}
                                </div>

                                <div className="stock-card-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleAdjustStock(part.id, -5)}
                                        disabled={part.stock < 5}
                                    >
                                        -5
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleAdjustStock(part.id, -1)}
                                        disabled={part.stock < 1}
                                    >
                                        -1
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleAdjustStock(part.id, 1)}
                                    >
                                        +1
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleAdjustStock(part.id, 10)}
                                    >
                                        +10
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingPart ? '✏️ แก้ไขชิ้นส่วน' : '➕ เพิ่มชิ้นส่วนไก่'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="form-group">
                                    <label className="form-label">ชื่อชิ้นส่วน *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="เช่น อกไก่, สะโพก, ปีก..."
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">ราคาต่อกิโลกรัม (บาท)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={pricePerKg}
                                        onChange={(e) => setPricePerKg(Number(e.target.value))}
                                        min="0"
                                        step="5"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">ปริมาณคงเหลือ ({unit})</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={stock}
                                        onChange={(e) => setStock(Number(e.target.value))}
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingPart ? 'บันทึกการแก้ไข' : 'เพิ่มชิ้นส่วน'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
