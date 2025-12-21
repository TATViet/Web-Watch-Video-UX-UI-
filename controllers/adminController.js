const { appPool: pool } = require('../config/db'); // Import appPool và rename thành pool

exports.showAdminPage = (req, res) => {
  const success = req.query.success === 'true';
  const error = req.query.error === 'true';
  res.render('admin', { success, error });
};

exports.addVideo = async (req, res) => {
  const { url, title, channel, topics, duration } = req.body;
 
  // Duration giờ là text, lưu nguyên (không parse)
  const videoDuration = duration || ''; // Nếu rỗng thì lưu chuỗi rỗng
 
  // Giả sử topics là array từ form (name="topics[]")
  const topicsArray = Array.isArray(topics) ? topics : (topics ? [topics] : []);
 
  try {
    // Insert vào database (table videos)
    await pool.query(`
      INSERT INTO videos (url, title, channel, topics, duration)
      VALUES ($1, $2, $3, $4, $5)
    `, [url, title, channel, topicsArray, videoDuration]);
   
    res.redirect('/admin?success=true');
  } catch (err) {
    console.error('Error adding video:', err);
    res.redirect('/admin?error=true');
  }
};

// Mới: Lấy danh sách video
exports.listVideos = async (req, res) => {
  const success = req.query.success === 'true';
  const error = req.query.error === 'true';
  
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY created_at DESC');
    const videos = result.rows; // Lấy danh sách video
    res.render('admin2', { videos, success, error });
  } catch (err) {
    console.error('Error listing videos:', err);
    res.render('admin2', { videos: [], error: true });
  }
};

// Mới: Xóa video
exports.deleteVideo = async (req, res) => {
  const { id } = req.body; // Lấy ID từ form POST
  
  try {
    await pool.query('DELETE FROM videos WHERE id = $1', [id]);
    res.redirect('/admin2?success=true');
  } catch (err) {
    console.error('Error deleting video:', err);
    res.redirect('/admin2?error=true');
  }
};