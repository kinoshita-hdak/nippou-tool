const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'reports.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadReports() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function saveReports(reports) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf8');
}

// 一覧取得
app.get('/api/reports', (req, res) => {
  const reports = loadReports();
  res.json(reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// 個別取得
app.get('/api/reports/:id', (req, res) => {
  const report = loadReports().find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: '見つかりません' });
  res.json(report);
});

// 新規作成
app.post('/api/reports', (req, res) => {
  const reports = loadReports();
  const report = { id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  reports.push(report);
  saveReports(reports);
  res.status(201).json(report);
});

// 更新
app.put('/api/reports/:id', (req, res) => {
  const reports = loadReports();
  const idx = reports.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '見つかりません' });
  reports[idx] = { ...reports[idx], ...req.body, id: req.params.id };
  saveReports(reports);
  res.json(reports[idx]);
});

// 削除
app.delete('/api/reports/:id', (req, res) => {
  const reports = loadReports();
  const idx = reports.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '見つかりません' });
  reports.splice(idx, 1);
  saveReports(reports);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`日報ツール起動中: http://localhost:${PORT}`);
});
