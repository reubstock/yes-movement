let nextMemberId = 2;
let nextEventId = 2;

const members = [
  { id: 1, name: 'Reuben Steiger', location: 'Princeton', country: 'United States', bio: '', avatar_url: null, joined_year: 2025 },
];

const events = [
  { id: 1, title: 'Inaugural Gathering', description: 'First YES Movement meetup.', location: 'Princeton', country: 'United States', date: '2026-06-01', time: '18:00', host_name: 'Reuben Steiger' },
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
  events: {
    all: () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    upcoming: () => events.filter(e => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date)),
    get: (id) => events.find(e => e.id === parseInt(id)) || null,
    insert({ title, description, location, country, date, time, host_name }) {
      const e = { id: nextEventId++, title, description: description || null,
        location, country, date, time: time || null, host_name: host_name || null };
      events.push(e);
      return e;
    },
  },
};
