import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { clearCart } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, initializing } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart()); // Clear cart when logging out
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Shop acc
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link to="/products" className="navbar-link">
              Sản phẩm
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin" className="navbar-link">
                    Quản lý
                  </Link>
                </li>
              )}
              {user?.role !== 'admin' && (
                <>
                  <li>
                    <Link to="/wallet" className="navbar-link navbar-wallet">
                      💰 {formatPrice(user?.balance || 0, false)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="navbar-link">
                      Đơn hàng
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className="navbar-link">
                      Giỏ hàng ({items.length})
                    </Link>
                  </li>
                </>
              )}
              <li>
                <span className="navbar-user">Xin chào, {user?.username}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="navbar-button">
                  Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="navbar-link">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-link">
                  Đăng ký
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

