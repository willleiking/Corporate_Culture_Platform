// =============================================
//  職場避雷針 — 公司政策透明化儀表板
//  script.js
// =============================================

// ---- 常數 / 對照表 ----

const INDUSTRIES = ['科技業', '金融業', '傳產製造', '文創廣告', '零售服務'];

const YEAREND_LABELS = [
  '無限制',
  '需滿半年',
  '需滿一年',
  '滿一年（否則抽獎）',
  '未滿整年無年終',
];

const BONUS_LABELS = [
  '無限制',
  '需滿一年',
  '需滿三個計年度',
  '僅特定職級',
];

const FESTIVAL_TYPE_LABELS = {
  cash:    '現金',
  voucher: '全聯禮券',
  mixed:   '現金＋禮券',
  none:    '無',
};

const STATIONARY_LABELS = [
  '',
  '正常可申請',
  '特殊需審批',
  '以舊換新',
  '需申請一週',
  '幾乎不可能',
];

const PUNCH_LABELS = [
  '',
  '正常制度',
  '固定時間打卡',
  '先打卡再回工位',
  '強制先打卡',
];

// ---- 初始示範資料 ----

const companies = [
  { name: '智合科技',   industry: '科技業',   start: '2024-01-01', end: '2025-12-31', yearend: 2, bonus: 1, festivalType: 'mixed',   festivalAmt: 3000, stationary: 2, punch: 3 },
  { name: '遠翔金控',   industry: '金融業',   start: '2023-06-01', end: '2024-12-31', yearend: 3, bonus: 2, festivalType: 'cash',    festivalAmt: 2500, stationary: 3, punch: 2 },
  { name: '晨光文創',   industry: '文創廣告', start: '2023-09-01', end: '2024-08-31', yearend: 4, bonus: 3, festivalType: 'voucher', festivalAmt:  500, stationary: 4, punch: 4 },
  { name: '台昇電子',   industry: '科技業',   start: '2024-03-01', end: '2025-12-31', yearend: 2, bonus: 1, festivalType: 'cash',    festivalAmt: 4800, stationary: 1, punch: 1 },
  { name: '永豐投信',   industry: '金融業',   start: '2023-01-01', end: '2025-12-31', yearend: 0, bonus: 0, festivalType: 'cash',    festivalAmt: 6000, stationary: 1, punch: 1 },
  { name: '旭日製造',   industry: '傳產製造', start: '2022-01-01', end: '2025-12-31', yearend: 2, bonus: 2, festivalType: 'voucher', festivalAmt: 1500, stationary: 3, punch: 3 },
  { name: '星橋零售',   industry: '零售服務', start: '2024-01-01', end: '2025-12-31', yearend: 3, bonus: 1, festivalType: 'mixed',   festivalAmt: 2000, stationary: 2, punch: 2 },
  { name: '彩虹廣告',   industry: '文創廣告', start: '2023-07-01', end: '2025-07-31', yearend: 4, bonus: 3, festivalType: 'none',    festivalAmt:    0, stationary: 5, punch: 4 },
  { name: '宏達機械',   industry: '傳產製造', start: '2022-06-01', end: '2025-12-31', yearend: 2, bonus: 2, festivalType: 'voucher', festivalAmt: 2400, stationary: 4, punch: 3 },
  { name: '捷速物流',   industry: '零售服務', start: '2023-01-01', end: '2025-12-31', yearend: 2, bonus: 1, festivalType: 'cash',    festivalAmt: 1200, stationary: 3, punch: 4 },
];

// ---- 狀態 ----

let currentFilter = 'all';
let charts = {};

// ---- 工具函式 ----

function getFiltered() {
  return currentFilter === 'all'
    ? companies
    : companies.filter(c => c.industry === currentFilter);
}

/**
 * 計算踩雷指數 (0–10)
 * 根據年終門檻、紅利門檻、三節金額、文具阻攔、打卡規定各項加分
 */
function calcRisk(c) {
  let score = 0;
  if (c.yearend >= 2) score += 2;
  if (c.yearend >= 3) score += 1;
  if (c.bonus >= 2)   score += 2;
  if (c.bonus >= 3)   score += 1;
  if (c.festivalAmt < 1000) score += 2;
  else if (c.festivalAmt < 2000) score += 1;
  if (c.festivalType === 'none') score += 2;
  if (c.stationary >= 4) score += 2;
  else if (c.stationary >= 3) score += 1;
  if (c.punch >= 3) score += 2;
  else if (c.punch >= 2) score += 1;
  return Math.min(10, score);
}

function riskColor(r) {
  if (r >= 7) return '#E24B4A';
  if (r >= 4) return '#BA7517';
  return '#639922';
}

function pill(text, cls) {
  return `<span class="pill ${cls}">${text}</span>`;
}

// ---- 渲染：指標卡 ----

function renderMetrics() {
  const data = getFiltered();
  const total = data.length || 1; // avoid /0

  const needYearend   = data.filter(c => c.yearend >= 2).length;
  const needBonus3y   = data.filter(c => c.bonus >= 2).length;
  const hasPunch      = data.filter(c => c.punch >= 3).length;
  const highStat      = data.filter(c => c.stationary >= 4).length;
  const avgFestival   = Math.round(data.reduce((s, c) => s + c.festivalAmt, 0) / total);
  const avgRisk       = (data.reduce((s, c) => s + calcRisk(c), 0) / total).toFixed(1);

  document.getElementById('metricsGrid').innerHTML = `
    <div class="metric-card">
      <div class="metric-label">🏢 公司數量</div>
      <div class="metric-val">${data.length}</div>
      <div class="metric-sub">份情報</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">📅 年終門檻</div>
      <div class="metric-val">${Math.round(needYearend / total * 100)}%</div>
      <div class="metric-sub">需滿一年 <span class="badge-red">${needYearend} 間</span></div>
    </div>
    <div class="metric-card">
      <div class="metric-label">💰 紅利限制</div>
      <div class="metric-val">${Math.round(needBonus3y / total * 100)}%</div>
      <div class="metric-sub">需滿3年資格 <span class="badge-amber">${needBonus3y} 間</span></div>
    </div>
    <div class="metric-card">
      <div class="metric-label">🎁 三節平均</div>
      <div class="metric-val">$${avgFestival.toLocaleString()}</div>
      <div class="metric-sub">全年三節合計</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">✏️ 文具阻攔</div>
      <div class="metric-val">${Math.round(highStat / total * 100)}%</div>
      <div class="metric-sub">極度阻攔 <span class="badge-red">${highStat} 間</span></div>
    </div>
    <div class="metric-card">
      <div class="metric-label">🕐 先打卡</div>
      <div class="metric-val">${Math.round(hasPunch / total * 100)}%</div>
      <div class="metric-sub">先打卡再回工位 <span class="badge-red">${hasPunch} 間</span></div>
    </div>
    <div class="metric-card">
      <div class="metric-label">⚠️ 平均踩雷指數</div>
      <div class="metric-val" style="color:${riskColor(avgRisk)}">${avgRisk}</div>
      <div class="metric-sub">/ 10 分</div>
    </div>
  `;
}

// ---- 渲染：表格 ----

function renderTable() {
  const data = getFiltered();

  document.getElementById('tableBody').innerHTML = data.map(c => {
    const risk   = calcRisk(c);
    const rColor = riskColor(risk);
    const barW   = Math.round(risk / 10 * 60);

    const ye = c.yearend;
    const yePill =
      ye === 0 ? pill('無限制', 'pill-green') :
      ye === 1 ? pill('需滿半年', 'pill-amber') :
      ye === 2 ? pill('需滿一年', 'pill-red') :
      ye === 3 ? pill('滿一年才有', 'pill-amber') :
                 pill('未滿整年無', 'pill-red');

    const bo = c.bonus;
    const boPill =
      bo === 0 ? pill('無限制', 'pill-green') :
      bo === 1 ? pill('需滿一年', 'pill-amber') :
      bo === 2 ? pill('需三計年度', 'pill-red') :
                 pill('僅特定職級', 'pill-red');

    const ftClass =
      c.festivalType === 'cash'    ? 'pill-blue' :
      c.festivalType === 'none'    ? 'pill-red'  : 'pill-amber';
    const festPill =
      `${pill(FESTIVAL_TYPE_LABELS[c.festivalType], ftClass)} $${c.festivalAmt.toLocaleString()}`;

    const st = c.stationary;
    const stPill =
      st <= 1 ? pill(STATIONARY_LABELS[st], 'pill-green') :
      st <= 3 ? pill(STATIONARY_LABELS[st], 'pill-amber') :
                pill(STATIONARY_LABELS[st], 'pill-red');

    const pu = c.punch;
    const puPill =
      pu <= 1 ? pill(PUNCH_LABELS[pu], 'pill-green') :
      pu <= 2 ? pill(PUNCH_LABELS[pu], 'pill-amber') :
                pill(PUNCH_LABELS[pu], 'pill-red');

    return `
      <tr>
        <td style="font-weight:500">${c.name}</td>
        <td>${pill(c.industry, 'pill-blue')}</td>
        <td>${yePill}</td>
        <td>${boPill}</td>
        <td>${festPill}</td>
        <td>${stPill}</td>
        <td>${puPill}</td>
        <td>
          <span style="font-weight:500;color:${rColor};font-size:13px">${risk}</span>
          <span style="color:#888780;font-size:11px">/10</span>
          <span class="score-bar">
            <span class="score-fill" style="width:${barW}px;background:${rColor}"></span>
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// ---- 渲染：圖表 ----

function destroyCharts() {
  Object.values(charts).forEach(ch => { try { ch.destroy(); } catch (e) {} });
  charts = {};
}

function renderCharts() {
  destroyCharts();

  const data     = getFiltered();
  const indData  = INDUSTRIES.map(ind => data.filter(c => c.industry === ind));

  // 共用 Chart.js 選項
  const baseScaleOpts = {
    grid: { color: 'rgba(128,128,128,0.1)' },
    ticks: { font: { size: 11 } },
  };

  // ── C1：年終門檻（堆疊長條）──
  const yearendRate    = indData.map(g => g.length ? Math.round(g.filter(c => c.yearend >= 2).length / g.length * 100) : 0);
  const yearendNoRate  = yearendRate.map(v => 100 - v);

  charts.c1 = new Chart(document.getElementById('c1'), {
    type: 'bar',
    data: {
      labels: INDUSTRIES,
      datasets: [
        { label: '需滿一年', data: yearendRate,   backgroundColor: '#E24B4A' },
        { label: '無此限制', data: yearendNoRate, backgroundColor: '#C0DD97' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { stacked: true, max: 100, ...baseScaleOpts, ticks: { callback: v => v + '%', font: { size: 11 } } },
      },
    },
  });

  // ── C2：紅利門檻（甜甜圈）──
  charts.c2 = new Chart(document.getElementById('c2'), {
    type: 'doughnut',
    data: {
      labels: ['需滿3年/特定職級', '需滿一年', '無限制'],
      datasets: [{
        data: [
          data.filter(c => c.bonus >= 2).length,
          data.filter(c => c.bonus === 1).length,
          data.filter(c => c.bonus === 0).length,
        ],
        backgroundColor: ['#BA7517', '#378ADD', '#639922'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { display: false } },
    },
  });

  // ── C3：三節金額（堆疊長條）──
  const comp7 = data.slice(0, Math.min(7, data.length));
  charts.c3 = new Chart(document.getElementById('c3'), {
    type: 'bar',
    data: {
      labels: comp7.map(c => c.name.length > 4 ? c.name.slice(0, 4) + '…' : c.name),
      datasets: [
        { label: '現金',    data: comp7.map(c => c.festivalType === 'cash' || c.festivalType === 'mixed' ? c.festivalAmt : 0), backgroundColor: '#378ADD' },
        { label: '全聯禮券', data: comp7.map(c => c.festivalType === 'voucher' ? c.festivalAmt : 0),                           backgroundColor: '#888780' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { stacked: true, ...baseScaleOpts, ticks: { callback: v => '$' + v, font: { size: 11 } } },
      },
    },
  });

  // ── C4：文具障礙（長條，顏色依分數）──
  const stRates  = indData.map(g => g.length ? parseFloat((g.reduce((s, c) => s + c.stationary, 0) / g.length).toFixed(1)) : 0);
  const stColors = stRates.map(v => v >= 4 ? '#E24B4A' : v >= 3 ? '#BA7517' : '#639922');

  charts.c4 = new Chart(document.getElementById('c4'), {
    type: 'bar',
    data: {
      labels: INDUSTRIES,
      datasets: [{ label: '障礙指數', data: stRates, backgroundColor: stColors }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { max: 5, ...baseScaleOpts, ticks: { font: { size: 11 } } },
      },
    },
  });

  // ── C5：打卡規定（水平堆疊）──
  const punch3 = indData.map(g => g.length ? Math.round(g.filter(c => c.punch >= 3).length / g.length * 100) : 0);
  const punch2 = indData.map(g => g.length ? Math.round(g.filter(c => c.punch === 2).length / g.length * 100) : 0);
  const punch1 = punch3.map((p3, i) => Math.max(0, 100 - p3 - punch2[i]));

  charts.c5 = new Chart(document.getElementById('c5'), {
    type: 'bar',
    data: {
      labels: INDUSTRIES,
      datasets: [
        { label: '先打卡再回工位', data: punch3, backgroundColor: '#E24B4A' },
        { label: '固定時間打卡',   data: punch2, backgroundColor: '#378ADD' },
        { label: '正常制度',       data: punch1, backgroundColor: '#C0DD97' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, max: 100, ...baseScaleOpts, ticks: { callback: v => v + '%', font: { size: 11 } } },
        y: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

// ---- 篩選切換 ----

function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAll();
}

// ---- Modal ----

function openModal()  { document.getElementById('modalBg').classList.add('open'); }
function closeModal() { document.getElementById('modalBg').classList.remove('open'); }

function submitForm() {
  const name = document.getElementById('f_name').value.trim();
  if (!name) { alert('請填寫公司名稱'); return; }

  companies.push({
    name,
    industry:     document.getElementById('f_industry').value,
    start:        document.getElementById('f_start').value,
    end:          document.getElementById('f_end').value,
    yearend:      parseInt(document.getElementById('f_yearend').value),
    bonus:        parseInt(document.getElementById('f_bonus').value),
    festivalType: document.getElementById('f_3festival_type').value,
    festivalAmt:  parseInt(document.getElementById('f_3festival_amt').value) || 0,
    stationary:   parseInt(document.getElementById('f_stationary').value),
    punch:        parseInt(document.getElementById('f_punch').value),
  });

  // Reset form fields
  document.getElementById('f_name').value = '';
  document.getElementById('f_3festival_amt').value = '';

  closeModal();
  renderAll();
}

// ---- 主渲染 ----

function renderAll() {
  renderMetrics();
  renderTable();
  renderCharts();
}

// 初始化
renderAll();
