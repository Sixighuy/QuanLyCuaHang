const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {

    const username = await question('Nhập username cho admin: ');
    const email = await question('Nhập email cho admin: ');
    const password = await question('Nhập password cho admin: ');

    if (!username || !email || !password) {
      console.log('❌ Vui lòng nhập đầy đủ thông tin!');
      rl.close();
      return;
    }


    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'game_accounts_db',
    });

    console.log('✅ Đã kết nối database');


    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      console.log('❌ Username hoặc email đã tồn tại!');
      await connection.end();
      rl.close();
      return;
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'admin']
    );

    console.log('✅ Đã tạo tài khoản admin thành công!');
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);

    await connection.end();
    rl.close();
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    rl.close();
    process.exit(1);
  }
}

console.log('=== Tạo tài khoản Admin ===\n');
createAdmin();

