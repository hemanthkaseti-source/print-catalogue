// frontend/api/analytics/events.js
const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, meta } = req.body || {};
  if (!event || typeof event !== 'string') {
    return res.status(400).json({ error: 'event is required' });
  }

  try {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO events (event, meta)
      VALUES (${event}, ${JSON.stringify(meta || {})}::jsonb)
      RETURNING id, event, meta, created_at
    `;
    return res.status(201).json(rows[0]);
  } catch (err) {
    // Never let an analytics hiccup surface to the visitor — log and
    // return a soft 200, matching trackEvent()'s .catch(() => null) on the frontend.
    console.error('analytics/events insert failed:', err);
    return res.status(200).json({ ok: false });
  }
};
