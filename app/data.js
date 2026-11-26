// DompetKeluarga — data for the Santoso household, November 2026.
// All amounts are Indonesian rupiah (IDR). Every figure on every page is
// computed from these tables, so totals can never drift apart.
'use strict';

const HOUSEHOLD = {
  name: 'Keluarga Santoso',
  members: 4,
  monthLabel: 'November 2026',
  monthKey: '2026-11',
  currency: 'IDR'
};

// Monthly income sources for November 2026.
const INCOME = [
  { date: '2026-11-01', source: 'Gaji Bulanan — Budi Santoso', amount: 11000000 },
  { date: '2026-11-07', source: 'Jualan Online (Tokopedia)', amount: 850000 },
  { date: '2026-11-15', source: 'Jasa Desain Freelance — Sari', amount: 650000 }
];

// Every expense of the month. Category names must match a budget below.
const TRANSACTIONS = [
  // Belanja Harian (groceries)
  { date: '2026-11-02', desc: 'Belanja Mingguan — Super Indo', cat: 'Belanja Harian', amount: 425000 },
  { date: '2026-11-05', desc: 'Pasar Tradisional — Sayur & Buah', cat: 'Belanja Harian', amount: 185000 },
  { date: '2026-11-09', desc: 'Belanja Bulanan — Indomaret', cat: 'Belanja Harian', amount: 310000 },
  { date: '2026-11-12', desc: 'Daging & Ayam — Pasar Minggu', cat: 'Belanja Harian', amount: 265000 },
  { date: '2026-11-16', desc: 'Belanja Mingguan — Super Indo', cat: 'Belanja Harian', amount: 390000 },
  { date: '2026-11-19', desc: 'Beras 10 kg & Minyak Goreng', cat: 'Belanja Harian', amount: 235000 },
  { date: '2026-11-23', desc: 'Pasar Tradisional — Sayur & Buah', cat: 'Belanja Harian', amount: 175000 },
  { date: '2026-11-25', desc: 'Belanja Mingguan — Super Indo', cat: 'Belanja Harian', amount: 355000 },
  // Transportasi
  { date: '2026-11-03', desc: 'Bensin Pertalite', cat: 'Transportasi', amount: 150000 },
  { date: '2026-11-08', desc: 'Parkir & Tol', cat: 'Transportasi', amount: 85000 },
  { date: '2026-11-11', desc: 'Ojek Online — Gojek', cat: 'Transportasi', amount: 64000 },
  { date: '2026-11-14', desc: 'Bensin Pertamax', cat: 'Transportasi', amount: 180000 },
  { date: '2026-11-18', desc: 'Servis Motor Rutin', cat: 'Transportasi', amount: 210000 },
  { date: '2026-11-21', desc: 'Ojek Online — Grab', cat: 'Transportasi', amount: 72000 },
  { date: '2026-11-24', desc: 'Bensin Pertalite', cat: 'Transportasi', amount: 114000 },
  // Listrik, Air & Internet
  { date: '2026-11-04', desc: 'Token Listrik PLN', cat: 'Listrik, Air & Internet', amount: 350000 },
  { date: '2026-11-06', desc: 'Air PDAM', cat: 'Listrik, Air & Internet', amount: 142000 },
  { date: '2026-11-10', desc: 'Internet IndiHome', cat: 'Listrik, Air & Internet', amount: 320000 }
];

// --- remaining November expenses (appended to the same table) ---
TRANSACTIONS.push(
  // Makan di Luar
  { date: '2026-11-07', desc: 'Makan Malam Keluarga — Restoran Sederhana', cat: 'Makan di Luar', amount: 185000 },
  { date: '2026-11-13', desc: 'Kopi & Roti — Kopi Kenangan', cat: 'Makan di Luar', amount: 96000 },
  { date: '2026-11-17', desc: 'Makan Siang — Ayam Geprek', cat: 'Makan di Luar', amount: 124000 },
  { date: '2026-11-22', desc: 'Makan Malam — Bakso & Es Teh', cat: 'Makan di Luar', amount: 148000 },
  { date: '2026-11-26', desc: 'Jajan Anak — Martabak', cat: 'Makan di Luar', amount: 87000 },
  // Hiburan
  { date: '2026-11-08', desc: 'Langganan Netflix', cat: 'Hiburan', amount: 186000 },
  { date: '2026-11-15', desc: 'Bioskop — Keluarga (4 tiket)', cat: 'Hiburan', amount: 160000 },
  { date: '2026-11-20', desc: 'Langganan Spotify', cat: 'Hiburan', amount: 54000 },
  // Kesehatan
  { date: '2026-11-09', desc: 'Apotek — Vitamin & Obat', cat: 'Kesehatan', amount: 145000 },
  { date: '2026-11-19', desc: 'Periksa Gigi — Klinik Sehat', cat: 'Kesehatan', amount: 375000 },
  // Pendidikan
  { date: '2026-11-02', desc: 'SPP Sekolah Anak', cat: 'Pendidikan', amount: 850000 },
  { date: '2026-11-12', desc: 'Buku & Alat Tulis', cat: 'Pendidikan', amount: 180000 },
  { date: '2026-11-18', desc: 'Kursus Bahasa Inggris Anak', cat: 'Pendidikan', amount: 120000 },
  // Rumah Tangga
  { date: '2026-11-05', desc: 'Sabun & Deterjen', cat: 'Rumah Tangga', amount: 168000 },
  { date: '2026-11-14', desc: 'Perbaikan Kran Bocor', cat: 'Rumah Tangga', amount: 210000 },
  { date: '2026-11-21', desc: 'Tisu & Pembersih', cat: 'Rumah Tangga', amount: 87000 }
);

// Monthly budget limits per category. "Spent" is always computed from
// TRANSACTIONS, never typed twice, so the bars can never disagree.
const BUDGETS = [
  { cat: 'Belanja Harian', limit: 3000000, note: 'Belanja pasar & supermarket' },
  { cat: 'Transportasi', limit: 1200000, note: 'Bensin, tol, ojek online' },
  { cat: 'Listrik, Air & Internet', limit: 950000, note: 'PLN, PDAM, IndiHome' },
  { cat: 'Makan di Luar', limit: 800000, note: 'Restoran, kopi, jajan' },
  { cat: 'Hiburan', limit: 600000, note: 'Streaming, bioskop' },
  { cat: 'Kesehatan', limit: 750000, note: 'Apotek, dokter, gigi' },
  { cat: 'Pendidikan', limit: 1500000, note: 'SPP, buku, kursus' },
  { cat: 'Rumah Tangga', limit: 700000, note: 'Kebersihan & perbaikan' }
];

// Recurring bills. `paid` is the November state; the toggle flips it.
const BILLS = [
  { name: 'Listrik PLN', amount: 350000, due: '2026-12-05', cycle: 'Bulanan', paid: true },
  { name: 'SPP Sekolah Anak', amount: 850000, due: '2026-12-02', cycle: 'Bulanan', paid: false },
  { name: 'Langganan Netflix', amount: 186000, due: '2026-12-08', cycle: 'Bulanan', paid: true },
  { name: 'BPJS Kesehatan', amount: 210000, due: '2026-12-10', cycle: 'Bulanan', paid: false },
  { name: 'Air PDAM', amount: 142000, due: '2026-12-10', cycle: 'Bulanan', paid: true },
  { name: 'Internet IndiHome', amount: 320000, due: '2026-12-15', cycle: 'Bulanan', paid: false },
  { name: 'Asuransi Jiwa', amount: 450000, due: '2026-12-20', cycle: 'Bulanan', paid: false },
  { name: 'Cicilan Motor', amount: 1150000, due: '2026-12-25', cycle: 'Bulanan', paid: false }
];

// Savings goals.
const GOALS = [
  { name: 'Dana Darurat', target: 30000000, saved: 18500000, note: '6 bulan biaya hidup' },
  { name: 'Liburan Keluarga ke Bali', target: 8000000, saved: 3250000, note: 'Berangkat Juni 2027' },
  { name: 'Kulkas Baru', target: 6500000, saved: 4100000, note: 'Ganti kulkas lama yang bocor' },
  { name: 'DP Rumah', target: 100000000, saved: 22000000, note: 'Target 2028' }
];

// Six-month spending trend used by the Reports charts.
const MONTHLY_HISTORY = [
  { month: 'Jun 2026', income: 12500000, spent: 6840000 },
  { month: 'Jul 2026', income: 12500000, spent: 7050000 },
  { month: 'Agu 2026', income: 12500000, spent: 6920000 },
  { month: 'Sep 2026', income: 12500000, spent: 7310000 },
  { month: 'Okt 2026', income: 12500000, spent: 7480000 },
  { month: 'Nov 2026', income: 12500000, spent: 7202000 }
];
