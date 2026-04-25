const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', async (req, res) => {
  try {
    await store.ready();
    // Exclude image column from list — base64 payloads are too large for the map fetch
    const actions = await store.actions.allSlim();
    res.json(actions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await store.ready();
    const action = await store.actions.get(req.params.id);
    if (!action) return res.status(404).json({ error: 'Not found' });
    res.json(action);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch action' });
  }
});

router.post('/', async (req, res) => {
  try {
    await store.ready();
    const { title, description, location, country, date, image } = req.body;
    if (!title || !location || !country) {
      return res.status(400).json({ error: 'title, location and country are required' });
    }
    const action = await store.actions.insert({ title, description, location, country, date, image });
    res.status(201).json(action);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create action' });
  }
});

module.exports = router;
