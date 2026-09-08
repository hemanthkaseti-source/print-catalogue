// frontend/api/_db.js
const { neon } = require('@neondatabase/serverless');

// Lazy singleton: neon() throws if DATABASE_URL isn't set yet, and this file
// is required by every function — calling neon() at module load time would
// crash any build/cold-start that happens before the Neon integration is
// provisioned. Deferring the call until a request actually needs it avoids that.
let _sql = null;

function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

module.exports = { getSql };
