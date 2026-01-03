// routes/page.js (chỉnh sửa để bỏ auth cho admin)

const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const authController = require("../controllers/authController");
const adminController = require('../controllers/adminController');
const commentController = require('../controllers/commentController');
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
  const topic = req.params.name.toLowerCase();
  console.log(`Accessing topic: ${topic}, Original param: ${req.params.name}`); // Log để check param và topic sau lower

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

    return res.render(`topic`, {
      currentTopic: topic,
      user: req.session.user,
      videos: result.rows
    });
  } catch (err) {
    console.error(`Error fetching videos for topic ${topic}:`, err.stack); // Log lỗi chi tiết với stack trace
    return res.render(`topic`, {
      currentTopic: topic,
      user: req.session.user,
      videos: []
    });
  }
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

router.post("/complete-tutorial", (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });
  pool.query('UPDATE users SET tutorial_completed = true WHERE id = $1', [req.session.user.id])
    .then(() => {
      req.session.user.tutorial_completed = true;
      res.json({ success: true });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ success: false });
    });
});

/* ======================
   Comments
====================== */
router.get("/comments/:videoId", commentController.getComments);
router.post("/comments/:videoId", commentController.postComment);

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