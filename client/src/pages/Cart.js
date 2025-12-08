import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../store/slices/cartSlice';
import { loadUser } from '../store/slices/authSlice';
import axiosInstance from '../utils/axiosConfig';
import { formatPrice } from '../utils/formatPrice';
import './Cart.css';

const Cart = () => {
  const { items, total } = useSelector((state) => state.cart);
  const { isAuthenticated, initializing, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Wait for auth state to initialize before checking
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
  }, [isAuthenticated, navigate, initializing, user]);

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    const userBalance = user?.balance || 0;

    if (userBalance < total) {
      const confirmTopUp = window.confirm(
        `Số dư của bạn không đủ để thanh toán.\n\nSố dư hiện tại: ${formatPrice(userBalance)}\nTổng tiền: ${formatPrice(total)}\n\nBạn có muốn nạp tiền không?`
      );
      if (confirmTopUp) {
        navigate('/wallet');
      }
      return;
    }

    setLoading(true);
    try {
      const successOrders = [];
      const failedOrders = [];
      
      // Create order for each item
      for (const item of items) {
        try {
          const response = await axiosInstance.post('/orders', {
            product_id: item.id,
            payment_method: 'wallet', // Use wallet payment
          });
          successOrders.push(item.game_name);
        } catch (error) {
          console.error(`Error creating order for ${item.game_name}:`, error);
          const errorMessage = error.response?.data?.message || 'Không thể đặt hàng';
          failedOrders.push(`${item.game_name}: ${errorMessage}`);
        }
      }
      
      if (successOrders.length > 0) {
        dispatch(clearCart());
        // Refresh user balance
        dispatch(loadUser());
        
        if (failedOrders.length > 0) {
          alert(`Đã đặt ${successOrders.length} đơn hàng thành công!\n\nCó ${failedOrders.length} đơn hàng thất bại:\n${failedOrders.join('\n')}`);
        } else {
          alert('Đã mua thành công, cảm ơn quý khách!');
        }
        navigate('/orders');
      } else {
        alert(`Không thể đặt hàng:\n${failedOrders.join('\n')}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt hàng';
      alert('Lỗi: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while initializing auth state
  if (initializing) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="cart">
      <h1>Giỏ hàng</h1>
      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Giỏ hàng trống</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.game_name}</h3>
                  <p>Rank: {item.account_level}</p>
                  <p className="cart-item-price">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="btn btn-danger"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="cart-balance-info">
              <p>Số dư: <strong>{formatPrice(user?.balance || 0)}</strong></p>
              {user && (user.balance || 0) < total && (
                <p className="balance-warning">
                  ⚠️ Số dư không đủ. <Link to="/wallet">Nạp tiền ngay</Link>
                </p>
              )}
            </div>
            <div className="cart-total">
              <h2>Tổng cộng: {formatPrice(total)}</h2>
            </div>
            <button
              onClick={handleCheckout}
              className="btn btn-primary btn-large"
              disabled={loading || (user && (user.balance || 0) < total)}
            >
              {loading ? 'Đang xử lý...' : 'Thanh toán bằng ví'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

