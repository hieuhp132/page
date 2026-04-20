/**
 * 💳 Payment Dashboard - Table View (Fixed senderBank)
 */

import { useState, useEffect, useCallback } from 'react';

/* =========================
   NORMALIZE
========================= */
const normalizePayment = (p) => ({
  id: p.id,
  amount: p.amount || p.paidAmount || 0,
  status: p.status || 'Unknown',

  orderCode: p.orderCode || '---',
  vaNumber: p.vaNumber || p.vaAccountNumber || '---',

  senderName:
    p.senderAccountName ||
    p.senderName ||
    'Ẩn danh',

  senderAccount:
    p.senderAccountNr ||
    p.senderAccountNumber ||
    'N/A',

  senderBank:
    p.senderBank ||
    '---',

  createdAt: p.createdAt,
  expiredAt: p.expiredAt,
  paidAt: p.paidAt,
});

/* =========================
   FORMAT
========================= */
const formatDate = (input) => {
  if (!input) return '---';
  const d = new Date(input);
  if (isNaN(d.getTime())) return '---';
  return d.toLocaleString('vi-VN');
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);

/* =========================
   APP
========================= */
export default function App() {
  const API_BASE = 'https://api.alowork.com';

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/local/sepay/payments`);
      const data = await res.json();

      const normalized = (data.payments || [])
        .map(normalizePayment)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setHistory(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, [fetchData]);

  const filtered = history.filter(p =>
    p.senderName.toLowerCase().includes(search.toLowerCase()) ||
    p.orderCode.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toString().includes(search)
  );

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('đã thanh toán')) return '#22c55e';
    if (s.includes('hết hạn')) return '#ef4444';
    return '#eab308';
  };

  return (
    <div style={{
      background: '#020617',
      minHeight: '100vh',
      color: '#fff',
      padding: 20,
      fontFamily: 'Inter, sans-serif'
    }}>

      {/* HEADER */}
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>
        💳 Payment Dashboard
      </h1>

      {/* SEARCH */}
      <input
        placeholder="🔍 Tìm kiếm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          border: '1px solid #1e293b',
          background: '#020617',
          color: '#fff'
        }}
      />

      {/* TABLE */}
      <div style={{
        border: '1px solid #1e293b',
        borderRadius: 10,
        overflow: 'hidden'
      }}>

        {/* HEADER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 1fr 1.2fr 1.2fr 1.2fr 1fr',
          padding: 12,
          background: '#020617',
          borderBottom: '1px solid #1e293b',
          fontSize: 12,
          color: '#64748b',
          fontWeight: 600
        }}>
          <div>ID</div>
          <div>Người gửi</div>
          <div>Tài khoản</div>
          <div>Ngân hàng</div>
          <div>Số tiền</div>
          <div>Tạo lúc</div>
          <div>Hết hạn</div>
          <div>Thanh toán</div>
          <div>Trạng thái</div>
        </div>

        {/* ROWS */}
        {loading ? (
          <div style={{ padding: 20 }}>Loading...</div>
        ) : (
          filtered.map(p => (
            <div key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 1fr 1.2fr 1.2fr 1.2fr 1fr',
                padding: 12,
                borderBottom: '1px solid #020617',
                fontSize: 13,
                alignItems: 'center'
              }}
            >

              <div style={{ color: '#64748b' }}>
                {p.id.toString().slice(-6)}
              </div>

              <div>{p.senderName}</div>

              <div style={{ color: '#94a3b8' }}>
                {p.senderAccount}
              </div>

              <div style={{ color: '#64748b' }}>
                {p.senderBank}
              </div>

              <div style={{
                fontWeight: 600,
                color: getStatusColor(p.status)
              }}>
                {formatCurrency(p.amount)}
              </div>

              <div>{formatDate(p.createdAt)}</div>
              <div>{formatDate(p.expiredAt)}</div>
              <div>{formatDate(p.paidAt)}</div>

              <div style={{
                color: getStatusColor(p.status),
                fontWeight: 600
              }}>
                {p.status}
              </div>

            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: 20 }}>
        Tổng: {formatCurrency(filtered.reduce((a, b) => a + b.amount, 0))}
      </div>

    </div>
  );
}