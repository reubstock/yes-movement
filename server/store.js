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
    insert: async ({ title, description, location, country, date, time, host_name }) => {
      const { rows } = await pool.query(
        'INSERT INTO summits (title, description, location, country, date, time, host_name) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [title, description || null, location, country, date, time || null, host_name || null]
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
    insert: async ({ name, description, location, country, contact, image }) => {
      const { rows } = await pool.query(
        'INSERT INTO groups (name, description, location, country, contact, image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [name, description || null, location, country, contact || null, image || null]
      );
      return rows[0];
    },
  },
};
