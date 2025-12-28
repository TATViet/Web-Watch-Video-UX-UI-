// routes/page.js (chỉnh sửa để bỏ auth cho admin)

const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const authController = require("../controllers/authController");
const adminController = require('../controllers/adminController');
const { appPool: pool } = require('../config/db');
const fs = require('fs'); // Thêm import fs để check file
const path = require('path'); // Thêm import path

/* ======================
   MAIN PAGES
====================== */
router.get("/", pageController.home);
router.get("/watch/:videoId", pageController.watch);

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("login", { error: req.query.error });
});

router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("register", { error: req.query.error });
});

router.get("/logout", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("logout");
});


/* ======================
   TOPIC PAGES
====================== */
router.get("/topic/:name", async (req, res) => {
  const allow = ["knowledge", "podcast", "asmr"];
  const topic = req.params.name.toLowerCase();
  console.log(`Accessing topic: ${topic}, Original param: ${req.params.name}`); // Log để check param và topic sau lower

  if (allow.includes(topic)) {
    try {
      // Fetch videos chỉ có topic chứa 'knowledge' (hoặc topic tương ứng)
      // Sử dụng unnest để xử lý array text[]
      const result = await pool.query(
        `SELECT * FROM videos
         WHERE EXISTS (
           SELECT 1 FROM unnest(topics) AS elem
           WHERE elem ILIKE $1
         )
         ORDER BY id DESC`,
        [`%${topic}%`]
      );
      console.log(`Fetched ${result.rows.length} videos for topic ${topic}`); // Log số video fetch được

      const viewPath = path.join(__dirname, '../views', `topic/${topic}.ejs`); // Giả sử extension là .ejs, thay nếu khác (pug/hbs)
      console.log(`Attempting to render view: topic/${topic}, Full path: ${viewPath}`); // Log tên view và full path

      if (!fs.existsSync(viewPath)) {
        console.error(`View file not found: ${viewPath}`); // Log nếu file không tồn tại
      }

      return res.render(`topic/${topic}`, {
        currentTopic: topic,
        user: req.session.user,
        videos: result.rows
      });
    } catch (err) {
      console.error(`Error fetching videos for topic ${topic}:`, err.stack); // Log lỗi chi tiết với stack trace
      return res.render(`topic/${topic}`, {
        currentTopic: topic,
        user: req.session.user,
        videos: []
      });
    }
  }
  return res.status(404).render("Topic/developphase");
});
/* ======================
   Account modifiled
====================== */
router.get("/account", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("account", { user: req.session.user });
});

router.get("/account/confirm-edit", authController.confirmEdit);  // GET cho form confirm
router.post("/account/confirm-edit", authController.confirmEdit); // POST confirm

router.get("/account/edit", authController.editProfile);  // GET cho form edit
router.post("/account/edit", authController.editProfile); // POST edit

/* ======================
   Admin actions
====================== */

// Routes cho admin 
router.get('/admin', adminController.showAdminPage);
router.post('/admin/add-video', adminController.addVideo);

// Mới: Routes cho admin2
router.get('/admin2', adminController.listVideos);
router.post('/admin2/delete', adminController.deleteVideo);



/* ======================
   BLOCK .html
====================== */
router.get("/:page.html", (req, res) => {
  res.redirect(`/${req.params.page}`);
});

/* ======================
   GLOBAL 404
====================== */
router.use((req, res) => {
  console.log('Rơi vào global 404 - Method:', req.method, 'Path:', req.path, 'Original URL:', req.originalUrl); // Log để xem request gì bị 404
  res.status(404).render("Topic/developphase");
});





module.exports = router;