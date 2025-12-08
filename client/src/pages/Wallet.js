import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { formatPrice } from '../utils/formatPrice';
import { loadUser } from '../store/slices/authSlice';
import './Wallet.css';

const Wallet = () => {
  const { user, isAuthenticated, initializing } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [topupRequests, setTopupRequests] = useState([]);

  useEffect(() => {
    if (initializing) {
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect admin to admin panel
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }

    fetchBalance();
    fetchTopupRequests();
  }, [isAuthenticated, navigate, initializing, user]);

  const fetchTopupRequests = async () => {
    try {
      const response = await axiosInstance.get('/wallet/topup-requests');
      setTopupRequests(response.data);
    } catch (error) {
      console.error('Fetch topup requests error:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await axiosInstance.get('/wallet/balance');
      setBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Fetch balance error:', error);
      alert('Có lỗi xảy ra khi tải số dư');
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    
    const topUpAmount = parseFloat(amount);
    
    if (!amount || isNaN(topUpAmount) || topUpAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ (lớn hơn 0)');
      return;
    }

    if (topUpAmount < 10000) {
      alert('Số tiền nạp tối thiểu là 10.000 ₫');
      return;
    }

    if (topUpAmount > 100000000) {
      alert('Số tiền nạp tối đa là 100.000.000 ₫');
      return;
    }

    // Chỉ hiển thị QR code, không tạo request ngay
    setCurrentRequest({
      amount: topUpAmount,
      customer_code: user?.customer_code
    });
    setShowQRModal(true);
    setAmount('');
  };

  const handleConfirmPayment = async () => {
    if (!currentRequest || !currentRequest.amount || !currentRequest.customer_code) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }

    setLoading(true);
    try {
      // Chỉ tạo request khi user xác nhận đã chuyển tiền
      const response = await axiosInstance.post('/wallet/topup-request', { 
        amount: currentRequest.amount 
      });
      
      setShowQRModal(false);
      setCurrentRequest(null);
      alert('Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin duyệt.');
      await fetchTopupRequests();
    } catch (error) {
      console.error('Create topup request error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo yêu cầu nạp tiền';
      alert('Lỗi: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTopup = () => {
    setShowQRModal(false);
    setCurrentRequest(null);
  };

  const getQRCodeURL = (amount, customerCode) => {
    // Tạo URL VietQR - format chuẩn cho chuyển khoản ngân hàng Việt Nam
    // URL này sẽ được hiển thị dưới dạng QR code image từ VietQR API
    const encodedAmount = encodeURIComponent(amount.toString());
    const encodedCustomerCode = encodeURIComponent(customerCode);
    return `https://img.vietqr.io/image/techcombank-19073286641014-compact2.jpg?amount=${encodedAmount}&addInfo=${encodedCustomerCode}&accountName=Vu%20Gia%20Huy`;
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  if (initializing) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="wallet-page">
      <div className="wallet-container">
        <h1>Ví của tôi</h1>
        
        <div className="balance-card">
          <div className="balance-label">Số dư hiện tại</div>
          <div className="balance-amount">
            {loadingBalance ? (
              <span>Đang tải...</span>
            ) : (
              formatPrice(balance)
            )}
          </div>
        </div>

        <div className="topup-section">
          <h2>Nạp tiền vào ví</h2>
          <form onSubmit={handleTopUp} className="topup-form">
            <div className="form-group">
              <label htmlFor="amount">Số tiền nạp (₫)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền (tối thiểu 10.000 ₫, tối đa 100.000.000 ₫)"
                min="10000"
                step="1000"
                max="100000000"
                required
                disabled={loading}
              />
            </div>

            <div className="quick-amounts">
              <label>Chọn nhanh:</label>
              <div className="quick-amount-buttons">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    className="quick-amount-btn"
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={loading}
                  >
                    {formatPrice(quickAmount, false)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading || !amount}
            >
              {loading ? 'Đang xử lý...' : 'Nạp tiền'}
            </button>
          </form>
        </div>

        {/* Top-up Requests History */}
        {topupRequests.length > 0 && (
          <div className="topup-history">
            <h2>Lịch sử yêu cầu nạp tiền</h2>
            <div className="requests-list">
              {topupRequests.map((request) => (
                <div key={request.id} className={`request-item request-${request.status}`}>
                  <div className="request-info">
                    <div className="request-amount">{formatPrice(request.amount)}</div>
                    <div className="request-date">
                      {new Date(request.created_at).toLocaleString('vi-VN')}
                    </div>
                    <div className="request-code">Mã: {request.customer_code}</div>
                  </div>
                  <div className="request-status">
                    {request.status === 'pending' && <span className="status-pending">⏳ Chờ duyệt</span>}
                    {request.status === 'approved' && <span className="status-approved">✅ Đã duyệt</span>}
                    {request.status === 'rejected' && <span className="status-rejected">❌ Đã từ chối</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="wallet-info">
          <h3>Thông tin ví</h3>
          <ul>
            <li>Số dư có thể sử dụng để thanh toán các đơn hàng</li>
            <li>Số tiền nạp tối thiểu: 10.000 ₫</li>
            <li>Số tiền nạp tối đa: 100.000.000 ₫</li>
            <li>Số dư không có thời hạn sử dụng</li>
            <li>Bạn có thể nạp tiền bất cứ lúc nào</li>
          </ul>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && currentRequest && (
        <div className="qr-modal-overlay" onClick={handleCancelTopup}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h2>Quét mã QR để nạp tiền</h2>
              <button className="close-btn" onClick={handleCancelTopup}>×</button>
            </div>
            <div className="qr-modal-content">
              <div className="qr-info">
                <p><strong>Số tiền:</strong> {formatPrice(currentRequest.amount)}</p>
                <p><strong>Nội dung chuyển khoản:</strong> <code style={{ 
                  background: '#f0f0f0', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>{currentRequest.customer_code}</code></p>
                <p><strong>Ngân hàng:</strong> Techcombank</p>
                <p><strong>Số tài khoản:</strong> 19073286641014</p>
                <p><strong>Chủ tài khoản:</strong> Vu Gia Huy</p>
                <p className="qr-note">⚠️ Vui lòng nhập đúng nội dung chuyển khoản là mã khách hàng của bạn khi chuyển tiền</p>
              </div>
              <div className="qr-code-container">
                <img 
                  src={getQRCodeURL(currentRequest.amount, currentRequest.customer_code)} 
                  alt="QR Code" 
                  className="qr-code-image"
                />
                <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
                  Quét mã QR bằng ứng dụng ngân hàng để chuyển khoản
                </p>
              </div>
              <div className="qr-modal-actions">
                <button
                  className="btn btn-success"
                  onClick={handleConfirmPayment}
                >
                  Xác nhận đã chuyển tiền
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelTopup}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;

