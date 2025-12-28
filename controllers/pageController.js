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
  const videoId = req.params.videoId;
  const from = req.query.from || 'home';
  let topic = null;
  if (from.startsWith('topic/')) {
    topic = from.split('topic/')[1].toLowerCase();
  }

  try {
    // Fetch the selected video
    const videoResult = await pool.query('SELECT * FROM videos WHERE id = $1', [videoId]);
    const video = videoResult.rows[0] || null;

    if (!video) {
      return res.status(404).render("Topic/developphase");
    }

    // Fetch the list of videos based on context
    let queryText = 'SELECT * FROM videos ORDER BY id DESC LIMIT 20';
    let queryParams = [];
    if (topic) {
      queryText = `
        SELECT * FROM videos
        WHERE EXISTS (
          SELECT 1 FROM unnest(topics) AS elem
          WHERE elem ILIKE $1
        )
        ORDER BY id DESC LIMIT 20
      `;
      queryParams = [`%${topic}%`];
    }
    const listResult = await pool.query(queryText, queryParams);
    const videos = listResult.rows;

    // Find current index
    const currentIndex = videos.findIndex(v => v.id === parseInt(videoId));
    const prevId = currentIndex > 0 ? videos[currentIndex - 1].id : null;
    const nextId = currentIndex < videos.length - 1 ? videos[currentIndex + 1].id : null;

    // Related videos exclude current
    const relatedVideos = videos.filter(v => v.id !== parseInt(videoId));

    console.log(`Watch: Fetched ${relatedVideos.length} related videos`); // Log số video
    res.render("watch", { user: req.session.user, video, videos: relatedVideos, prevId, nextId });
  } catch (err) {
    console.error('Error fetching videos for watch:', err.stack);
    res.render("watch", { user: req.session.user, video: null, videos: [], prevId: null, nextId: null });
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