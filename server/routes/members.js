const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', async (req, res) => {
  try {
    await store.ready();
    const members = await store.members.all();
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await store.ready();
    const member = await store.members.get(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

router.post('/', async (req, res) => {
  try {
    await store.ready();
    const { name, location, country, bio, avatar_url, joined_year } = req.body;
    if (!name || !location || !country) {
      return res.status(400).json({ error: 'name, location, and country are required' });
    }
    const member = await store.members.insert({ name, location, country, bio, avatar_url, joined_year });
    res.status(201).json({ id: member.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

module.exports = router;
