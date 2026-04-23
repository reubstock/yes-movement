const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', (req, res) => res.json(store.members.all()));

router.get('/:id', (req, res) => {
  const member = store.members.get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
});

router.post('/', (req, res) => {
  const { name, location, country, bio, avatar_url, joined_year } = req.body;
  if (!name || !location || !country) {
    return res.status(400).json({ error: 'name, location, and country are required' });
  }
  const member = store.members.insert({ name, location, country, bio, avatar_url, joined_year });
  res.status(201).json({ id: member.id });
});

module.exports = router;
