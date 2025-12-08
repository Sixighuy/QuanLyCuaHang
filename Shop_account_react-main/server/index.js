const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Khởi tạo kết nối DB (side-effect, không cần dùng trực tiếp ở đây)
require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Cấu hình CORS cho phép gọi từ mobile / domain khác (có thể siết lại ở môi trường production)
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wallet', require('./routes/wallet'));

// Route kiểm tra nhanh trạng thái server
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server - lắng nghe trên mọi interface (0.0.0.0) để truy cập từ thiết bị khác trong mạng
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access from localhost: http://localhost:${PORT}`);
  console.log(`Access from network: http://0.0.0.0:${PORT}`);
});


