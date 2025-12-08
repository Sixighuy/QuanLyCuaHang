import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { getGameImage, getGameIcon, getGameLogo } from '../utils/gameImages';
import { formatPrice } from '../utils/formatPrice';
import './Products.css';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

 
  useEffect(() => {
    const handleFocus = () => {
      dispatch(fetchProducts());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

 
  const gameNames = useMemo(() => {
    const games = [...new Set(products.map(p => p.game_name))];
    return games.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {

    let filtered = products.filter(p => p.status === 'available');


    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.game_name.toLowerCase().includes(term) ||
        product.account_level?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
    }


    if (selectedGame) {
      filtered = filtered.filter(product => product.game_name === selectedGame);
    }

    if (priceFilter !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price;
        switch (priceFilter) {
          case 'under-200k':
            return price < 200000;
          case '200k-500k':
            return price >= 200000 && price < 500000;
          case '500k-1m':
            return price >= 500000 && price < 1000000;
          case 'over-1m':
            return price >= 1000000;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [products, searchTerm, selectedGame, priceFilter]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    dispatch(addToCart(product));
    alert('Đã thêm vào giỏ hàng!');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGame('');
    setPriceFilter('all');
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Danh sách Nick Game</h1>
        <p>Chọn nick game phù hợp với bạn</p>
      </div>

      {/* Search and Filter Section */}
      <div className="products-filters">
        <div className="filter-group">
          <label htmlFor="search">🔍 Tìm kiếm</label>
          <input
            type="text"
            id="search"
            placeholder="Tìm theo tên game, rank, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="game-filter">🎮 Danh mục game</label>
          <select
            id="game-filter"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả game</option>
            {gameNames.map(game => (
              <option key={game} value={game}>{game}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="price-filter">💰 Lọc theo giá</label>
          <select
            id="price-filter"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả giá</option>
            <option value="under-200k">Dưới 200.000 ₫</option>
            <option value="200k-500k">200.000 - 500.000 ₫</option>
            <option value="500k-1m">500.000 - 1.000.000 ₫</option>
            <option value="over-1m">Trên 1.000.000 ₫</option>
          </select>
        </div>

        {(searchTerm || selectedGame || priceFilter !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="btn-clear-filters"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="products-results">
        <p>
          Hiển thị <strong>{filteredProducts.length}</strong> / {products.length} sản phẩm
        </p>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn</p>
            <button onClick={handleClearFilters} className="btn btn-primary">
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const gameImage = getGameImage(product.game_name);
            const gameIcon = getGameIcon(product.game_name);
            const gameLogo = getGameLogo(product.game_name);
            const hasFeaturedImage = product.featured_image && product.featured_image.trim() !== '';
            
            return (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  {hasFeaturedImage ? (
                    <img 
                      src={product.featured_image} 
                      alt={product.game_name}
                      className="product-featured-image"
                      onError={(e) => {
                        // Fallback to logo if image fails to load
                        e.target.style.display = 'none';
                        const logoContainer = e.target.parentElement.querySelector('.product-game-logo');
                        const gradient = e.target.parentElement.querySelector('.product-image-gradient');
                        if (logoContainer && gameLogo) {
                          logoContainer.style.display = 'flex';
                        } else if (gradient) {
                          gradient.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  {!hasFeaturedImage && gameLogo ? (
                    <div className="product-game-logo">
                      <img 
                        src={gameLogo} 
                        alt={product.game_name}
                        onError={(e) => {
                          // Fallback to gradient + icon if logo fails
                          e.target.style.display = 'none';
                          const gradient = e.target.parentElement.parentElement.querySelector('.product-image-gradient');
                          if (gradient) {
                            gradient.style.display = 'flex';
                          }
                        }}
                      />
                    </div>
                  ) : null}
                  <div 
                    className="product-image-gradient" 
                    style={{ 
                      background: gameImage,
                      display: (hasFeaturedImage || gameLogo) ? 'none' : 'flex'
                    }}
                  >
                    <div className="product-icon">{gameIcon}</div>
                  </div>
                </div>
                <div className="product-info">
                  <h3>{product.game_name}</h3>
                  <p className="product-level">Rank: {product.account_level}</p>
                  <p className="product-price">{formatPrice(product.price)}</p>
                  <p className="product-description">{product.description}</p>
                </div>
                <div className="product-actions">
                  <Link to={`/product/${product.id}`} className="btn btn-primary">
                    Xem chi tiết
                  </Link>
                  {user?.role !== 'admin' && (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn btn-secondary"
                    >
                      Thêm vào giỏ
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Products;

