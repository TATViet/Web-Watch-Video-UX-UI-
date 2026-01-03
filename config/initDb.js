const { adminPool, appPool } = require("./db");

async function initDatabase() {
  try {
    // 1. Check database tồn tại chưa
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'owlloop'"
    );
    if (dbCheck.rowCount === 0) {
      console.log("📦 Database owlloop chưa tồn tại → đang tạo...");
      await adminPool.query(`CREATE DATABASE owlloop`);
      console.log("✅ Đã tạo database owlloop");
    } else {
      console.log("✅ Database owlloop đã tồn tại");
    }

    // 2. Tạo bảng users nếu chưa có
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        display_name VARCHAR(100),
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tutorial_completed BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("✅ Table users sẵn sàng");

    // Thêm cột nếu chưa có (cho db đã tồn tại)
    await appPool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT FALSE;
    `);

    // Set TRUE cho user cũ (nếu cột mới, set TRUE cho existing để không hiện tutorial)
    await appPool.query(`
      UPDATE users SET tutorial_completed = TRUE WHERE tutorial_completed IS NULL;
    `);

    // 3. Tạo bảng videos nếu chưa có (với topics là array)
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        channel TEXT,
        topics TEXT[],  -- Array để lưu nhiều tag
        duration TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table videos sẵn sàng");

    // 4. Tạo bảng comments nếu chưa có
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table comments sẵn sàng");

  } catch (err) {
    console.error("❌ Init DB error:", err);
  }
}

module.exports = initDatabase;