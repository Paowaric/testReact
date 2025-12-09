// src/services/ExportService.ts
import { OrderService, CustomerService, EmployeeService, DailyWageService, ChickenPartService } from './DataService';

function downloadCsv(filename: string, csvContent: string) {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility with Thai
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportOrders() {
    const orders = OrderService.getAll();

    const headers = ['วันที่', 'ลูกค้า', 'รายการ', 'จำนวน (กก.)', 'ราคาต่อกก.', 'รวม', 'ยอดรวมออเดอร์', 'สถานะ', 'หมายเหตุ'];

    const rows = orders.flatMap(order =>
        order.items.map((item, idx) => [
            idx === 0 ? new Date(order.createdAt).toLocaleDateString('th-TH') : '',
            idx === 0 ? order.customerName : '',
            item.chickenPartName,
            item.quantity,
            item.pricePerKg,
            item.total,
            idx === 0 ? order.totalAmount : '',
            idx === 0 ? order.status : '',
            idx === 0 ? order.notes : '',
        ].join(','))
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadCsv(`orders_${date}.csv`, csv);
}

export function exportCustomers() {
    const customers = CustomerService.getAll();
    const orders = OrderService.getAll();

    const headers = ['ชื่อลูกค้า', 'เบอร์โทร', 'ที่อยู่', 'จำนวนออเดอร์', 'ยอดรวม', 'สั่งครั้งล่าสุด', 'หมายเหตุ'];

    const rows = customers.map(c => {
        const customerOrders = orders.filter(o => o.customerId === c.id);
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        return [
            c.name,
            c.phone,
            c.address,
            customerOrders.length,
            totalSpent,
            c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('th-TH') : '-',
            c.notes,
        ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadCsv(`customers_${date}.csv`, csv);
}

export function exportEmployeeWages(employeeId?: string) {
    const employees = employeeId
        ? [EmployeeService.getById(employeeId)!]
        : EmployeeService.getAll();

    const headers = ['พนักงาน', 'วันที่', 'จำนวนเงิน', 'ปรับเพิ่ม/ลด', 'เหตุผล', 'หมายเหตุ'];

    const rows = employees.flatMap(emp => {
        const wages = DailyWageService.getByEmployee(emp.id);
        return wages.map(w => [
            w.employeeName,
            new Date(w.date).toLocaleDateString('th-TH'),
            w.amount,
            w.adjustment,
            w.adjustmentReason,
            w.notes,
        ].join(','));
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadCsv(`employee_wages_${date}.csv`, csv);
}

export function exportStock() {
    const parts = ChickenPartService.getAll();

    const headers = ['ชื่อชิ้นส่วน', 'ราคาต่อ กก.', 'สต็อกคงเหลือ', 'มูลค่าสต็อก'];

    const rows = parts.map(p => [
        p.name,
        p.pricePerKg,
        p.stock,
        p.stock * p.pricePerKg,
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadCsv(`stock_${date}.csv`, csv);
}

export function exportMonthlySummary() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthName = now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

    const monthlyRevenue = OrderService.getMonthlyRevenue();
    const monthlyWages = DailyWageService.getMonthTotal();
    const profit = monthlyRevenue - monthlyWages;

    const headers = ['รายการ', 'จำนวน (บาท)'];
    const rows = [
        ['ยอดขายรวม', monthlyRevenue],
        ['ค่าแรงรวม', monthlyWages],
        ['กำไร', profit],
    ].map(r => r.join(','));

    const csv = [`สรุปรายเดือน: ${monthName}`, '', headers.join(','), ...rows].join('\n');
    downloadCsv(`summary_${year}_${String(month).padStart(2, '0')}.csv`, csv);
}
