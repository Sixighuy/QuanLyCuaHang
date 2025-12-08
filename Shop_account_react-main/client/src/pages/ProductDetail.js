import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, clearCurrentProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, loading } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(id));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }
    dispatch(addToCart(currentProduct));
    alert('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    dispatch(addToCart(currentProduct));
    navigate('/cart');
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!currentProduct) {
    return <div className="loading">Không tìm thấy sản phẩm</div>;
  }

  const images = currentProduct.images && Array.isArray(currentProduct.images) 
    ? currentProduct.images.filter(img => img && img.trim() !== '')
    : [];

  return (
    <div className="product-detail">
      <Link to="/products" className="back-link">← Quay lại</Link>
      <div className="product-detail-container">
        <div className="product-detail-main">
          {/* Image Gallery */}
          <div className="product-images-section">
            {images.length > 0 ? (
              <>
                <div className="product-main-image">
                  <img 
                    src={images[selectedImageIndex]} 
                    alt={`${currentProduct.game_name} - Ảnh ${selectedImageIndex + 1}`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                    }}
                  />
                </div>
                {images.length > 1 && (
                  <div className="product-thumbnails">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img 
                          src={image} 
                          alt={`Thumbnail ${index + 1}`}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="product-no-image">
                <div className="no-image-placeholder">
                  <span>📷</span>
                  <p>Chưa có ảnh</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <h1>{currentProduct.game_name}</h1>
            <p className="product-level">Rank: {currentProduct.account_level}</p>
            <p className="product-price">{formatPrice(currentProduct.price)}</p>
            <div className="product-description">
              <h3>Mô tả</h3>
              <p>{currentProduct.description || 'Không có mô tả'}</p>
            </div>
            {user?.role === 'admin' && currentProduct.account_info && (
              <div className="product-account-info">
                <h3>Thông tin tài khoản (Chỉ Admin)</h3>
                <pre>{currentProduct.account_info}</pre>
              </div>
            )}
            {user?.role !== 'admin' && (
              <>
                <div className="product-account-info-notice">
                  <p>ℹ️ Thông tin tài khoản sẽ được hiển thị sau khi bạn mua và đơn hàng được xác nhận.</p>
                </div>
                <div className="product-actions">
                  <button onClick={handleAddToCart} className="btn btn-secondary">
                    Thêm vào giỏ hàng
                  </button>
                  <button onClick={handleBuyNow} className="btn btn-primary">
                    Mua ngay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
