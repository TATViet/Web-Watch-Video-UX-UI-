const { Pool } = require("pg");

// Admin pool (kết nối đến DB "postgres" cho admin tasks)
const adminPool = new Pool({
  connectionString: process.env.ADMIN_DB_URL || "postgres://postgres:vietk12+@localhost:5432/postgres",
  ssl: process.env.ADMIN_DB_URL ? { rejectUnauthorized: false } : false,  // Bật SSL cho cloud/remote
});

// App pool (kết nối đến DB "owlloop")
const appPool = new Pool({
  connectionString: process.env.APP_DB_URL || "postgres://postgres:vietk12+@localhost:5432/owlloop",
  ssl: process.env.APP_DB_URL ? { rejectUnauthorized: false } : false,
});

module.exports = { adminPool, appPool };
