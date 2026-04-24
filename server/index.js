const express = require('express');
const path = require('path');
const fs = require('fs');

if (!process.env.VERCEL) {
  ['data'].forEach(dir => {
    const full = path.join(__dirname, '..', dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  });
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/members', require('./routes/members'));
app.use('/api/summits', require('./routes/summits'));
app.use('/api/groups', require('./routes/groups'));

app.get('/api/debug', async (req, res) => {
  try {
    const store = require('./store');
    await store.ready();
    const [members, summits, groups] = await Promise.all([
      store.members.all(),
      store.summits.all(),
      store.groups.all(),
    ]);
    res.json({
      ok: true,
      db: process.env.DATABASE_URL ? 'postgres' : 'no DATABASE_URL',
      counts: { members: members.length, summits: summits.length, groups: groups.length },
      groups: groups.map(g => ({ id: g.id, name: g.name, location: g.location, country: g.country, hasImage: !!g.image })),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`YES Movement running at http://localhost:${PORT}`));
