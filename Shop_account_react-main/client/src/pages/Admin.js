import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { formatPrice } from '../utils/formatPrice';
import './Admin.css';

const Admin = () => {
  const { user, isAuthenticated, initializing } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [topupRequests, setTopupRequests] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    game_name: '',
    account_level: '',
    price: '',
    import_price: '',
    description: '',
    account_info: '',
    account_username: '',
    account_password: '',
    featured_image: '',
    images: [],
    status: 'available',
  });


  const allowedGames = [
    'Liên Quân Mobile',
    'PUBG Mobile',
    'Free Fire',
    'Mobile Legends',
    'Genshin Impact',
    'Valorant'
  ];
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'user',
    balance: '',
    customer_code: '',
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [topupSearch, setTopupSearch] = useState('');

  useEffect(() => {
    
    if (initializing) {
      return;
    }
    
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAllData();
  }, [isAuthenticated, user, navigate, initializing]);

  useEffect(() => {
    if (activeSection !== 'dashboard') {
      fetchSectionData();
    }
  }, [activeSection]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes, usersRes, topupRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/products'),
        axiosInstance.get('/orders/all'),
        axiosInstance.get('/admin/users'),
        axiosInstance.get('/admin/topup-requests'),
      ]);
      setStats(statsRes.data);
      setTopupRequests(topupRes.data);
      
    
      const productsWithParsedImages = productsRes.data.map(product => {
        if (product.images && typeof product.images === 'string') {
          try {
            product.images = JSON.parse(product.images);
          } catch (e) {
            product.images = [];
          }
        } else if (!product.images) {
          product.images = [];
        }
     
        if (!product.hasOwnProperty('featured_image')) {
          product.featured_image = null;
        }
        return product;
      });
      setProducts(productsWithParsedImages);
      
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      if (activeSection === 'products') {
        const response = await axiosInstance.get('/products');

        const productsWithParsedImages = response.data.map(product => {
          if (product.images && typeof product.images === 'string') {
            try {
              product.images = JSON.parse(product.images);
            } catch (e) {
              product.images = [];
            }
          } else if (!product.images) {
            product.images = [];
          }

          if (!product.hasOwnProperty('featured_image')) {
            product.featured_image = null;
          }
          return product;
        });
        setProducts(productsWithParsedImages);
      } else if (activeSection === 'orders') {
        const response = await axiosInstance.get('/orders/all');
        setOrders(response.data);
      } else if (activeSection === 'users') {
        const [usersRes, topupRes] = await Promise.all([
          axiosInstance.get('/admin/users'),
          axiosInstance.get('/admin/topup-requests'),
        ]);
        setUsers(usersRes.data);
        setTopupRequests(topupRes.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {

      const priceValue = productForm.price 
        ? (typeof productForm.price === 'string' 
            ? parseFloat(productForm.price.replace(/[^\d.]/g, '')) 
            : Number(productForm.price))
        : 0;
      const importPriceValue = productForm.import_price
        ? (typeof productForm.import_price === 'string'
            ? parseFloat(productForm.import_price.replace(/[^\d.]/g, ''))
            : Number(productForm.import_price))
        : 0;

      let accountInfo = '';
      if (productForm.account_username && productForm.account_password) {
        accountInfo = `Username: ${productForm.account_username.trim()}, Password: ${productForm.account_password.trim()}`;
      } else if (productForm.account_info) {
        accountInfo = productForm.account_info.trim();
      }

      const submitData = {
        game_name: productForm.game_name ? productForm.game_name.trim() : '',
        account_level: productForm.account_level ? productForm.account_level.trim() : '',
        price: priceValue,
        import_price: importPriceValue,
        description: productForm.description ? productForm.description.trim() : '',
        account_info: accountInfo,
        featured_image: productForm.featured_image && productForm.featured_image.trim() ? productForm.featured_image.trim() : null,
        status: productForm.status || 'available',
        images: productForm.images && Array.isArray(productForm.images) 
          ? productForm.images.filter(img => img && typeof img === 'string' && img.trim() !== '') 
          : [],
      };

      console.log('Submitting product data:', submitData);
      console.log('Is editing:', !!editingProduct);

      if (!submitData.game_name || submitData.game_name.trim() === '') {
        alert('Vui lòng nhập tên game');
        return;
      }

      if (!submitData.price || isNaN(submitData.price) || submitData.price <= 0) {
        alert('Vui lòng nhập giá hợp lệ (giá phải lớn hơn 0)');
        return;
      }

      if (editingProduct) {
        console.log('Updating product:', editingProduct.id);
        console.log('Submit data:', submitData);
        const response = await axiosInstance.put(`/products/${editingProduct.id}`, submitData);
        console.log('Update response:', response.data);
        console.log('Updated product featured_image:', response.data.featured_image);
        alert('Đã cập nhật sản phẩm thành công!');
      } else {
        console.log('Creating new product');
        console.log('Submit data:', submitData);
        const response = await axiosInstance.post('/products', submitData);
        console.log('Create response:', response.data);
        alert('Đã thêm sản phẩm thành công!');
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        game_name: '',
        account_level: '',
        price: '',
        import_price: '',
        description: '',
        account_info: '',
        account_username: '',
        account_password: '',
        featured_image: '',
        images: [],
        status: 'available',
      });
      fetchAllData();

      if (window.location.pathname === '/products') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      alert('Lỗi: ' + errorMessage);
    }
  };

  const handleEditProduct = async (product) => {
    console.log('Editing product:', product);
    
    try {
      
      const response = await axiosInstance.get(`/products/${product.id}`);
      const freshProduct = response.data;
      console.log('Fresh product data:', freshProduct);
      console.log('Fresh product featured_image:', freshProduct.featured_image);
      
      
      let parsedImages = [];
      if (freshProduct.images) {
        if (typeof freshProduct.images === 'string') {
          try {
            parsedImages = JSON.parse(freshProduct.images);
          } catch (e) {
            parsedImages = [];
          }
        } else if (Array.isArray(freshProduct.images)) {
          parsedImages = freshProduct.images;
        }
      }
      
      
      let accountUsername = '';
      let accountPassword = '';
      if (freshProduct.account_info) {
        const accountInfo = freshProduct.account_info;
       
        const usernameMatch = accountInfo.match(/Username:\s*([^,]+)/i);
        const passwordMatch = accountInfo.match(/Password:\s*(.+)/i);
        if (usernameMatch) accountUsername = usernameMatch[1].trim();
        if (passwordMatch) accountPassword = passwordMatch[1].trim();
      }

      setEditingProduct(freshProduct);
      setProductForm({
        game_name: freshProduct.game_name || '',
        account_level: freshProduct.account_level || '',
        price: freshProduct.price || '',
        import_price: freshProduct.import_price || '',
        description: freshProduct.description || '',
        account_info: freshProduct.account_info || '',
        account_username: accountUsername,
        account_password: accountPassword,
        featured_image: freshProduct.featured_image || '',
        images: parsedImages,
        status: freshProduct.status || 'available',
      });
      setShowProductForm(true);
    } catch (error) {
      console.error('Error fetching product for edit:', error);
     
      let parsedImages = [];
      if (product.images) {
        if (typeof product.images === 'string') {
          try {
            parsedImages = JSON.parse(product.images);
          } catch (e) {
            parsedImages = [];
          }
        } else if (Array.isArray(product.images)) {
          parsedImages = product.images;
        }
      }
      
    
      let accountUsername = '';
      let accountPassword = '';
      if (product.account_info) {
        const accountInfo = product.account_info;
        const usernameMatch = accountInfo.match(/Username:\s*([^,]+)/i);
        const passwordMatch = accountInfo.match(/Password:\s*(.+)/i);
        if (usernameMatch) accountUsername = usernameMatch[1].trim();
        if (passwordMatch) accountPassword = passwordMatch[1].trim();
      }

      setEditingProduct(product);
      setProductForm({
        game_name: product.game_name || '',
        account_level: product.account_level || '',
        price: product.price || '',
        import_price: product.import_price || '',
        description: product.description || '',
        account_info: product.account_info || '',
        account_username: accountUsername,
        account_password: accountPassword,
        featured_image: product.featured_image || '',
        images: parsedImages,
        status: product.status || 'available',
      });
      setShowProductForm(true);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await axiosInstance.delete(`/products/${id}`);
        fetchAllData();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Có lỗi xảy ra');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status });
      fetchAllData();
    } catch (error) {
      console.error('Update order error:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleApproveTopup = async (requestId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt yêu cầu nạp tiền này?')) {
      return;
    }
    try {
      console.log('Approving topup request:', requestId);
      const response = await axiosInstance.post(`/wallet/topup-requests/${requestId}/approve`);
      console.log('Approve response:', response.data);
      alert('Đã duyệt yêu cầu nạp tiền thành công!');
      fetchAllData();
    } catch (error) {
      console.error('Approve topup error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      alert('Lỗi: ' + errorMessage);
    }
  };

  const handleRejectTopup = async (requestId) => {
    const notes = window.prompt('Nhập lý do từ chối (nếu có):');
    if (notes === null) return;
    try {
      await axiosInstance.post(`/wallet/topup-requests/${requestId}/reject`, { notes });
      alert('Đã từ chối yêu cầu nạp tiền');
      fetchAllData();
    } catch (error) {
      console.error('Reject topup error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
      alert('Lỗi: ' + errorMessage);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user',
      balance: user.balance || 0,
      customer_code: user.customer_code || '',
    });
    setShowUserForm(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        username: userForm.username ? userForm.username.trim() : '',
        email: userForm.email ? userForm.email.trim() : '',
        role: userForm.role || 'user',
        balance: userForm.balance ? (typeof userForm.balance === 'string' ? parseFloat(userForm.balance) : userForm.balance) : 0,
        customer_code: userForm.customer_code ? userForm.customer_code.trim() : null,
      };

      if (!submitData.username || !submitData.email) {
        alert('Vui lòng nhập đầy đủ username và email');
        return;
      }

      if (editingUser) {
        console.log('Updating user:', editingUser.id, submitData);
        const response = await axiosInstance.put(`/admin/users/${editingUser.id}`, submitData);
        console.log('Update user response:', response.data);
        alert('Đã cập nhật thông tin người dùng thành công!');
      }
      
      setShowUserForm(false);
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        role: 'user',
        balance: '',
        customer_code: '',
      });
      fetchAllData();
    } catch (error) {
      console.error('Submit user error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      alert('Lỗi: ' + errorMessage);
    }
  };

  const handleAddImage = () => {
    setProductForm({
      ...productForm,
      images: [...productForm.images, '']
    });
  };

  const handleRemoveImage = (index) => {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_, i) => i !== index)
    });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm({
      ...productForm,
      images: newImages
    });
  };

  if (initializing) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Sản phẩm', icon: '🎮' },
    { id: 'orders', label: 'Đơn hàng', icon: '📦' },
    { id: 'users', label: 'Người dùng', icon: '👥' },
  ];

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Trang Admin</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="admin-info">
              <p>👤 {user?.username}</p>
              <p className="admin-role">Administrator</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeSection === 'dashboard' && '📊 Dashboard'}
            {activeSection === 'products' && '🎮 Quản lý Sản phẩm'}
            {activeSection === 'orders' && '📦 Quản lý Đơn hàng'}
            {activeSection === 'users' && '👥 Quản lý Người dùng'}
          </h1>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>
              {/* Dashboard */}
              {activeSection === 'dashboard' && (
                <div className="dashboard">
                  <div className="stats-grid">
                    <div className="stat-card stat-primary">
                      <div className="stat-icon">👥</div>
                      <div className="stat-content">
                        <h3>Tổng người dùng</h3>
                        <p className="stat-value">{stats.totalUsers || 0}</p>
                      </div>
                    </div>
                    <div className="stat-card stat-success">
                      <div className="stat-icon">🎮</div>
                      <div className="stat-content">
                        <h3>Tổng sản phẩm</h3>
                        <p className="stat-value">{stats.totalProducts || 0}</p>
                      </div>
                    </div>
                    <div className="stat-card stat-warning">
                      <div className="stat-icon">📦</div>
                      <div className="stat-content">
                        <h3>Tổng đơn hàng</h3>
                        <p className="stat-value">{stats.totalOrders || 0}</p>
                      </div>
                    </div>
                    <div className="stat-card stat-danger">
                      <div className="stat-icon">💰</div>
                      <div className="stat-content">
                        <h3>Doanh thu</h3>
                        <p className="stat-value">
                          {formatPrice(stats.totalRevenue || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="stat-card stat-primary">
                      <div className="stat-icon">📉</div>
                      <div className="stat-content">
                        <h3>Tổng giá vốn</h3>
                        <p className="stat-value">
                          {formatPrice(stats.totalImportCost || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="stat-card stat-success">
                      <div className="stat-icon">💹</div>
                      <div className="stat-content">
                        <h3>Lợi nhuận</h3>
                        <p className="stat-value">
                          {formatPrice(stats.totalProfit || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-charts">
                    <div className="chart-card">
                      <h3>Thống kê nhanh</h3>
                      <div className="quick-stats">
                        <div className="quick-stat-item">
                          <span className="quick-stat-label">Đơn hàng đang chờ:</span>
                          <span className="quick-stat-value">
                            {orders.filter(o => o.status === 'pending').length}
                          </span>
                        </div>
                        <div className="quick-stat-item">
                          <span className="quick-stat-label">Đơn hàng hoàn thành:</span>
                          <span className="quick-stat-value">
                            {orders.filter(o => o.status === 'completed').length}
                          </span>
                        </div>
                        <div className="quick-stat-item">
                          <span className="quick-stat-label">Sản phẩm có sẵn:</span>
                          <span className="quick-stat-value">
                            {products.filter(p => p.status === 'available').length}
                          </span>
                        </div>
                        <div className="quick-stat-item">
                          <span className="quick-stat-label">Sản phẩm đã bán:</span>
                          <span className="quick-stat-value">
                            {products.filter(p => p.status === 'sold').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products */}
              {activeSection === 'products' && (
                <div className="section-content">
                  <div className="section-header">
                    <button
                      onClick={() => {
                        setShowProductForm(true);
                        setEditingProduct(null);
                        setProductForm({
                          game_name: '',
                          account_level: '',
                          price: '',
                          description: '',
                          account_info: '',
                          account_username: '',
                          account_password: '',
                          featured_image: '',
                          images: [],
                          status: 'available',
                        });
                      }}
                      className="btn btn-primary"
                    >
                      + Thêm sản phẩm
                    </button>
                  </div>

                  {/* Search Box for Products */}
                  <div className="admin-search-box">
                    <input
                      type="text"
                      placeholder="🔍 Tìm kiếm theo ID, tên game..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="admin-search-input"
                    />
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch('')}
                        className="admin-search-clear"
                        title="Xóa tìm kiếm"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showProductForm && (
                    <div className="modal">
                      <div className="modal-content">
                        <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                        <form onSubmit={handleProductSubmit}>
                          <div className="form-group">
                            <label>Tên game</label>
                            <select
                              value={productForm.game_name}
                              onChange={(e) =>
                                setProductForm({ ...productForm, game_name: e.target.value })
                              }
                              required
                            >
                              <option value="">-- Chọn game --</option>
                              {allowedGames.map((game) => (
                                <option key={game} value={game}>
                                  {game}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Rank</label>
                            <input
                              type="text"
                              value={productForm.account_level}
                              onChange={(e) =>
                                setProductForm({ ...productForm, account_level: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Giá (VNĐ)</label>
                            <input
                              type="number"
                              value={productForm.price}
                              onChange={(e) =>
                                setProductForm({ ...productForm, price: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Giá nhập (VNĐ)</label>
                            <input
                              type="number"
                              value={productForm.import_price}
                              onChange={(e) =>
                                setProductForm({ ...productForm, import_price: e.target.value })
                              }
                              min="0"
                            />
                            <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                              Không bắt buộc. Đây là giá vốn để bạn theo dõi lợi nhuận (không hiển thị cho khách).
                            </small>
                          </div>
                          <div className="form-group">
                            <label>Mô tả</label>
                            <textarea
                              value={productForm.description}
                              onChange={(e) =>
                                setProductForm({ ...productForm, description: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Thông tin tài khoản</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#555' }}>
                                  Tài khoản (Username)
                                </label>
                                <input
                                  type="text"
                                  value={productForm.account_username}
                                  onChange={(e) =>
                                    setProductForm({ ...productForm, account_username: e.target.value })
                                  }
                                  placeholder="Nhập username"
                                  style={{ width: '100%' }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#555' }}>
                                  Mật khẩu (Password)
                                </label>
                                <input
                                  type="text"
                                  value={productForm.account_password}
                                  onChange={(e) =>
                                    setProductForm({ ...productForm, account_password: e.target.value })
                                  }
                                  placeholder="Nhập password"
                                  style={{ width: '100%' }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Ảnh đại diện (URL)</label>
                            <input
                              type="url"
                              value={productForm.featured_image}
                              onChange={(e) =>
                                setProductForm({ ...productForm, featured_image: e.target.value })
                              }
                              placeholder="Nhập URL ảnh đại diện cho thẻ sản phẩm"
                            />
                            <small style={{ color: '#7f8c8d', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                              Ảnh này sẽ hiển thị trên thẻ sản phẩm. Để trống sẽ dùng gradient mặc định.
                            </small>
                            {productForm.featured_image && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <img 
                                  src={productForm.featured_image} 
                                  alt="Preview" 
                                  style={{ 
                                    maxWidth: '200px', 
                                    maxHeight: '150px', 
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="form-group">
                            <label>
                              Ảnh sản phẩm (URL) - Chi tiết
                              <button
                                type="button"
                                onClick={handleAddImage}
                                className="btn btn-secondary btn-small"
                                style={{ marginLeft: '1rem' }}
                              >
                                + Thêm ảnh
                              </button>
                            </label>
                            {productForm.images.map((image, index) => (
                              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                  type="text"
                                  value={image}
                                  onChange={(e) => handleImageChange(index, e.target.value)}
                                  placeholder="Nhập URL ảnh"
                                  style={{ flex: 1 }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="btn btn-danger btn-small"
                                >
                                  Xóa
                                </button>
                              </div>
                            ))}
                            {productForm.images.length === 0 && (
                              <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                                Chưa có ảnh nào. Nhấn "Thêm ảnh" để thêm.
                              </p>
                            )}
                          </div>
                          <div className="form-group">
                            <label>Trạng thái</label>
                            <select
                              value={productForm.status}
                              onChange={(e) =>
                                setProductForm({ ...productForm, status: e.target.value })
                              }
                            >
                              <option value="available">Có sẵn</option>
                              <option value="sold">Đã bán</option>
                              <option value="pending">Đang chờ</option>
                            </select>
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                              {editingProduct ? 'Cập nhật' : 'Thêm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowProductForm(false);
                                setEditingProduct(null);
                              }}
                              className="btn btn-secondary"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên game</th>
                          <th>Rank</th>
                          <th>Giá</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products
                          .filter((product) => {
                            // Chỉ hiển thị sản phẩm còn có sẵn
                            if (product.status !== 'available') return false;

                            if (!productSearch.trim()) return true;
                            const searchTerm = productSearch.toLowerCase();
                            return (
                              product.id.toString().includes(searchTerm) ||
                              product.game_name?.toLowerCase().includes(searchTerm) ||
                              product.account_level?.toLowerCase().includes(searchTerm)
                            );
                          })
                          .map((product) => (
                          <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.game_name}</td>
                            <td>{product.account_level}</td>
                            <td>{formatPrice(product.price)}</td>
                            <td>
                              <span className={`status-badge status-${product.status}`}>
                                {product.status === 'available' && 'Có sẵn'}
                                {product.status === 'sold' && 'Đã bán'}
                                {product.status === 'pending' && 'Đang chờ'}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="btn btn-sm btn-secondary"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="btn btn-sm btn-danger"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeSection === 'orders' && (
                <div className="section-content">
                  {/* Search Box for Orders */}
                  <div className="admin-search-box" style={{ marginBottom: '20px' }}>
                    <input
                      type="text"
                      placeholder="🔍 Tìm kiếm theo ID, tên game, username, email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="admin-search-input"
                    />
                    {orderSearch && (
                      <button
                        onClick={() => setOrderSearch('')}
                        className="admin-search-clear"
                        title="Xóa tìm kiếm"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Game</th>
                          <th>Người mua</th>
                          <th>Giá</th>
                          <th>Ngày đặt</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders
                          .filter((order) => {
                            if (!orderSearch.trim()) return true;
                            const searchTerm = orderSearch.toLowerCase();
                            return (
                              order.id.toString().includes(searchTerm) ||
                              order.game_name?.toLowerCase().includes(searchTerm) ||
                              order.username?.toLowerCase().includes(searchTerm) ||
                              order.email?.toLowerCase().includes(searchTerm)
                            );
                          })
                          .map((order) => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.game_name}</td>
                            <td>
                              <div>
                                <div>{order.username}</div>
                                <small>{order.email}</small>
                              </div>
                            </td>
                            <td>{formatPrice(order.total_price)}</td>
                            <td>{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                            <td>
                              <span className={`status-badge status-${order.status}`}>
                                {order.status === 'pending' && 'Đang chờ'}
                                {order.status === 'completed' && 'Hoàn thành'}
                                {order.status === 'cancelled' && 'Đã hủy'}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                  className="btn btn-sm btn-success"
                                  disabled={order.status === 'completed'}
                                >
                                  Hoàn thành
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  className="btn btn-sm btn-danger"
                                  disabled={order.status === 'cancelled'}
                                >
                                  Hủy
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users */}
              {activeSection === 'users' && (
                <div className="section-content">
                  {/* Top-up Requests Section */}
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '20px', color: '#333' }}>💰 Yêu cầu nạp tiền</h2>
                    
                    {/* Search Box for Top-up Requests */}
                    <div className="admin-search-box" style={{ marginBottom: '20px' }}>
                      <input
                        type="text"
                        placeholder="🔍 Tìm kiếm theo ID, username, email, mã KH, số tiền..."
                        value={topupSearch}
                        onChange={(e) => setTopupSearch(e.target.value)}
                        className="admin-search-input"
                      />
                      {topupSearch && (
                        <button
                          onClick={() => setTopupSearch('')}
                          className="admin-search-clear"
                          title="Xóa tìm kiếm"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Khách hàng</th>
                            <th>Mã KH</th>
                            <th>Số tiền</th>
                            <th>Ngày yêu cầu</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filteredRequests = topupRequests.filter((request) => {
                              if (!topupSearch.trim()) return true;
                              const searchTerm = topupSearch.toLowerCase();
                              return (
                                request.id.toString().includes(searchTerm) ||
                                request.username?.toLowerCase().includes(searchTerm) ||
                                request.email?.toLowerCase().includes(searchTerm) ||
                                request.customer_code?.toLowerCase().includes(searchTerm) ||
                                request.amount?.toString().includes(searchTerm) ||
                                request.status?.toLowerCase().includes(searchTerm)
                              );
                            });

                            if (filteredRequests.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                    {topupSearch.trim() ? 'Không tìm thấy yêu cầu nạp tiền nào' : 'Không có yêu cầu nạp tiền nào'}
                                  </td>
                                </tr>
                              );
                            }

                            return filteredRequests.map((request) => (
                              <tr key={request.id}>
                                <td>{request.id}</td>
                                <td>
                                  <div>
                                    <div>{request.username}</div>
                                    <small style={{ color: '#666' }}>{request.email}</small>
                                  </div>
                                </td>
                                <td>
                                  <code style={{ 
                                    background: '#f0f0f0', 
                                    padding: '4px 8px', 
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                  }}>
                                    {request.customer_code}
                                  </code>
                                </td>
                                <td>{formatPrice(request.amount)}</td>
                                <td>{new Date(request.created_at).toLocaleString('vi-VN')}</td>
                                <td>
                                  <span className={`status-badge status-${request.status}`}>
                                    {request.status === 'pending' && '⏳ Chờ duyệt'}
                                    {request.status === 'approved' && '✅ Đã duyệt'}
                                    {request.status === 'rejected' && '❌ Đã từ chối'}
                                  </span>
                                </td>
                                <td>
                                  <div className="table-actions">
                                    {request.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleApproveTopup(request.id)}
                                          className="btn btn-sm btn-success"
                                        >
                                          Duyệt nạp tiền
                                        </button>
                                        <button
                                          onClick={() => handleRejectTopup(request.id)}
                                          className="btn btn-sm btn-danger"
                                        >
                                          Từ chối
                                        </button>
                                      </>
                                    )}
                                    {request.status === 'approved' && (
                                      <span style={{ color: '#28a745', fontSize: '0.9rem' }}>
                                        Đã duyệt {request.approved_at && new Date(request.approved_at).toLocaleString('vi-VN')}
                                      </span>
                                    )}
                                    {request.status === 'rejected' && (
                                      <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>
                                        Đã từ chối
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Users List */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0, color: '#333' }}>👥 Danh sách người dùng</h2>
                    </div>

                    {/* Search Box for Users */}
                    <div className="admin-search-box" style={{ marginBottom: '20px' }}>
                      <input
                        type="text"
                        placeholder="🔍 Tìm kiếm theo ID, username, email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="admin-search-input"
                      />
                      {userSearch && (
                        <button
                          onClick={() => setUserSearch('')}
                          className="admin-search-clear"
                          title="Xóa tìm kiếm"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {showUserForm && (
                      <div className="modal">
                        <div className="modal-content">
                          <h2>{editingUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng'}</h2>
                          <form onSubmit={handleUserSubmit}>
                            <div className="form-group">
                              <label>Username</label>
                              <input
                                type="text"
                                value={userForm.username}
                                onChange={(e) =>
                                  setUserForm({ ...userForm, username: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Email</label>
                              <input
                                type="email"
                                value={userForm.email}
                                onChange={(e) =>
                                  setUserForm({ ...userForm, email: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Vai trò</label>
                              <select
                                value={userForm.role}
                                onChange={(e) =>
                                  setUserForm({ ...userForm, role: e.target.value })
                                }
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Số dư (₫)</label>
                              <input
                                type="number"
                                value={userForm.balance}
                                onChange={(e) =>
                                  setUserForm({ ...userForm, balance: e.target.value })
                                }
                                min="0"
                                step="1000"
                              />
                            </div>
                            <div className="form-group">
                              <label>Mã khách hàng</label>
                              <input
                                type="text"
                                value={userForm.customer_code}
                                onChange={(e) =>
                                  setUserForm({ ...userForm, customer_code: e.target.value })
                                }
                                placeholder="Để trống để tự động tạo"
                              />
                            </div>
                            <div className="form-actions">
                              <button type="submit" className="btn btn-primary">
                                {editingUser ? 'Cập nhật' : 'Thêm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowUserForm(false);
                                  setEditingUser(null);
                                  setUserForm({
                                    username: '',
                                    email: '',
                                    role: 'user',
                                    balance: '',
                                    customer_code: '',
                                  });
                                }}
                                className="btn btn-secondary"
                              >
                                Hủy
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Mã KH</th>
                            <th>Số dư</th>
                            <th>Vai trò</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter((user) => {
                              if (!userSearch.trim()) return true;
                              const searchTerm = userSearch.toLowerCase();
                              return (
                                user.id.toString().includes(searchTerm) ||
                                user.username?.toLowerCase().includes(searchTerm) ||
                                user.email?.toLowerCase().includes(searchTerm) ||
                                user.customer_code?.toLowerCase().includes(searchTerm)
                              );
                            })
                            .map((user) => (
                            <tr key={user.id}>
                              <td>{user.id}</td>
                              <td>{user.username}</td>
                              <td>{user.email}</td>
                              <td>
                                {user.customer_code ? (
                                  <code style={{ 
                                    background: '#f0f0f0', 
                                    padding: '4px 8px', 
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                  }}>
                                    {user.customer_code}
                                  </code>
                                ) : (
                                  <span style={{ color: '#999' }}>Chưa có</span>
                                )}
                              </td>
                              <td>{formatPrice(user.balance || 0)}</td>
                              <td>
                                <span className={`status-badge ${user.role === 'admin' ? 'status-admin' : 'status-user'}`}>
                                  {user.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td>{new Date(user.created_at).toLocaleString('vi-VN')}</td>
                              <td>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="btn btn-sm btn-secondary"
                                >
                                  Sửa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
