const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminAuth } = require('../middleware/auth');


router.get('/topup-requests', adminAuth, async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT tr.*, u.username, u.email, u.customer_code 
       FROM topup_requests tr 
       JOIN users u ON tr.user_id = u.id 
       ORDER BY tr.created_at DESC`
    );
    res.json(requests);
  } catch (error) {
    console.error('Get top-up requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, role, customer_code, balance, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM products');
    const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
    const [revenueRows] = await db.query(
      'SELECT SUM(total_price) as total FROM orders WHERE status = ?',
      ['completed']
    );

    const [profitRows] = await db.query(
      `SELECT 
         COALESCE(SUM(p.import_price), 0) AS totalImportCost,
         COALESCE(SUM(o.total_price - p.import_price), 0) AS totalProfit
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.status = 'completed'`
    );

    res.json({
      totalUsers: totalUsers[0].count,
      totalProducts: totalProducts[0].count,
      totalOrders: totalOrders[0].count,
      totalRevenue: revenueRows[0].total || 0,
      totalImportCost: profitRows[0].totalImportCost || 0,
      totalProfit: profitRows[0].totalProfit || 0,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, balance, customer_code } = req.body;

    console.log('Update user - ID:', id, 'User:', req.user, 'Body:', req.body);

    if (!req.user || !req.user.id) {
      console.error('User not authenticated:', req.user);
      return res.status(401).json({ message: 'Không xác thực được người dùng' });
    }

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [parseInt(id)]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username.trim());
    }

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email.trim());
    }

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      updates.push('role = ?');
      values.push(role);
    }

    if (balance !== undefined) {
      const balanceNum = parseFloat(balance);
      if (isNaN(balanceNum) || balanceNum < 0) {
        return res.status(400).json({ message: 'Balance must be a valid non-negative number' });
      }
      updates.push('balance = ?');
      values.push(balanceNum);
    }

    if (customer_code !== undefined) {

      if (customer_code && customer_code !== users[0].customer_code) {
        const [existing] = await db.query('SELECT id FROM users WHERE customer_code = ? AND id != ?', [customer_code, parseInt(id)]);
        if (existing.length > 0) {
          return res.status(400).json({ message: 'Customer code already exists' });
        }
      }
      updates.push('customer_code = ?');
      values.push(customer_code ? customer_code.trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(parseInt(id));


    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedUsers] = await db.query(
      'SELECT id, username, email, role, customer_code, balance, created_at FROM users WHERE id = ?',
      [parseInt(id)]
    );

    res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Update user error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

