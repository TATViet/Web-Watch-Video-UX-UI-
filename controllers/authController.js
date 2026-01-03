const bcrypt = require("bcrypt");
const { appPool } = require("../config/db");

exports.register = async (req, res) => {
  try {
    const { display_name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await appPool.query(
      "INSERT INTO users(display_name, email, password_hash, created_at) VALUES($1,$2,$3,$4)",
      [display_name, email, hash, new Date().toISOString()]
    );

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.redirect("/register?error=email_exists");
    }
    res.status(500).send("Lỗi máy chủ");
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let query;
    let params;
    if (username.includes('@')) {
      query = "SELECT * FROM users WHERE email = $1";
      params = [username];
    } else {
      query = "SELECT * FROM users WHERE display_name = $1";
      params = [username];
    }

    const result = await appPool.query(query, params);

    if (result.rows.length === 0) {
      return res.redirect("/login?error=invalid_credentials");
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.redirect("/login?error=invalid_credentials");
    }

    // Trong exports.login
  req.session.user = {
      id: user.id,
      name: user.display_name,
      email: user.email,  // Thêm email
      tutorial_completed: user.tutorial_completed || false,
      created_at: user.created_at
    };
    res.redirect("/");
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send("Lỗi máy chủ");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send("Lỗi đăng xuất");
    }
    res.redirect("/");
  });
};


// Confirm password trước edit
exports.confirmEdit = async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  if (req.method === 'GET') {
    // Giữ cho compatibility nếu cần, nhưng không dùng
    return res.render("account", { mode: 'confirm', error: null, user: req.session.user });
  }

  try {
    const { password } = req.body;
    const result = await appPool.query("SELECT password_hash FROM users WHERE id = $1", [req.session.user.id]);
    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.json({ success: false });
    }

    req.session.allowEdit = true;  // Flag cho phép edit
    res.json({ success: true });
  } catch (err) {
    console.error('Confirm edit error:', err);
    res.status(500).json({ success: false });
  }
};

// Edit profile
exports.editProfile = async (req, res) => {
  if (!req.session.user || !req.session.allowEdit) return res.json({ success: false });

  if (req.method === 'GET') {
    // Giữ cho compatibility
    return res.render("account", { mode: 'edit', user: req.session.user, success: false });
  }

  try {
    const { display_name, email, new_password } = req.body;
    let query = "UPDATE users SET ";
    let params = [];
    let index = 1;

    if (display_name) {
      query += `display_name = $${index++}, `;
      params.push(display_name);
      req.session.user.name = display_name;
    }
    if (email) {
      query += `email = $${index++}, `;
      params.push(email);
      req.session.user.email = email;
    }
    if (new_password) {
      const hash = await bcrypt.hash(new_password, 10);
      query += `password_hash = $${index++}, `;
      params.push(hash);
    }

    if (params.length === 0) {
      return res.json({ success: false });
    }

    query = query.slice(0, -2) + ` WHERE id = $${index}`;
    params.push(req.session.user.id);

    await appPool.query(query, params);

    delete req.session.allowEdit;  // Xóa flag sau edit

    res.json({ success: true });
  } catch (err) {
    console.error('Edit profile error:', err);
    if (err.code === '23505') {  // Duplicate unique
      return res.json({ success: false, error: "Email or name already exists!" });
    }
    res.status(500).json({ success: false });
  }
};