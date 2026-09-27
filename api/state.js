// Starfield state API — single JSONB row in Neon holding { repos, lists, metrics, lastSync }.
// GET  -> returns the stored state (or null if nothing has been saved yet)
// POST -> upserts the entire state blob (mirrors the app's old "write whole object" localStorage semantics)
//
// Requires DATABASE_URL to be set as an environment variable on the Vercel project,
// pointing at the "Starfield" Neon project (pooled connection string).

const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
    if (!process.env.DATABASE_URL) {
          res.status(500).json({ error: 'DATABASE_URL is not configured on this deployment.' });
          return;
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
          if (req.method === 'GET') {
                  const rows = await sql`SELECT data FROM starfield_state WHERE id = 1`;
                  res.setHeader('Cache-Control', 'no-store');
                  res.status(200).json(rows.length ? rows[0].data : null);
                  return;
          }

      if (req.method === 'POST') {
              let body = req.body;
              if (typeof body === 'string') {
                        try { body = JSON.parse(body); } catch { body = null; }
              }
              if (!body || typeof body !== 'object' || !Array.isArray(body.repos)) {
                        res.status(400).json({ error: 'Invalid state payload — expected an object with a "repos" array.' });
                        return;
              }

            await sql`
                    INSERT INTO starfield_state (id, data, updated_at)
                            VALUES (1, ${JSON.stringify(body)}::jsonb, now())
                                    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
                                          `;
              res.status(200).json({ ok: true });
              return;
      }

      res.setHeader('Allow', 'GET, POST');
          res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
          console.error('starfield_state error:', err);
          res.status(500).json({ error: 'Database error', detail: String((err && err.message) || err) });
    }
};
