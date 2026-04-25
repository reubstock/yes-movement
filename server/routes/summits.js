const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', async (req, res) => {
  try {
    await store.ready();
    const list = req.query.upcoming === 'true'
      ? await store.summits.upcoming()
      : await store.summits.all();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summits' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await store.ready();
    const summit = await store.summits.get(req.params.id);
    if (!summit) return res.status(404).json({ error: 'Summit not found' });
    res.json(summit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summit' });
  }
});

router.post('/', async (req, res) => {
  try {
    await store.ready();
    const { title, description, location, country, date, time, host_name, image } = req.body;
    if (!title || !location || !country || !date) {
      return res.status(400).json({ error: 'title, location, country, and date are required' });
    }
    const summit = await store.summits.insert({ title, description, location, country, date, time, host_name, image });
    res.status(201).json({ id: summit.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create summit' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    await store.ready();
    const { title, description, location, country, date, time, host_name, image } = req.body;
    if (!title || !location || !country || !date) {
      return res.status(400).json({ error: 'title, location, country, and date are required' });
    }
    const summit = await store.summits.update(req.params.id, { title, description, location, country, date, time, host_name, image });
    if (!summit) return res.status(404).json({ error: 'Summit not found' });
    res.json(summit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update summit' });
  }
});

module.exports = router;
