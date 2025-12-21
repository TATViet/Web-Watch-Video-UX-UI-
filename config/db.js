const { Pool } = require("pg");

// Pool dùng để tạo database (connect vào postgres)
const adminPool = new Pool({
  user: "postgres",
  password: "vietk12+",
  host: "localhost",
  port: 5432,
  database: "postgres"
});

// Pool dùng cho app chính
const appPool = new Pool({
  user: "postgres",
  password: "vietk12+",
  host: "localhost",
  port: 5432,
  database: "owlloop"
});

module.exports = { adminPool, appPool };
