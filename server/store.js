let nextMemberId = 2;
let nextSummitId = 2;
let nextGroupId = 2;

const members = [
  { id: 1, name: 'Reuben Steiger', location: 'Princeton', country: 'United States', bio: '', avatar_url: null, joined_year: 2025 },
];

const summits = [
  { id: 1, title: 'Inaugural Summit', description: 'First YES Movement summit.', location: 'Princeton', country: 'United States', date: '2026-06-01', time: '18:00', host_name: 'Reuben Steiger' },
];

const groups = [
  { id: 1, name: 'Princeton Group', description: 'YES Movement chapter in Princeton, NJ.', location: 'Princeton', country: 'United States', contact: 'Reuben Steiger' },
];

const today = () => new Date().toISOString().split('T')[0];

module.exports = {
  members: {
    all: () => [...members].sort((a, b) => a.joined_year - b.joined_year),
    get: (id) => members.find(m => m.id === parseInt(id)) || null,
    insert({ name, location, country, bio, avatar_url, joined_year }) {
      const m = { id: nextMemberId++, name, location, country,
        bio: bio || null, avatar_url: avatar_url || null,
        joined_year: joined_year ? parseInt(joined_year) : null };
      members.push(m);
      return m;
    },
  },
  summits: {
    all: () => [...summits].sort((a, b) => a.date.localeCompare(b.date)),
    upcoming: () => summits.filter(e => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date)),
    get: (id) => summits.find(e => e.id === parseInt(id)) || null,
    insert({ title, description, location, country, date, time, host_name }) {
      const e = { id: nextSummitId++, title, description: description || null,
        location, country, date, time: time || null, host_name: host_name || null };
      summits.push(e);
      return e;
    },
  },
  groups: {
    all: () => [...groups],
    get: (id) => groups.find(g => g.id === parseInt(id)) || null,
    insert({ name, description, location, country, contact }) {
      const g = { id: nextGroupId++, name, description: description || null,
        location, country, contact: contact || null };
      groups.push(g);
      return g;
    },
  },
};
