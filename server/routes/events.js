const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', (req, res) => {
  const list = req.query.upcoming === 'true' ? store.events.upcoming() : store.events.all();
  res.json(list);
});

router.get('/:id', (req, res) => {
  const event = store.events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

router.post('/', (req, res) => {
  const { title, description, location, country, date, time, host_name } = req.body;
  if (!title || !location || !country || !date) {
    return res.status(400).json({ error: 'title, location, country, and date are required' });
  }
  const event = store.events.insert({ title, description, location, country, date, time, host_name });
  res.status(201).json({ id: event.id });
});

module.exports = router;
