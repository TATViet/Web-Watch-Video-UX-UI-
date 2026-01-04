const { Pool } = require("pg");
// Admin pool (kết nối đến DB "postgres" cho admin tasks)
const adminPool = new Pool({
connectionString: "postgres://owlloop_user:uflgatlmOGErCp2ex3rEtPAbdfjWZCZF@dpg-d545b9h5pdvs73fth0hg-a:5432/postgres",
ssl: { rejectUnauthorized: false }, // Bật SSL cho Render
});
// App pool (kết nối đến DB "owlloop")
const appPool = new Pool({
connectionString: "postgres://owlloop_user:uflgatlmOGErCp2ex3rEtPAbdfjWZCZF@dpg-d545b9h5pdvs73fth0hg-a:5432/owlloop",
ssl: { rejectUnauthorized: false }, // Bật SSL cho Render
});
module.exports = { adminPool, appPool };



// const { Pool } = require("pg");

// // Pool dùng để tạo database (connect vào postgres)
// const adminPool = new Pool({
//   user: "postgres",
//   password: "vietk12+",
//   host: "localhost",
//   port: 5432,
//   database: "postgres"
// });

// // Pool dùng cho app chính
// const appPool = new Pool({
//   user: "postgres",
//   password: "vietk12+",
//   host: "localhost",
//   port: 5432,
//   database: "owlloop"
// });

// module.exports = { adminPool, appPool };
