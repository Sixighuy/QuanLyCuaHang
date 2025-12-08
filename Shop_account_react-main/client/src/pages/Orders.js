import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { formatPrice } from '../utils/formatPrice';
import './Orders.css';

const Orders = () => {
  const { isAuthenticated, initializing, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {

    if (initializing) {
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }


    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/orders/my-orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Fetch orders error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate, initializing, user]);

  if (initializing) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="orders">
      <h1>Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>Bạn chưa có đơn hàng nào</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>{order.game_name}</h3>
                <span className={`order-status status-${order.status}`}>
                  {order.status === 'pending' && 'Đang chờ'}
                  {order.status === 'completed' && 'Hoàn thành'}
                  {order.status === 'cancelled' && 'Đã hủy'}
                </span>
              </div>
              <div className="order-info">
                <p>Rank: {order.account_level}</p>
                <p>Giá: {formatPrice(order.total_price)}</p>
                <p>Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                <div className="order-actions">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                    className="btn btn-primary"
                  >
                    📋 Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div className="modal" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="order-detail-content">
              <div className="detail-section">
                <h3>🎮 Thông tin sản phẩm</h3>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span className="detail-label">Tên game:</span>
                    <span className="detail-value">{selectedOrder.game_name}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Rank:</span>
                    <span className="detail-value">{selectedOrder.account_level}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Giá:</span>
                    <span className="detail-value price-value">{formatPrice(selectedOrder.total_price)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>📅 Thông tin đơn hàng</h3>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span className="detail-label">Mã đơn hàng:</span>
                    <span className="detail-value">#{selectedOrder.id}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Ngày đặt:</span>
                    <span className="detail-value">{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Trạng thái:</span>
                    <span className={`status-badge status-${selectedOrder.status}`}>
                      {selectedOrder.status === 'pending' && '⏳ Đang chờ'}
                      {selectedOrder.status === 'completed' && '✅ Hoàn thành'}
                      {selectedOrder.status === 'cancelled' && '❌ Đã hủy'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.status === 'completed' && selectedOrder.account_info ? (
                <div className="detail-section account-detail-section">
                  <h3>🔑 Thông tin tài khoản</h3>
                  <div className="account-detail-box">
                    {(() => {
                      
                      const accountInfo = selectedOrder.account_info;
                      let username = '';
                      let password = '';
                      let otherInfo = '';

                    
                      const usernameMatch = accountInfo.match(/username[:\s]+([^\n,]+)/i) || 
                                           accountInfo.match(/tài khoản[:\s]+([^\n,]+)/i) ||
                                           accountInfo.match(/user[:\s]+([^\n,]+)/i) ||
                                           accountInfo.match(/tên đăng nhập[:\s]+([^\n,]+)/i);
                      const passwordMatch = accountInfo.match(/password[:\s]+([^\n,]+)/i) || 
                                            accountInfo.match(/mật khẩu[:\s]+([^\n,]+)/i) ||
                                            accountInfo.match(/pass[:\s]+([^\n,]+)/i) ||
                                            accountInfo.match(/mk[:\s]+([^\n,]+)/i);
                      
                      if (usernameMatch) {
                        username = usernameMatch[1].trim();
                      }
                      if (passwordMatch) {
                        password = passwordMatch[1].trim();
                      }
                      
                     
                      if (!username && !password) {
                        const parts = accountInfo.split(',').map(p => p.trim()).filter(p => p);
                        if (parts.length >= 2) {
                          username = parts[0].replace(/^(username|user|tài khoản|tên đăng nhập)[:\s]+/i, '').trim();
                          password = parts[1].replace(/^(password|pass|mật khẩu|mk)[:\s]+/i, '').trim();
                        } else if (parts.length === 1) {
                        
                          const lineParts = parts[0].split(/[:\s]+/).filter(p => p);
                          if (lineParts.length >= 2) {
                            username = lineParts[0];
                            password = lineParts[1];
                          }
                        }
                      }

                     
                      const canParse = username || password;

                      return (
                        <>
                          {canParse ? (
                            <div className="account-credentials">
                              <div className="credential-item">
                                <span className="credential-label">👤 Tài khoản (Username):</span>
                                <div className="credential-value-box">
                                  <span className="credential-value">{username || 'N/A'}</span>
                                  {username && (
                                    <button
                                      className="copy-btn"
                                      onClick={() => {
                                        navigator.clipboard.writeText(username);
                                        alert('Đã sao chép tài khoản!');
                                      }}
                                      title="Sao chép"
                                    >
                                      📋
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="credential-item">
                                <span className="credential-label">🔒 Mật khẩu (Password):</span>
                                <div className="credential-value-box">
                                  <span className="credential-value password-value">{password || 'N/A'}</span>
                                  {password && (
                                    <button
                                      className="copy-btn"
                                      onClick={() => {
                                        navigator.clipboard.writeText(password);
                                        alert('Đã sao chép mật khẩu!');
                                      }}
                                      title="Sao chép"
                                    >
                                      📋
                                    </button>
                                  )}
                                </div>
                              </div>
                              {accountInfo && accountInfo.trim() !== username && accountInfo.trim() !== password && (
                                <div className="account-info-full">
                                  <span className="credential-label">📝 Thông tin đầy đủ:</span>
                                  <div className="account-info-display">
                                    <pre>{accountInfo}</pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="account-info-display">
                              <pre>{accountInfo}</pre>
                            </div>
                          )}
                          <div className="account-warning">
                            <p>⚠️ <strong>Lưu ý quan trọng:</strong></p>
                            <ul>
                              <li>Vui lòng lưu lại thông tin này ngay lập tức</li>
                              <li>Đổi mật khẩu sau khi nhận tài khoản</li>
                              <li>Không chia sẻ thông tin tài khoản với người khác</li>
                              <li>Thông tin này chỉ hiển thị một lần</li>
                            </ul>
                          </div>
                          <button
                            className="btn btn-success"
                            onClick={() => {
                              navigator.clipboard.writeText(accountInfo);
                              alert('Đã sao chép toàn bộ thông tin tài khoản!');
                            }}
                          >
                            📋 Sao chép toàn bộ thông tin
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : selectedOrder.status === 'pending' ? (
                <div className="detail-section">
                  <div className="pending-notice">
                    <p>⏳ Đơn hàng đang chờ xử lý</p>
                    <p>Thông tin tài khoản sẽ được hiển thị sau khi đơn hàng được xác nhận và hoàn thành.</p>
                  </div>
                </div>
              ) : (
                <div className="detail-section">
                  <div className="cancelled-notice">
                    <p>❌ Đơn hàng đã bị hủy</p>
                    <p>Đơn hàng này đã bị hủy và không thể xem thông tin tài khoản.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

