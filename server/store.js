const fs = require('fs');
const path = require('path');

const DB_PATH = path.join('/tmp', 'yes-data-v3.json');

const SEED = {
  members: [
    { id: 1, name: 'Reuben Steiger', location: 'Princeton', country: 'United States', bio: '', avatar_url: null, joined_year: 2025 },
  ],
  summits: [
    { id: 1, title: 'Red Barn Posse — The Lexicon Says "Yes"', description: 'The first YES Movement summit.', location: 'Petaluma', country: 'United States', date: '2026-06-01', time: '18:00', host_name: 'Reuben Steiger' },
    { id: 2, title: 'Inaugural Summit', description: 'YES Movement summit.', location: 'Princeton', country: 'United States', date: '2026-07-01', time: '18:00', host_name: 'Reuben Steiger' },
  ],
  groups: [
    { id: 1, name: 'Red Barn Posse', description: 'YES Movement group based in Petaluma, CA.', location: 'Petaluma', country: 'United States', contact: 'Reuben Steiger', image: '/images/groups/red-barn-posse.jpg' },
    { id: 2, name: '6 to 1', description: 'A group of environmental ninjas rebooting the planet.', location: 'Princeton', country: 'United States', contact: 'Reuben Steiger', image: '/images/groups/6-to-1.webp' },
  ],
  nextMemberId: 2,
  nextSummitId: 3,
  nextGroupId: 3,
};

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch (e) { /* fall through to seed */ }
  return JSON.parse(JSON.stringify(SEED));
}

function save(db) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(db)); } catch (e) { /* ignore write errors */ }
}

// initialise
let db = load();

const today = () => new Date().toISOString().split('T')[0];

module.exports = {
  members: {
    all: () => [...db.members].sort((a, b) => a.joined_year - b.joined_year),
    get: (id) => db.members.find(m => m.id === parseInt(id)) || null,
    insert({ name, location, country, bio, avatar_url, joined_year }) {
      const m = { id: db.nextMemberId++, name, location, country,
        bio: bio || null, avatar_url: avatar_url || null,
        joined_year: joined_year ? parseInt(joined_year) : null };
      db.members.push(m);
      save(db);
      return m;
    },
  },
  summits: {
    all: () => [...db.summits].sort((a, b) => a.date.localeCompare(b.date)),
    upcoming: () => db.summits.filter(e => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date)),
    get: (id) => db.summits.find(e => e.id === parseInt(id)) || null,
    insert({ title, description, location, country, date, time, host_name }) {
      const e = { id: db.nextSummitId++, title, description: description || null,
        location, country, date, time: time || null, host_name: host_name || null };
      db.summits.push(e);
      save(db);
      return e;
    },
  },
  groups: {
    all: () => [...db.groups],
    get: (id) => db.groups.find(g => g.id === parseInt(id)) || null,
    insert({ name, description, location, country, contact, image }) {
      const g = { id: db.nextGroupId++, name, description: description || null,
        location, country, contact: contact || null, image: image || null };
      db.groups.push(g);
      save(db);
      return g;
    },
  },
};
