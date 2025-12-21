const { appPool: pool } = require('../config/db'); // Import appPool nếu chưa có

exports.home = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY id DESC LIMIT 5');
    console.log(`Home: Fetched ${result.rows.length} videos`); // Log số video
    res.render("home", { user: req.session.user, videos: result.rows });
  } catch (err) {
    console.error('Error fetching videos for home:', err.stack); // Log chi tiết
    res.render("home", { user: req.session.user, videos: [] });
  }
};
exports.watch = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY id DESC LIMIT 5 OFFSET 10');
    console.log(`Watch: Fetched ${result.rows.length} videos`); // Log số video
    res.render("watch", { user: req.session.user, videos: result.rows });
  } catch (err) {
    console.error('Error fetching videos for watch:', err.stack);
    res.render("watch", { user: req.session.user, videos: [] });
  }
};
exports.watch2 = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY id DESC LIMIT 5 OFFSET 11');
    console.log(`Watch2: Fetched ${result.rows.length} videos`); // Log số video
    res.render("watch2", { user: req.session.user, videos: result.rows });
  } catch (err) {
    console.error('Error fetching videos for watch2:', err.stack);
    res.render("watch2", { user: req.session.user, videos: [] });
  }
};
exports.login = (req, res) => {
  res.render("login");
};
exports.register = (req, res) => {
  res.render("register");
};
exports.logout = (req, res) => {
  res.render("logout");
};
