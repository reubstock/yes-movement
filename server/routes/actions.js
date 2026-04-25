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

async function geocode(location, country) {
  try {
    const q = encodeURIComponent(`${location}, ${country}`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { 'User-Agent': 'YES-Movement/1.0', 'Accept-Language': 'en' }
    });
    const data = await res.json();
    return data.length ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
  } catch { return null; }
}

router.post('/', async (req, res) => {
  try {
    await store.ready();
    const { title, description, location, country, date, image } = req.body;
    if (!title || !location || !country) {
      return res.status(400).json({ error: 'title, location and country are required' });
    }
    const coords = await geocode(location, country);
    const action = await store.actions.insert({
      title, description, location, country, date, image,
      lat: coords ? coords.lat : null,
      lng: coords ? coords.lng : null,
    });
    res.status(201).json(action);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create action' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    await store.ready();
    const { title, description, location, country, date, image } = req.body;
    if (!title || !location || !country) {
      return res.status(400).json({ error: 'title, location and country are required' });
    }
    const coords = await geocode(location, country);
    const action = await store.actions.update(req.params.id, {
      title, description, location, country, date, image,
      lat: coords ? coords.lat : null,
      lng: coords ? coords.lng : null,
    });
    if (!action) return res.status(404).json({ error: 'Action not found' });
    res.json(action);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update action' });
  }
});

module.exports = router;
