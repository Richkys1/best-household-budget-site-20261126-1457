// DompetKeluarga — all behaviour. Figures come from data.js; user edits are
// kept in localStorage under one key and layered on top of the base data.
'use strict';

const STORE_KEY = 'dompetkeluarga-v1';

function rupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}
function rupiahShort(n) {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  return 'Rp ' + Math.round(n / 1000) + ' rb';
}
function pct(n, d) { return d ? Math.round(100 * n / d) : 0; }
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return d + ' ' + names[m - 1] + ' ' + y;
}

// ---- state: base data + the household's own edits ----
function loadState() {
  let extra = { tx: [], bills: [], goals: [], billPaid: {}, goalAdded: {} };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) extra = Object.assign(extra, JSON.parse(raw));
  } catch (e) { /* corrupt storage: start clean */ }
  return extra;
}
function saveState(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* storage full/blocked */ }
}
let state = loadState();

function allTransactions() {
  return TRANSACTIONS.concat(state.tx).slice().sort((a, b) => a.date < b.date ? 1 : -1);
}
function allBills() {
  const bills = BILLS.map((b, i) => Object.assign({}, b, {
    paid: state.billPaid[i] !== undefined ? state.billPaid[i] : b.paid
  }));
  return bills.concat(state.bills);
}
function allGoals() {
  const goals = GOALS.map((g, i) => Object.assign({}, g, {
    saved: g.saved + (state.goalAdded[i] || 0)
  }));
  return goals.concat(state.goals);
}
function totals() {
  const income = INCOME.reduce((a, b) => a + b.amount, 0);
  const spent = allTransactions().reduce((a, b) => a + b.amount, 0);
  return { income, spent, saved: income - spent, rate: pct(income - spent, income) };
}
function spentByCat() {
  const m = {};
  for (const b of BUDGETS) m[b.cat] = 0;
  for (const t of allTransactions()) if (m[t.cat] !== undefined) m[t.cat] += t.amount;
  return m;
}

// ---- routing: one page per nav link, hash-driven ----
const PAGES = ['dashboard', 'transaksi', 'anggaran', 'tagihan', 'tabungan', 'laporan'];
function showPage(name) {
  if (!PAGES.includes(name)) name = 'dashboard';
  document.querySelectorAll('.page').forEach(p => { p.hidden = p.dataset.page !== name; });
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === name));
  if (name === 'laporan') drawCharts();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => showPage(location.hash.replace('#', '')));

// ---- dashboard ----
function renderDashboard() {
  const t = totals();
  const byCat = spentByCat();
  const limitTotal = BUDGETS.reduce((a, b) => a + b.limit, 0);
  const daysLeft = 30 - 26; // 26 Nov: 4 days left in the month
  const grid = document.getElementById('stat-grid');
  grid.innerHTML =
    statCard('Pemasukan', rupiah(t.income), 'Gaji + jualan online + freelance', 'good') +
    statCard('Pengeluaran', rupiah(t.spent), 'Dari ' + allTransactions().length + ' transaksi bulan ini', 'warn') +
    statCard('Ditabung', rupiah(t.saved), 'Tingkat tabungan ' + t.rate + '%', 'good') +
    statCard('Sisa Anggaran', rupiah(limitTotal - t.spent), 'dari batas Rp 9.500.000 &middot; ' + daysLeft + ' hari lagi', '');
  const rows = BUDGETS.slice().sort((a, b) => byCat[b.cat] - byCat[a.cat]).slice(0, 5)
    .map(b => barRow(b.cat, byCat[b.cat], t.spent)).join('');
  document.getElementById('dash-cat-bars').innerHTML = rows;
  const health = [];
  health.push(t.rate >= 40
    ? '<li class="ok"><strong>Tabungan sangat sehat — ' + t.rate + '% dari pemasukan.</strong>Target keluarga 30%; bulan ini jauh di atas target.</li>'
    : '<li class="warn"><strong>Tabungan di bawah target 30%.</strong>Kurangi Makan di Luar minggu depan.</li>');
  const over = BUDGETS.filter(b => pct(byCat[b.cat], b.limit) >= 85);
  health.push(over.length
    ? '<li class="warn"><strong>' + over.map(b => esc(b.cat)).join(', ') + ' hampir habis.</strong>Tahan dulu belanja kategori ini sampai Desember.</li>'
    : '<li class="ok"><strong>Semua anggaran masih dalam batas.</strong>Tidak ada kategori yang melewati 85% pemakaian.</li>');
  const unpaid = allBills().filter(b => !b.paid);
  const unpaidSum = unpaid.reduce((a, b) => a + b.amount, 0);
  health.push('<li class="ok"><strong>' + unpaid.length + ' tagihan belum dibayar (' + rupiah(unpaidSum) + ').</strong>Tagihan terdekat: SPP Sekolah Anak, jatuh tempo 2 Des.</li>');
  document.getElementById('health-list').innerHTML = health.join('');
  document.getElementById('dash-bills').innerHTML = allBills().slice()
    .sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 4)
    .map(b => '<li><span>' + esc(b.name) + ' &middot; ' + fmtDate(b.due) + '</span><strong>' + rupiah(b.amount) + '</strong></li>').join('');
  document.getElementById('dash-goals').innerHTML = allGoals().slice()
    .sort((a, b) => pct(b.saved, b.target) - pct(a.saved, a.target)).slice(0, 2)
    .map(g => '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between"><strong>' + esc(g.name) + '</strong><span>' + pct(g.saved, g.target) + '%</span></div>' +
      barTrack(pct(g.saved, g.target)) + '<div class="muted" style="font-size:0.88rem">' + rupiah(g.saved) + ' dari ' + rupiah(g.target) + '</div></div>').join('');
}
function statCard(label, value, sub, tone) {
  return '<div class="stat ' + tone + '"><div class="label">' + label + '</div><div class="value">' + value + '</div><div class="sub">' + sub + '</div></div>';
}
function barTrack(p) {
  const cls = p >= 100 ? 'over' : p >= 85 ? 'high' : p >= 60 ? 'mid' : '';
  return '<div class="bar-track"><div class="bar-fill ' + cls + '" style="width:' + Math.min(100, p) + '%"></div></div>';
}
function barRow(name, amount, total) {
  return '<div class="bar-row"><span class="bar-name">' + esc(name) + '</span>' + barTrack(pct(amount, total)) +
    '<span class="bar-amt">' + rupiah(amount) + ' &middot; ' + pct(amount, total) + '%</span></div>';
}

// ---- transactions ----
function catIndex(cat) { return BUDGETS.findIndex(b => b.cat === cat); }
function renderTransactions() {
  const filterCat = document.getElementById('tx-filter-cat').value;
  const q = document.getElementById('tx-filter-text').value.trim().toLowerCase();
  const rows = allTransactions().filter(t =>
    (!filterCat || t.cat === filterCat) &&
    (!q || t.desc.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q)));
  document.getElementById('tx-body').innerHTML = rows.map(t =>
    '<tr><td>' + fmtDate(t.date) + '</td><td>' + esc(t.desc) + '</td>' +
    '<td><span class="pill cat-' + Math.max(0, catIndex(t.cat)) + '">' + esc(t.cat) + '</span></td>' +
    '<td class="num">' + rupiah(t.amount) + '</td></tr>').join('') ||
    '<tr><td colspan="4">Tidak ada transaksi yang cocok dengan filter.</td></tr>';
  const shown = rows.reduce((a, t) => a + t.amount, 0);
  document.getElementById('tx-total').textContent = rupiah(shown);
  document.getElementById('tx-count').textContent = allTransactions().length + ' pengeluaran';
  document.getElementById('income-body').innerHTML = INCOME.map(i =>
    '<tr><td>' + fmtDate(i.date) + '</td><td>' + esc(i.source) + '</td><td class="num">' + rupiah(i.amount) + '</td></tr>').join('');
  document.getElementById('income-total').textContent = rupiah(INCOME.reduce((a, b) => a + b.amount, 0));
}
function initTxForm() {
  const sel = document.getElementById('tx-filter-cat');
  BUDGETS.forEach(b => {
    const o = document.createElement('option');
    o.value = b.cat; o.textContent = b.cat; sel.appendChild(o);
  });
  sel.addEventListener('change', renderTransactions);
  document.getElementById('tx-filter-text').addEventListener('input', renderTransactions);
  document.getElementById('add-tx-form').addEventListener('submit', e => {
    e.preventDefault();
    const amount = Number(document.getElementById('tx-amount').value);
    const desc = document.getElementById('tx-desc').value.trim();
    const date = document.getElementById('tx-date').value;
    if (!desc || !amount || amount <= 0 || !date) return;
    state.tx.push({ date, desc, cat: document.getElementById('tx-cat').value, amount });
    saveState(state);
    document.getElementById('tx-form-note').textContent = 'Ditambahkan: ' + desc + ' — ' + rupiah(amount) + '. Total dan dasbor sudah diperbarui.';
    e.target.reset();
    document.getElementById('tx-date').value = '2026-11-26';
    renderAll();
  });
}

// ---- budgets ----
function renderBudgets() {
  const t = totals();
  const byCat = spentByCat();
  const limitTotal = BUDGETS.reduce((a, b) => a + b.limit, 0);
  document.getElementById('budget-limit-total').textContent = rupiah(limitTotal);
  document.getElementById('budget-spent-total').textContent = rupiah(t.spent);
  document.getElementById('budget-left-total').textContent = rupiah(limitTotal - t.spent);
  document.getElementById('budget-total-fill').style.width = pct(t.spent, limitTotal) + '%';
  document.getElementById('budget-list').innerHTML = BUDGETS.map(b => {
    const spent = byCat[b.cat], p = pct(spent, b.limit), left = b.limit - spent;
    const badge = p >= 100 ? '<span class="badge-over">LEWAT BATAS</span>'
      : p >= 85 ? '<span class="badge-over">HAMPIR HABIS</span>'
      : '<span class="badge-ok">AMAN</span>';
    return '<div class="budget-card"><div class="bc-head"><strong>' + esc(b.cat) + '</strong>' + badge + '</div>' +
      '<p class="bc-note">' + esc(b.note) + '</p>' + barTrack(p) +
      '<div class="bc-nums"><span class="left">' + rupiah(spent) + ' terpakai (' + p + '%)</span><span class="muted">Sisa ' + rupiah(Math.max(0, left)) + ' dari ' + rupiah(b.limit) + '</span></div></div>';
  }).join('');
}

// ---- bills ----
function renderBills() {
  const bills = allBills();
  const unpaid = bills.filter(b => !b.paid).reduce((a, b) => a + b.amount, 0);
  document.getElementById('bills-unpaid-total').textContent = rupiah(unpaid);
  document.getElementById('bills-total').textContent = rupiah(bills.reduce((a, b) => a + b.amount, 0));
  document.getElementById('bills-body').innerHTML = bills.map((b, i) => Object.assign({ _idx: i }, b)).slice()
    .sort((a, b) => a.due < b.due ? -1 : 1).map((b) => {
      const idx = b._idx;
      const paid = b.paid;
      return '<tr class="' + (paid ? 'row-paid' : '') + '"><td>' + esc(b.name) + '</td><td>' + esc(b.cycle) + '</td>' +
        '<td>' + fmtDate(b.due) + '</td><td class="num">' + rupiah(b.amount) + '</td>' +
        '<td><label class="toggle"><input type="checkbox" data-bill="' + idx + '"' + (paid ? ' checked' : '') +
        ' aria-label="Tandai ' + esc(b.name) + ' sudah dibayar"><span class="knob"></span></label>' +
        '<span class="bill-status ' + (paid ? 'paid' : 'due') + '">' + (paid ? 'Lunas' : 'Belum dibayar') + '</span></td></tr>';
    }).join('');
  document.querySelectorAll('#bills-body input[data-bill]').forEach(cb => {
    cb.addEventListener('change', () => {
      const i = Number(cb.dataset.bill);
      if (i < BILLS.length) { state.billPaid[i] = cb.checked; }
      else { state.bills[i - BILLS.length].paid = cb.checked; }
      saveState(state);
      renderAll();
    });
  });
}
function initBillForm() {
  document.getElementById('add-bill-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('bill-name').value.trim();
    const amount = Number(document.getElementById('bill-amount').value);
    const due = document.getElementById('bill-due').value;
    if (!name || !amount || amount <= 0 || !due) return;
    state.bills.push({ name, amount, due, cycle: 'Bulanan', paid: false });
    saveState(state);
    e.target.reset();
    document.getElementById('bill-due').value = '2026-12-10';
    renderAll();
  });
}

// ---- savings goals ----
function renderGoals() {
  document.getElementById('goals-list').innerHTML = allGoals().map((g, i) => {
    const p = pct(g.saved, g.target);
    const left = Math.max(0, g.target - g.saved);
    return '<div class="goal-card"><h2>' + esc(g.name) + '</h2><p class="goal-note">' + esc(g.note) + '</p>' +
      barTrack(p) +
      '<div class="goal-nums"><span><strong>' + rupiah(g.saved) + '</strong> terkumpul</span><span>' + p + '% dari ' + rupiah(g.target) + '</span></div>' +
      '<div class="muted" style="font-size:0.9rem">Sisa ' + rupiah(left) + ' lagi.</div>' +
      '<div class="goal-add"><input type="number" min="1000" step="1000" placeholder="Jumlah (Rp)" aria-label="Tambah tabungan ' + esc(g.name) + '" data-goal="' + i + '">' +
      '<button class="btn" data-add-goal="' + i + '">+ Tambah</button></div></div>';
  }).join('');
  document.querySelectorAll('[data-add-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.addGoal);
      const input = document.querySelector('input[data-goal="' + i + '"]');
      const amount = Number(input.value);
      if (!amount || amount <= 0) { input.focus(); return; }
      if (i < GOALS.length) {
        state.goalAdded[i] = (state.goalAdded[i] || 0) + amount;
      } else {
        state.goals[i - GOALS.length].saved += amount;
      }
      saveState(state);
      renderAll();
    });
  });
}
function initGoalForm() {
  document.getElementById('add-goal-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const target = Number(document.getElementById('goal-target').value);
    const saved = Number(document.getElementById('goal-saved').value) || 0;
    if (!name || !target || target <= 0) return;
    state.goals.push({ name, target, saved, note: 'Tujuan baru keluarga' });
    saveState(state);
    e.target.reset();
    document.getElementById('goal-saved').value = '0';
    renderAll();
  });
}

// ---- reports ----
function renderHistory() {
  document.getElementById('history-body').innerHTML = MONTHLY_HISTORY.map(m =>
    '<tr><td>' + m.month + '</td><td class="num">' + rupiah(m.income) + '</td><td class="num">' + rupiah(m.spent) +
    '</td><td class="num">' + rupiah(m.income - m.spent) + '</td></tr>').join('');
  const avg = MONTHLY_HISTORY.reduce((a, m) => a + (m.income - m.spent), 0) / MONTHLY_HISTORY.length;
  document.getElementById('avg-saved').textContent = rupiah(avg);
}
function drawBarChart(canvas, labels, seriesA, seriesB, labelA, labelB) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const padL = 78, padB = 34, padT = 14, padR = 14;
  const max = Math.max.apply(null, seriesA.concat(seriesB)) * 1.08;
  const n = labels.length, slot = (W - padL - padR) / n, bw = Math.min(46, (slot - 18) / 2);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#6f675c';
  ctx.textAlign = 'right';
  for (let g = 0; g <= 4; g++) {
    const v = max * g / 4, y = padT + (H - padB - padT) * (1 - g / 4);
    ctx.fillText('Rp ' + (v / 1000000).toFixed(0) + ' jt', padL - 8, y + 4);
    ctx.strokeStyle = '#efe6d2'; ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
  }
  labels.forEach((lab, i) => {
    const x0 = padL + i * slot + (slot - bw * 2 - 6) / 2;
    const hA = (H - padB - padT) * seriesA[i] / max, hB = (H - padB - padT) * seriesB[i] / max;
    ctx.fillStyle = '#1f7a4d';
    ctx.fillRect(x0, H - padB - hA, bw, hA);
    ctx.fillStyle = '#c2571b';
    ctx.fillRect(x0 + bw + 6, H - padB - hB, bw, hB);
    ctx.fillStyle = '#2b2620'; ctx.textAlign = 'center';
    ctx.fillText(lab, padL + i * slot + slot / 2, H - 10);
    // Spent value inside the orange bar, white on orange — short enough
    // ("6,8 jt", the axis already says Rp) to fit inside the bar.
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px sans-serif';
    ctx.fillText((seriesB[i] / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt', x0 + bw + 6 + bw / 2, H - padB - hB + 20);
    ctx.font = '13px sans-serif';
  });
}
function drawCharts() {
  const trend = document.getElementById('trend-chart');
  drawBarChart(trend,
    MONTHLY_HISTORY.map(m => m.month.replace(' 2026', '')),
    MONTHLY_HISTORY.map(m => m.income),
    MONTHLY_HISTORY.map(m => m.spent),
    'Pemasukan', 'Pengeluaran');
  const cat = document.getElementById('cat-chart');
  const byCat = spentByCat();
  const cats = BUDGETS.slice().sort((a, b) => byCat[b.cat] - byCat[a.cat]);
  const ctx = cat.getContext('2d');
  const W = cat.width, H = cat.height;
  ctx.clearRect(0, 0, W, H);
  const max = Math.max.apply(null, cats.map(c => byCat[c.cat])) * 1.12;
  const rowH = (H - 30) / cats.length;
  ctx.font = '13px sans-serif';
  cats.forEach((c, i) => {
    const y = 14 + i * rowH;
    const w = (W - 210) * byCat[c.cat] / max;
    ctx.fillStyle = '#2b2620'; ctx.textAlign = 'left';
    ctx.fillText(c.cat.length > 22 ? c.cat.slice(0, 21) + '…' : c.cat, 4, y + rowH / 2 + 4);
    ctx.fillStyle = i % 2 ? '#0f766e' : '#1f7a4d';
    ctx.fillRect(200, y + 6, Math.max(4, w), rowH - 16);
    ctx.fillStyle = '#6f675c';
    ctx.fillText(rupiahShort(byCat[c.cat]), 206 + Math.max(4, w), y + rowH / 2 + 4);
  });
}

// ---- boot ----
function renderAll() {
  renderDashboard();
  renderTransactions();
  renderBudgets();
  renderBills();
  renderGoals();
  renderHistory();
}
initTxForm();
initBillForm();
initGoalForm();
renderAll();
showPage(location.hash.replace('#', '') || 'dashboard');
