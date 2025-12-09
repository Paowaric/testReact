// src/pages/CalendarPage.tsx
import { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import { CalendarNoteService } from '../services/DataService';
import type { CalendarNote } from '../types/types';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [allNotes, setAllNotes] = useState<CalendarNote[]>([]);
    const [dayNotes, setDayNotes] = useState<CalendarNote[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState<CalendarNote | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        loadAllNotes();
    }, []);

    useEffect(() => {
        loadDayNotes();
    }, [selectedDate]);

    const loadAllNotes = () => {
        setAllNotes(CalendarNoteService.getAll());
    };

    const loadDayNotes = () => {
        const dateStr = formatDateKey(selectedDate);
        setDayNotes(CalendarNoteService.getByDate(dateStr));
    };

    const formatDateKey = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const handleDateChange = (value: Value) => {
        if (value instanceof Date) {
            setSelectedDate(value);
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setEditingNote(null);
    };

    const handleAddNote = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditNote = (note: CalendarNote) => {
        setEditingNote(note);
        setTitle(note.title);
        setContent(note.content);
        setShowForm(true);
    };

    const handleDeleteNote = (id: string) => {
        if (confirm('ต้องการลบบันทึกนี้?')) {
            CalendarNoteService.delete(id);
            loadAllNotes();
            loadDayNotes();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const dateStr = formatDateKey(selectedDate);

        if (editingNote) {
            CalendarNoteService.update(editingNote.id, { title, content });
        } else {
            CalendarNoteService.create({ date: dateStr, title, content });
        }

        setShowForm(false);
        resetForm();
        loadAllNotes();
        loadDayNotes();
    };

    const tileContent = ({ date }: { date: Date }) => {
        const dateStr = formatDateKey(date);
        const hasNotes = allNotes.some(n => n.date === dateStr);
        if (hasNotes) {
            return <div className="calendar-dot" />;
        }
        return null;
    };

    const formatDisplayDate = (date: Date): string => {
        return date.toLocaleDateString('th-TH', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📅 ปฏิทินกิจกรรม</h1>
                    <p className="page-subtitle">จดบันทึกและติดตามกิจกรรม</p>
                </div>
            </div>

            <div className="calendar-layout">
                {/* Calendar */}
                <div className="calendar-section card">
                    <div className="card-body">
                        <ReactCalendar
                            onChange={handleDateChange}
                            value={selectedDate}
                            tileContent={tileContent}
                            locale="th-TH"
                        />
                    </div>
                </div>

                {/* Notes for Selected Day */}
                <div className="notes-section card">
                    <div className="card-header">
                        <div>
                            <h3>📝 {formatDisplayDate(selectedDate)}</h3>
                            <p className="notes-count">{dayNotes.length} บันทึก</p>
                        </div>
                        <button className="btn btn-primary" onClick={handleAddNote}>
                            ➕ เพิ่มบันทึก
                        </button>
                    </div>

                    <div className="card-body">
                        {dayNotes.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--space-xl) 0' }}>
                                <div className="empty-state-icon">📝</div>
                                <p>ยังไม่มีบันทึกสำหรับวันนี้</p>
                                <button className="btn btn-secondary" onClick={handleAddNote}>
                                    เพิ่มบันทึก
                                </button>
                            </div>
                        ) : (
                            <div className="notes-list">
                                {dayNotes.map((note) => (
                                    <div key={note.id} className="note-card">
                                        <div className="note-header">
                                            <h4>{note.title}</h4>
                                            <div className="note-actions">
                                                <button className="btn btn-ghost btn-icon" onClick={() => handleEditNote(note)}>
                                                    ✏️
                                                </button>
                                                <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteNote(note.id)}>
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <p className="note-content">{note.content}</p>
                                        <small className="note-time">
                                            {new Date(note.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingNote ? '✏️ แก้ไขบันทึก' : '➕ เพิ่มบันทึก'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">วันที่</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formatDisplayDate(selectedDate)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">หัวข้อ *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="หัวข้อบันทึก..."
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">รายละเอียด</label>
                                    <textarea
                                        className="input"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="รายละเอียดเพิ่มเติม..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingNote ? 'บันทึกการแก้ไข' : 'เพิ่มบันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
