const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', (req, res) => res.json(store.groups.all()));

router.get('/:id', (req, res) => {
  const group = store.groups.get(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json(group);
});

router.post('/', (req, res) => {
  const { name, description, location, country, contact, image } = req.body;
  if (!name || !location || !country) {
    return res.status(400).json({ error: 'name, location, and country are required' });
  }
  const group = store.groups.insert({ name, description, location, country, contact, image: image || null });
  res.status(201).json({ id: group.id });
});

module.exports = router;
