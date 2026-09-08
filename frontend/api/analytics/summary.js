// frontend/api/analytics/summary.js
const { getSql } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT event, COUNT(*)::int AS count
      FROM events
      GROUP BY event
    `;
    const events = {};
    for (const row of rows) events[row.event] = row.count;
    return res.status(200).json({ events });
  } catch (err) {
    console.error('analytics/summary query failed:', err);
    return res.status(500).json({ error: 'Could not load summary' });
  }
};
