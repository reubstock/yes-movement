const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', (req, res) => {
  const list = req.query.upcoming === 'true' ? store.summits.upcoming() : store.summits.all();
  res.json(list);
});

router.get('/:id', (req, res) => {
  const summit = store.summits.get(req.params.id);
  if (!summit) return res.status(404).json({ error: 'Summit not found' });
  res.json(summit);
});

router.post('/', (req, res) => {
  const { title, description, location, country, date, time, host_name } = req.body;
  if (!title || !location || !country || !date) {
    return res.status(400).json({ error: 'title, location, country, and date are required' });
  }
  const summit = store.summits.insert({ title, description, location, country, date, time, host_name });
  res.status(201).json({ id: summit.id });
});

module.exports = router;
