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


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`YES Movement running at http://localhost:${PORT}`));
