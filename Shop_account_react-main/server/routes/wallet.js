const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/balance', auth, async (req, res) => {
  try {
    const [users] = await db.query('SELECT balance FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ balance: users[0].balance || 0 });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/topup-request', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Số tiền nạp phải lớn hơn 0' });
    }
    
    if (amount < 10000) {
      return res.status(400).json({ message: 'Số tiền nạp tối thiểu là 10.000 ₫' });
    }
    
    if (amount > 100000000) {
      return res.status(400).json({ message: 'Số tiền nạp tối đa là 100.000.000 ₫' });
    }
    

    const [users] = await db.query('SELECT customer_code FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const customerCode = users[0].customer_code;
    
    if (!customerCode) {
      return res.status(400).json({ message: 'Không tìm thấy mã khách hàng' });
    }
    

    const [result] = await db.query(
      'INSERT INTO topup_requests (user_id, amount, customer_code, status) VALUES (?, ?, ?, ?)',
      [req.user.id, parseFloat(amount), customerCode, 'pending']
    );
    
    res.json({ 
      message: 'Yêu cầu nạp tiền đã được tạo',
      request_id: result.insertId,
      amount: parseFloat(amount),
      customer_code: customerCode
    });
  } catch (error) {
    console.error('Create top-up request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/topup-requests', auth, async (req, res) => {
  try {
    const [requests] = await db.query(
      'SELECT * FROM topup_requests WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(requests);
  } catch (error) {
    console.error('Get top-up requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/topup-requests/:id/approve', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notes = req.body?.notes || null;
    
    console.log('Approve request - ID:', id, 'User:', req.user, 'Body:', req.body);
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    if (!req.user || !req.user.id) {
      console.error('User not authenticated:', req.user);
      return res.status(401).json({ message: 'Không xác thực được người dùng' });
    }

    const [requests] = await db.query('SELECT * FROM topup_requests WHERE id = ?', [parseInt(id)]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Yêu cầu nạp tiền không tồn tại' });
    }
    
    const request = requests[0];
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý' });
    }

    await db.query(
      'UPDATE topup_requests SET status = ?, approved_at = NOW(), approved_by = ?, notes = ? WHERE id = ?',
      ['approved', req.user.id, notes || null, parseInt(id)]
    );

    const [users] = await db.query('SELECT balance FROM users WHERE id = ?', [request.user_id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    const currentBalance = parseFloat(users[0].balance) || 0;
    const newBalance = currentBalance + parseFloat(request.amount);
    
    await db.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, request.user_id]);
    
    res.json({ 
      message: 'Đã duyệt yêu cầu nạp tiền',
      new_balance: newBalance
    });
  } catch (error) {
    console.error('Approve top-up request error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/topup-requests/:id/reject', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notes = req.body?.notes || null;
    
    console.log('Reject request - ID:', id, 'User:', req.user, 'Body:', req.body);
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    if (!req.user || !req.user.id) {
      console.error('User not authenticated:', req.user);
      return res.status(401).json({ message: 'Không xác thực được người dùng' });
    }
    

    const [requests] = await db.query('SELECT * FROM topup_requests WHERE id = ?', [parseInt(id)]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Yêu cầu nạp tiền không tồn tại' });
    }
    
    const request = requests[0];
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý' });
    }
    

    await db.query(
      'UPDATE topup_requests SET status = ?, approved_at = NOW(), approved_by = ?, notes = ? WHERE id = ?',
      ['rejected', req.user.id, notes, parseInt(id)]
    );
    
    res.json({ message: 'Đã từ chối yêu cầu nạp tiền' });
  } catch (error) {
    console.error('Reject top-up request error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

