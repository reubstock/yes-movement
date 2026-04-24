const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', async (req, res) => {
  try {
    await store.ready();
    const groups = await store.groups.all();
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await store.ready();
    const group = await store.groups.get(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

router.post('/', async (req, res) => {
  try {
    await store.ready();
    const { name, description, location, country, contact, image } = req.body;
    if (!name || !location || !country) {
      return res.status(400).json({ error: 'name, location, and country are required' });
    }
    const group = await store.groups.insert({ name, description, location, country, contact, image: image || null });
    res.status(201).json({ id: group.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

module.exports = router;
