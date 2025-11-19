// src/components/Calendar.tsx
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Note {
  date: string;
  text: string;
}

export default function CalendarComponent() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);

  function handleSaveNote() {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const newNote: Note = { date: dateStr, text: note };
    setNotes([...notes.filter((n) => n.date !== dateStr), newNote]);
    setNote("");
  }

  const currentNote = notes.find(
    (n) => n.date === selectedDate.toISOString().split("T")[0]
  );

  return (
    <div style={{ padding: "1rem", maxWidth: "500px" }}>
      <Calendar
        onChange={(value) => {
          if (value instanceof Date) {
            setSelectedDate(value);
          } else if (Array.isArray(value) && value[0] instanceof Date) {
            setSelectedDate(value[0]); // เอาวันแรกของช่วง
          }
        }}
      />
      <h3>โน้ตวันที่: {selectedDate.toLocaleDateString("th-TH")}</h3>
      <textarea
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="จดบันทึกกิจกรรม เช่น ลูกค้ามารับของ"
        style={{ width: "100%", marginTop: "1rem" }}
      />
      <button onClick={handleSaveNote} style={{ marginTop: "0.5rem" }}>
        บันทึกโน้ต
      </button>

      {currentNote && (
        <div className="note-box">
          <strong>โน้ตที่บันทึกไว้:</strong>
          <p>{currentNote.text}</p>
        </div>
      )}
    </div>
  );
}
