const express = require("express");
const session = require("express-session");
const path = require("path");

const initDatabase = require("./config/initDb");

const authRoutes = require("./routes/auth");
const pageRoutes = require("./routes/pages");

const app = express();

// 🔥 INIT DATABASE
initDatabase();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "owl_secret_key",
  resave: false,
  saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views')); // Giả sử set như vậy
console.log('Views directory set to:', app.get('views')); // Log đường dẫn views

// Middleware để log trước mỗi request (tùy chọn, để debug tất cả routes)
app.use((req, res, next) => {
  console.log(`Request: Method=${req.method}, Path=${req.path}, OriginalURL=${req.originalUrl}`);
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);
app.use("/", pageRoutes);

app.listen(3000, () => {
  console.log("🦉 OwlLoop running at http://localhost:3000");
});

