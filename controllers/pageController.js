const { appPool: pool } = require('../config/db'); // Import appPool nếu chưa có

exports.home = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY id DESC LIMIT 5');
    res.render("home", { user: req.session.user, videos: result.rows });
  } catch (err) {
    console.error('Error fetching videos for home:', err);
    res.render("home", { user: req.session.user, videos: [] });
  }
};

exports.watch = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY id DESC LIMIT 5 OFFSET 10');
    res.render("watch", { user: req.session.user, videos: result.rows });
  } catch (err) {
    console.error('Error fetching videos for watch:', err);
    res.render("watch", { user: req.session.user, videos: [] });
  }
};

exports.watch2 = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY id DESC LIMIT 5 OFFSET 11');
    res.render("watch2", { user: req.session.user, videos: result.rows });
  } catch (err) {
    console.error('Error fetching videos for watch:', err);
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