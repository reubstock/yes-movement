const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const sql = (strings, ...values) => {
  let text = '';
  strings.forEach((s, i) => { text += s; if (i < values.length) text += `$${i + 1}`; });
  return pool.query(text, values);
};

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      country TEXT,
      bio TEXT,
      avatar_url TEXT,
      joined_year INT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS summits (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      country TEXT,
      date TEXT,
      time TEXT,
      host_name TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS groups (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,
      country TEXT,
      contact TEXT,
      image TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS actions (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      country TEXT NOT NULL,
      date TEXT,
      image TEXT,
      lat FLOAT,
      lng FLOAT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Add lat/lng columns if they don't exist yet (for existing deployments)
  await pool.query(`ALTER TABLE actions ADD COLUMN IF NOT EXISTS lat FLOAT`);
  await pool.query(`ALTER TABLE actions ADD COLUMN IF NOT EXISTS lng FLOAT`);
  await pool.query(`ALTER TABLE groups  ADD COLUMN IF NOT EXISTS lat FLOAT`);
  await pool.query(`ALTER TABLE groups  ADD COLUMN IF NOT EXISTS lng FLOAT`);
  await pool.query(`ALTER TABLE summits ADD COLUMN IF NOT EXISTS lat FLOAT`);
  await pool.query(`ALTER TABLE summits ADD COLUMN IF NOT EXISTS lng FLOAT`);
  await pool.query(`ALTER TABLE summits ADD COLUMN IF NOT EXISTS image TEXT`);
  await pool.query(`ALTER TABLE summits ADD COLUMN IF NOT EXISTS organizer_email TEXT`);
  await pool.query(`ALTER TABLE groups  ADD COLUMN IF NOT EXISTS organizer_email TEXT`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_members (
      id SERIAL PRIMARY KEY,
      group_id INT NOT NULL,
      name TEXT NOT NULL,
      specialty TEXT,
      description TEXT,
      photo TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Seed members
  const { rows: m } = await sql`SELECT COUNT(*) FROM members`;
  if (parseInt(m[0].count) === 0) {
    await sql`INSERT INTO members (name, location, country, bio, joined_year)
      VALUES ('Reuben Steiger', 'Princeton', 'United States', '', 2025)`;
  }

  // Seed summits
  const { rows: s } = await sql`SELECT COUNT(*) FROM summits`;
  if (parseInt(s[0].count) === 0) {
    await sql`INSERT INTO summits (title, description, location, country, date, time, host_name)
      VALUES ('Inaugural Summit', 'YES Movement summit.', 'Princeton', 'United States', '2026-07-01', '18:00', 'Reuben Steiger')`;
  }

  // Seed groups
  const { rows: g } = await sql`SELECT COUNT(*) FROM groups`;
  if (parseInt(g[0].count) === 0) {
    await sql`INSERT INTO groups (name, description, location, country, contact, image)
      VALUES ('Red Barn Posse', 'YES Movement group based in Petaluma, CA.', 'Petaluma', 'United States', 'Reuben Steiger', '/images/groups/red-barn-posse.jpg')`;
    await sql`INSERT INTO groups (name, description, location, country, contact, image)
      VALUES ('6 to 1', 'A group of environmental ninjas rebooting the planet.', 'Princeton', 'United States', 'Reuben Steiger', '/images/groups/6-to-1.webp')`;
  }

  // Fix any misspelled/malformed action locations and backfill known coords
  await pool.query(`UPDATE actions SET location = 'New Orleans', country = 'United States' WHERE location ILIKE '%Orlaean%' OR location ILIKE '%New Orleans LA%'`);
  await pool.query(`UPDATE actions SET lat = 29.9484, lng = -90.0771 WHERE location = 'New Orleans' AND (lat IS NULL OR lat = 0)`);
  await pool.query(`UPDATE actions SET lat = 40.3573, lng = -74.6672 WHERE location = 'Princeton' AND (lat IS NULL OR lat = 0)`);
  await pool.query(`UPDATE actions SET lat = 38.2324, lng = -122.6367 WHERE location = 'Petaluma' AND (lat IS NULL OR lat = 0)`);
  // Preload known coords for seeded groups and summits
  await pool.query(`UPDATE groups SET lat = 38.2324, lng = -122.6367 WHERE name = 'Red Barn Posse' AND (lat IS NULL OR lat = 0)`);
  await pool.query(`UPDATE groups SET lat = 40.3573, lng = -74.6672 WHERE name = '6 to 1'         AND (lat IS NULL OR lat = 0)`);
  await pool.query(`UPDATE summits SET lat = 40.3573, lng = -74.6672 WHERE location = 'Princeton'  AND (lat IS NULL OR lat = 0)`);

  // Seed actions
  const { rows: a } = await sql`SELECT COUNT(*) FROM actions`;
  if (parseInt(a[0].count) === 0) {
    await sql`INSERT INTO actions (title, description, location, country, date)
      VALUES ('Watershed Monitoring', 'Testing water quality levels across local tributaries.', 'Princeton', 'United States', '2026-04-01')`;
    await sql`INSERT INTO actions (title, description, location, country, date)
      VALUES ('Urban Soil Restoration', 'Rebuilding topsoil in community garden beds.', 'Petaluma', 'United States', '2026-03-15')`;
  }
}

// run init once on startup (non-blocking — routes wait for it via initPromise)
const initPromise = init().catch(err => console.error('DB init error:', err));

const today = () => new Date().toISOString().split('T')[0];

module.exports = {
  ready: () => initPromise,

  members: {
    all: async () => {
      const { rows } = await pool.query('SELECT * FROM members ORDER BY joined_year ASC');
      return rows;
    },
    get: async (id) => {
      const { rows } = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
      return rows[0] || null;
    },
    insert: async ({ name, location, country, bio, avatar_url, joined_year }) => {
      const { rows } = await pool.query(
        'INSERT INTO members (name, location, country, bio, avatar_url, joined_year) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [name, location, country, bio || null, avatar_url || null, joined_year ? parseInt(joined_year) : null]
      );
      return rows[0];
    },
  },

  summits: {
    all: async () => {
      const { rows } = await pool.query('SELECT * FROM summits ORDER BY date ASC');
      return rows;
    },
    upcoming: async () => {
      const { rows } = await pool.query('SELECT * FROM summits WHERE date >= $1 ORDER BY date ASC', [today()]);
      return rows;
    },
    get: async (id) => {
      const { rows } = await pool.query('SELECT * FROM summits WHERE id = $1', [id]);
      return rows[0] || null;
    },
    insert: async ({ title, description, location, country, date, time, host_name, organizer_email, image }) => {
      const { rows } = await pool.query(
        'INSERT INTO summits (title, description, location, country, date, time, host_name, organizer_email, image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [title, description || null, location, country, date, time || null, host_name || null, organizer_email || null, image || null]
      );
      return rows[0];
    },
    update: async (id, { title, description, location, country, date, time, host_name, organizer_email, image }) => {
      const { rows } = await pool.query(
        'UPDATE summits SET title=$1, description=$2, location=$3, country=$4, date=$5, time=$6, host_name=$7, organizer_email=$8, image=COALESCE($9, image) WHERE id=$10 RETURNING *',
        [title, description || null, location, country, date, time || null, host_name || null, organizer_email || null, image || null, id]
      );
      return rows[0];
    },
  },

  groups: {
    all: async () => {
      const { rows } = await pool.query('SELECT * FROM groups ORDER BY id ASC');
      return rows;
    },
    get: async (id) => {
      const { rows } = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
      return rows[0] || null;
    },
    insert: async ({ name, description, location, country, contact, organizer_email, image }) => {
      const { rows } = await pool.query(
        'INSERT INTO groups (name, description, location, country, contact, organizer_email, image) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [name, description || null, location, country, contact || null, organizer_email || null, image || null]
      );
      return rows[0];
    },
    update: async (id, { name, description, location, country, contact, organizer_email, image }) => {
      const { rows } = await pool.query(
        'UPDATE groups SET name=$1, description=$2, location=$3, country=$4, contact=$5, organizer_email=$6, image=COALESCE($7, image) WHERE id=$8 RETURNING *',
        [name, description || null, location, country, contact || null, organizer_email || null, image || null, id]
      );
      return rows[0];
    },
  },

  group_members: {
    forGroup: async (groupId) => {
      const { rows } = await pool.query(
        'SELECT * FROM group_members WHERE group_id = $1 ORDER BY created_at ASC',
        [groupId]
      );
      return rows;
    },
    get: async (id) => {
      const { rows } = await pool.query('SELECT * FROM group_members WHERE id = $1', [id]);
      return rows[0] || null;
    },
    insert: async ({ group_id, name, specialty, description, photo }) => {
      const { rows } = await pool.query(
        'INSERT INTO group_members (group_id, name, specialty, description, photo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [group_id, name, specialty || null, description || null, photo || null]
      );
      return rows[0];
    },
    update: async (id, { name, specialty, description, photo }) => {
      const { rows } = await pool.query(
        'UPDATE group_members SET name=$1, specialty=$2, description=$3, photo=COALESCE($4, photo) WHERE id=$5 RETURNING *',
        [name, specialty || null, description || null, photo || null, id]
      );
      return rows[0];
    },
    delete: async (id) => {
      await pool.query('DELETE FROM group_members WHERE id = $1', [id]);
    },
  },

  actions: {
    all: async () => {
      const { rows } = await pool.query('SELECT * FROM actions ORDER BY created_at DESC');
      return rows;
    },
    // Lean version for map — omits base64 image, includes lat/lng
    allSlim: async () => {
      const { rows } = await pool.query(
        'SELECT id, title, description, location, country, date, lat, lng, created_at FROM actions ORDER BY created_at DESC'
      );
      return rows;
    },
    get: async (id) => {
      const { rows } = await pool.query('SELECT * FROM actions WHERE id = $1', [id]);
      return rows[0] || null;
    },
    insert: async ({ title, description, location, country, date, image, lat, lng }) => {
      const { rows } = await pool.query(
        'INSERT INTO actions (title, description, location, country, date, image, lat, lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [title, description || null, location, country, date || null, image || null, lat || null, lng || null]
      );
      return rows[0];
    },
    update: async (id, { title, description, location, country, date, image, lat, lng }) => {
      const { rows } = await pool.query(
        'UPDATE actions SET title=$1, description=$2, location=$3, country=$4, date=$5, image=COALESCE($6, image), lat=$7, lng=$8 WHERE id=$9 RETURNING *',
        [title, description || null, location, country, date || null, image || null, lat || null, lng || null, id]
      );
      return rows[0];
    },
  },
};
