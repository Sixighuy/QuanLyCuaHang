const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');


router.get('/', async (req, res) => {
  try {

    const token = req.header('Authorization')?.replace('Bearer ', '');
    let isAdmin = false;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
        isAdmin = decoded.role === 'admin';
      } catch (e) {

      }
    }

    let query = 'SELECT * FROM products';
    let params = [];
    
    if (!isAdmin) {
      query += ' WHERE status = ?';
      params.push('available');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [products] = await db.query(query, params);
    
    const productsWithImages = products.map(product => {
      if (product.images) {
        try {
          product.images = JSON.parse(product.images);
        } catch (e) {
          product.images = [];
        }
      } else {
        product.images = [];
      }

      if (!product.hasOwnProperty('featured_image')) {
        product.featured_image = null;
      }

      if (!isAdmin) {
        delete product.account_info;
        delete product.import_price;
      }
      return product;
    });
    res.json(productsWithImages);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];

    if (product.images) {
      try {
        product.images = JSON.parse(product.images);
      } catch (e) {
        product.images = [];
      }
    } else {
      product.images = [];
    }

    if (!product.hasOwnProperty('featured_image')) {
      product.featured_image = null;
    }
    

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
        if (decoded.role !== 'admin') {
          delete product.account_info;
          delete product.import_price;
        }
      } catch (e) {

        delete product.account_info;
        delete product.import_price;
      }
    } else {

      delete product.account_info;
      delete product.import_price;
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Create product request:', req.body);
    console.log('User:', req.user);
    const { game_name, account_level, price, import_price, description, account_info, featured_image, images } = req.body;

    if (!game_name || game_name.trim() === '') {
      return res.status(400).json({ message: 'Vui lòng nhập tên game' });
    }

    if (!price) {
      return res.status(400).json({ message: 'Vui lòng nhập giá' });
    }

    const priceNum = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'Giá phải là số dương hợp lệ' });
    }

    let importPriceNum = 0;
    if (import_price !== undefined && import_price !== null && import_price !== '') {
      importPriceNum = typeof import_price === 'string' ? parseFloat(import_price) : Number(import_price);
      if (isNaN(importPriceNum) || importPriceNum < 0) {
        return res.status(400).json({ message: 'Giá nhập phải là số không âm hợp lệ' });
      }
    }

    let imagesJson = null;
    if (images && Array.isArray(images) && images.length > 0) {
      const filteredImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      if (filteredImages.length > 0) {
        imagesJson = JSON.stringify(filteredImages);
      }
    }

    const gameNameValue = game_name.trim();
    const accountLevelValue = account_level ? account_level.trim() : '';
    const descriptionValue = description ? description.trim() : '';
    const accountInfoValue = account_info ? account_info.trim() : '';
    const featuredImageValue = featured_image && featured_image.trim() ? featured_image.trim() : null;

    const [result] = await db.query(
      'INSERT INTO products (game_name, account_level, import_price, price, description, account_info, featured_image, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [gameNameValue, accountLevelValue, importPriceNum, priceNum, descriptionValue, accountInfoValue, featuredImageValue, imagesJson, 'available']
    );

    const [newProducts] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    
    if (newProducts.length === 0) {
      return res.status(500).json({ message: 'Không thể tạo sản phẩm' });
    }

    const newProduct = newProducts[0];

    if (newProduct.images) {
      try {
        newProduct.images = JSON.parse(newProduct.images);
      } catch (e) {
        newProduct.images = [];
      }
    } else {
      newProduct.images = [];
    }
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log('Update product request:', req.params.id, req.body);
    console.log('User:', req.user);
    const { game_name, account_level, price, import_price, description, account_info, featured_image, status, images } = req.body;

    if (!game_name || !price) {
      return res.status(400).json({ message: 'Please provide game name and price' });
    }

    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }

    let importPriceNum = 0;
    if (import_price !== undefined && import_price !== null && import_price !== '') {
      importPriceNum = typeof import_price === 'string' ? parseFloat(import_price) : import_price;
      if (isNaN(importPriceNum) || importPriceNum < 0) {
        return res.status(400).json({ message: 'Import price must be a valid non-negative number' });
      }
    }

    let imagesJson = null;
    if (images && Array.isArray(images) && images.length > 0) {
      const filteredImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      if (filteredImages.length > 0) {
        imagesJson = JSON.stringify(filteredImages);
      }
    }

    const gameNameValue = game_name ? game_name.trim() : '';
    const accountLevelValue = account_level ? account_level.trim() : '';
    const descriptionValue = description ? description.trim() : '';
    const accountInfoValue = account_info ? account_info.trim() : '';
    const featuredImageValue = featured_image && featured_image.trim() ? featured_image.trim() : null;
    const statusValue = status || 'available';

    await db.query(
      'UPDATE products SET game_name = ?, account_level = ?, import_price = ?, price = ?, description = ?, account_info = ?, featured_image = ?, images = ?, status = ? WHERE id = ?',
      [
        gameNameValue, 
        accountLevelValue,
        importPriceNum,
        priceNum, 
        descriptionValue, 
        accountInfoValue, 
        featuredImageValue,
        imagesJson, 
        statusValue, 
        req.params.id
      ]
    );

    const [updatedProducts] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (updatedProducts.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = updatedProducts[0];

    if (updatedProduct.images) {
      try {
        updatedProduct.images = JSON.parse(updatedProduct.images);
      } catch (e) {
        updatedProduct.images = [];
      }
    } else {
      updatedProduct.images = [];
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

