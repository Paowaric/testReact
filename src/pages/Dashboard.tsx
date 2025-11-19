// src/pages/Dashboard.tsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import Calendar from "../components/Calendar";

export default function Dashboard() {
  return (
    <>
      <Header title="Dashboard ระบบจัดการร้านไก่" />

      <section style={{ padding: "1rem" }}>
        <h2>สรุปภาพรวมวันนี้</h2>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}></div>
        <h2 style={{ marginTop: "2rem" }}>📅 ปฏิทินกิจกรรม</h2>
        <Calendar />
      </section>
      <hr />
      <Footer company="ร้านไก่ BAby" year={new Date().getFullYear()} />
    </>
  );
}
