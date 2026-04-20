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
    p.senderBank || '---',

  createdAt: p.createdAt,
  expiredAt: p.expiredAt,
  paidAt: p.paidAt,
});

/* ========================= */
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

/* ========================= */
export default function App() {
  const API_BASE = 'https://api.alowork.com';

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  /* detect mobile */
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

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
      color: '#e2e8f0',
      padding: 16,
      fontFamily: 'Inter, sans-serif'
    }}>

      {/* HEADER */}
      <h1 style={{
        fontSize: 22,
        marginBottom: 16,
        fontWeight: 700
      }}>
        💳 Payments
      </h1>

      {/* SEARCH */}
      <input
        placeholder="🔍 Tìm kiếm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 16,
          borderRadius: 8,
          border: '1px solid #1e293b',
          background: '#020617',
          color: '#fff'
        }}
      />

      {/* =========================
         MOBILE VIEW (CARD)
      ========================= */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(p => (
            <div key={p.id}
              style={{
                background: '#020617',
                border: '1px solid #1e293b',
                borderRadius: 12,
                padding: 14
              }}
            >

              <div style={{ fontWeight: 600 }}>
                {p.senderName}
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {p.senderAccount} • {p.senderBank}
              </div>

              <div style={{ marginTop: 6, fontSize: 12 }}>
                Order: {p.orderCode}
              </div>

              <div style={{ marginTop: 6, fontSize: 12 }}>
                VA: <span style={{ color: '#38bdf8' }}>{p.vaNumber}</span>
              </div>

              <div style={{
                marginTop: 10,
                fontSize: 18,
                fontWeight: 700,
                color: getStatusColor(p.status)
              }}>
                {formatCurrency(p.amount)}
              </div>

              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                {formatDate(p.createdAt)}
              </div>

              <div style={{
                marginTop: 8,
                fontSize: 11,
                fontWeight: 600,
                color: getStatusColor(p.status)
              }}>
                {p.status}
              </div>

            </div>
          ))}
        </div>
      ) : (

        /* =========================
           DESKTOP TABLE
        ========================= */
        <div style={{
          border: '1px solid #1e293b',
          borderRadius: 12,
          overflow: 'hidden'
        }}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr 1.5fr 1.2fr 1.2fr 1fr 1.2fr 1.2fr 1.2fr 1fr',
            padding: 12,
            fontSize: 12,
            color: '#94a3b8',
            borderBottom: '1px solid #1e293b'
          }}>
            <div>ID</div>
            <div>Người gửi</div>
            <div>Tài khoản</div>
            <div>Ngân hàng</div>
            <div>VA</div>
            <div>Số tiền</div>
            <div>Tạo</div>
            <div>Hết hạn</div>
            <div>Paid</div>
            <div>Status</div>
          </div>

          {filtered.map(p => (
            <div key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr 1.5fr 1.2fr 1.2fr 1fr 1.2fr 1.2fr 1.2fr 1fr',
                padding: 12,
                fontSize: 13,
                borderBottom: '1px solid #020617'
              }}
            >
              <div>{p.id.slice(-6)}</div>
              <div>{p.senderName}</div>
              <div>{p.senderAccount}</div>
              <div>{p.senderBank}</div>
              <div style={{ color: '#38bdf8' }}>{p.vaNumber}</div>
              <div style={{ color: getStatusColor(p.status) }}>
                {formatCurrency(p.amount)}
              </div>
              <div>{formatDate(p.createdAt)}</div>
              <div>{formatDate(p.expiredAt)}</div>
              <div>{formatDate(p.paidAt)}</div>
              <div style={{ color: getStatusColor(p.status) }}>
                {p.status}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* FOOTER */}
      <div style={{ marginTop: 20 }}>
        Tổng: {formatCurrency(filtered.reduce((a, b) => a + b.amount, 0))}
      </div>

    </div>
  );
}