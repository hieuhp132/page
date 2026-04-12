/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw,
  CreditCard,
  ArrowUpRight,
  Search,
  Clock,
  User,
  Hash,
  AlertCircle,
  CheckCircle2,
  Banknote,
  BanknoteIcon,
  Globe,
  Wallet,
  Coins
} from 'lucide-react';

const BankLogo = ({ bankAccount, isHovered }) => {
  const bankInfo = useMemo(() => {
    const account = (bankAccount || '').toUpperCase();
    if (account.includes('MBBANK') || account.includes('MB BANK') || account.includes('MB')) {
      return { logo: 'https://img.vietqr.io/image/MB/logo.png', name: 'MB Bank', code: 'MB' };
    }
    if (account.includes('VCB') || account.includes('VIETCOMBANK')) {
      return { logo: 'https://img.vietqr.io/image/VCB/logo.png', name: 'Vietcombank', code: 'VCB' };
    }
    if (account.includes('VNPAY')) {
      return { logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_VNPAY.png', name: 'VNPay', code: 'VNPAY' };
    }
    return null;
  }, [bankAccount]);

  if (bankInfo) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isHovered ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <img src={bankInfo.logo} alt={bankInfo.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 500 }}>{bankInfo.name}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <BanknoteIcon style={{ width: '1rem', height: '1rem', opacity: 0.5 }} />
      <span style={{ fontSize: '12px' }}>{bankAccount || 'Unknown'}</span>
    </div>
  );
};

export default function App() {
  const API_BASE = 'https://api.alowork.com';
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/local/sepay/payments`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setHistory(data.payments || []);
        setLastUpdated(new Date());
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Failed to synchronize with Tingee API. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  const filteredHistory = history.filter(payment =>
    payment.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id?.toString().includes(searchTerm)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending...';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try to parse relative or custom formats if needed, otherwise fallback
      return 'Recent';
    }
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const styles = useMemo(() => ({
    container: {
      minHeight: '100vh',
      backgroundColor: '#18181b', // Zero-900 Neutral
      color: '#fafafa',
      fontFamily: '"Inter", "Outfit", sans-serif',
      paddingBottom: '80px',
    },
    header: {
      borderBottom: '1px solid #3f3f46',
      padding: '1.5rem 1.5rem',
      backgroundColor: 'rgba(24, 24, 27, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: '1.5rem',
    },
    statusDot: {
      width: '0.625rem',
      height: '0.625rem',
      backgroundColor: '#22c55e',
      borderRadius: '9999px',
      boxShadow: '0 0 12px rgba(34, 197, 94, 0.5)',
    },
    systemLive: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: '#22c55e',
      fontWeight: '600',
    },
    title: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: '700',
      fontSize: isMobile ? '1.75rem' : '2.25rem',
      letterSpacing: '-0.02em',
      background: 'linear-gradient(to right, #fafafa, #71717a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0.25rem 0',
    },
    syncText: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.75rem',
      color: '#71717a',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    searchInputWrapper: {
      position: 'relative',
      width: isMobile ? '100%' : 'auto',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.875rem',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '1rem',
      height: '1rem',
      color: '#71717a',
    },
    searchInput: {
      backgroundColor: '#27272a',
      border: '1px solid #3f3f46',
      borderRadius: '8px',
      padding: '0.625rem 1rem 0.625rem 2.75rem',
      color: '#fafafa',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'all 0.2s ease',
      width: isMobile ? '100%' : '20rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    refreshButton: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      border: '1px solid #3f3f46',
      backgroundColor: '#27272a',
      color: '#fafafa',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    main: {
      padding: isMobile ? '1rem' : '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    errorBox: {
      marginBottom: '2rem',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      color: '#ef4444',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.875rem',
    },
    gridHeader: {
      display: isMobile ? 'none' : 'grid',
      gridTemplateColumns: 'minmax(80px, 0.5fr) 1.5fr 1.2fr 0.8fr 1fr 1.2fr 150px',
      gap: '1rem',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #3f3f46',
      color: '#a1a1aa',
    },
    gridHeaderLabel: {
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
    row: (isHovered) => ({
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(80px, 0.5fr) 1.5fr 1.2fr 0.8fr 1fr 1.2fr 150px',
      gap: '1rem',
      padding: '1.25rem 1.5rem',
      alignItems: 'center',
      borderBottom: '1px solid #27272a',
      backgroundColor: isHovered ? '#27272a' : 'transparent',
      borderRadius: isHovered ? '8px' : '0px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      transform: isHovered ? 'scale(1.005)' : 'scale(1)',
      boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : 'none',
      position: 'relative',
      zIndex: isHovered ? 10 : 1,
    }),
    bank: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#a1a1aa',
      whiteSpace: 'nowrap',
    },
    idText: (isHovered) => ({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.75rem',
      color: isHovered ? '#fafafa' : '#71717a',
      fontWeight: '500',
    }),
    senderName: {
      fontSize: '0.925rem',
      fontWeight: '600',
      color: '#fafafa',
      marginBottom: '0.25rem',
    },
    content: (isHovered) => ({
      fontSize: '0.8125rem',
      color: isHovered ? '#a1a1aa' : '#71717a',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    amountText: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: '700',
      fontSize: '1rem',
      color: '#fafafa',
    },
    timestamp: {
      fontSize: '0.8125rem',
      color: '#a1a1aa',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    statusBadge: (status) => {
      const s = status?.toLowerCase() || '';
      const isPaid = s.includes('đã thanh toán') || s.includes('success') || s.includes('complete');
      const isUnpaid = s.includes('chưa thanh toán') || s.includes('pending') || s.includes('failed');

      let color = '#eab308'; // Default Yellow
      let bg = 'rgba(234, 179, 8, 0.1)';
      let border = 'rgba(234, 179, 8, 0.2)';

      if (isPaid) {
        color = '#22c55e';
        bg = 'rgba(34, 197, 94, 0.1)';
        border = 'rgba(34, 197, 94, 0.2)';
      } else if (isUnpaid) {
        color = '#ef4444';
        bg = 'rgba(239, 68, 68, 0.1)';
        border = 'rgba(239, 68, 68, 0.2)';
      }

      return {
        padding: '0.375rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '10px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        whiteSpace: 'nowrap',
      };
    },
    status: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      minWidth: '130px',
    },
    footer: {
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: isMobile ? 'calc(100% - 2rem)' : 'auto',
      minWidth: isMobile ? 'none' : '600px',
      backgroundColor: 'rgba(24, 24, 27, 0.8)',
      backdropFilter: 'blur(16px)',
      border: '1px solid #27272a',
      borderRadius: '16px',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    },
    statLabel: {
      fontSize: '10px',
      fontWeight: '600',
      color: '#71717a',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    statValue: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1rem',
      fontWeight: '700',
      color: '#fafafa',
    }
  }), [isMobile]);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <header style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={styles.statusDot} />
            <span style={styles.systemLive}>Hệ thống đang hoạt động</span>
          </div>
          <h1 style={styles.title}>Lịch sử tạo qrcode Sepay</h1>
          <p style={styles.syncText}>
            {lastUpdated ? `Cập nhật lần cuối: ${lastUpdated.toLocaleTimeString()}` : 'Đang đồng bộ...'}
          </p>
        </div>

        <div style={styles.searchContainer}>
          <div style={styles.searchInputWrapper}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Filter by sender, content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#141414'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(20, 20, 20, 0.2)'}
            />
          </div>
          <button
            onClick={fetchPayments}
            disabled={isLoading}
            style={{
              ...styles.refreshButton,
              opacity: isLoading ? 0.5 : 1,
              backgroundColor: hoveredId === 'refresh' ? '#141414' : 'transparent',
              color: hoveredId === 'refresh' ? '#E4E3E0' : '#141414',
            }}
            onMouseEnter={() => setHoveredId('refresh')}
            onMouseLeave={() => setHoveredId(null)}
          >
            <RefreshCw
              style={{
                width: '1.25rem',
                height: '1.25rem',
                animation: isLoading ? 'spin 1s linear infinite' : 'none'
              }}
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.errorBox}
          >
            <AlertCircle style={{ width: '1.25rem', height: '1.25rem' }} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Data Grid Header */}
        <div style={styles.gridHeader}>
          <span style={styles.gridHeaderLabel}>ID</span>
          <span style={styles.gridHeaderLabel}>Người gửi</span>
          <span style={styles.gridHeaderLabel}>Số tài khoản</span>
          <span style={styles.gridHeaderLabel}>Ngân hàng</span>
          <span style={styles.gridHeaderLabel}>Số tiền</span>
          <span style={styles.gridHeaderLabel}>Thời gian</span>
          <span style={styles.gridHeaderLabel}>Trạng thái</span>
        </div>

        {/* Data Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {isLoading && history.length === 0 ? (
            <div style={{ padding: '5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
              <RefreshCw style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
              <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Đang đồng bộ dữ liệu</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ padding: '5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
              <Search style={{ width: '2rem', height: '2rem', marginBottom: '1rem' }} />
              <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Không tìm thấy bản ghi nào</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((payment, index) => {
                const isHovered = hoveredId === payment.id;
                return (
                  <motion.div
                    key={payment.id || index}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    style={styles.row(isHovered)}
                    onMouseEnter={() => setHoveredId(payment.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >


                    <span style={styles.idText(isHovered)}>
                      #{payment.id?.toString().slice(-6) || '---'}
                    </span>

                    <div style={styles.senderContent}>
                      <div style={styles.senderName}>
                        {payment.senderAccountName || 'Anonymous User'}
                      </div>
                      {/* <span style={styles.content(isHovered)}>
                        {payment.purpose || 'No description provided'}
                      </span> */}
                    </div>

                    <div style={styles.bankAccount}>
                      <BankLogo bankAccount={payment.senderAccountNr} isHovered={isHovered} />
                    </div>
                    <div style={styles.bank}>
                      {payment.bankName}
                    </div>
                    <div style={styles.amount}>
                      <span style={styles.amountText}>
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>

                    <div style={styles.timestamp}>
                      <Clock style={{ width: '0.875rem', height: '0.875rem', color: '#71717a' }} />
                      <span>{formatDate(payment.timestamp)}</span>
                    </div>

                    <div style={styles.status}>
                      <div style={styles.statusBadge(payment.status)}>
                        <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} />
                        {payment.status || 'Processing'}
                      </div>
                      <ArrowUpRight style={{ width: '1.125rem', height: '1.125rem', marginLeft: 'auto', opacity: isHovered ? 1 : 0, transition: 'all 0.2s', color: '#3b82f6' }} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
        <div style={{ height: '4rem' }} /> {/* Spacer for footer */}
      </main>

      {/* Footer / Stats */}
      <footer style={styles.footer}>
        <div style={styles.footerStats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Tổng khối lượng</span>
            <span style={styles.statValue}>
              {formatCurrency(filteredHistory.reduce((acc, curr) => acc + (curr.amount || 0), 0))}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Số bản ghi: </span>
            <span style={styles.statValue}> {filteredHistory.length}</span>
          </div>
        </div>

        <div style={styles.apiStatus}>
          <div style={styles.apiDot} />
          <span style={styles.apiLabel}>Đã kết nối API</span>
        </div>
      </footer>
    </div>
  );
}

