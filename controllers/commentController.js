const { appPool: pool } = require('../config/db');

exports.getComments = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const result = await pool.query(`
      SELECT c.*, u.display_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.video_id = $1 
      ORDER BY c.created_at DESC
    `, [videoId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.postComment = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Login required' });
  }

  try {
    const { content } = req.body;
    if (!content.trim()) {
      return res.status(400).json({ error: 'Content required' });
    }

    const videoId = req.params.videoId;
    await pool.query(
      'INSERT INTO comments(video_id, user_id, content) VALUES($1, $2, $3)',
      [videoId, req.session.user.id, content]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Post comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};