const express = require('express');
const router = express.Router();
const store = require('../store');
const { sendJoinRequest } = require('../mailer');

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
    const { name, description, location, country, contact, organizer_email, image } = req.body;
    if (!name || !location || !country) {
      return res.status(400).json({ error: 'name, location, and country are required' });
    }
    const group = await store.groups.insert({ name, description, location, country, contact, organizer_email, image: image || null });
    res.status(201).json({ id: group.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    await store.ready();
    const { name, description, location, country, contact, organizer_email, image } = req.body;
    if (!name || !location || !country) {
      return res.status(400).json({ error: 'name, location, and country are required' });
    }
    const group = await store.groups.update(req.params.id, { name, description, location, country, contact, organizer_email, image });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// ── Group Members ──

router.get('/:id/members', async (req, res) => {
  try {
    await store.ready();
    const members = await store.group_members.forGroup(req.params.id);
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.post('/:id/members', async (req, res) => {
  try {
    await store.ready();
    const { name, specialty, description, photo } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const member = await store.group_members.insert({
      group_id: req.params.id, name, specialty, description, photo: photo || null,
    });
    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

router.patch('/:id/members/:memberId', async (req, res) => {
  try {
    await store.ready();
    const { name, specialty, description, photo } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const member = await store.group_members.update(req.params.memberId, { name, specialty, description, photo: photo || null });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    await store.ready();
    await store.group_members.delete(req.params.memberId);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Join request — emails the organizer
router.post('/:id/join', async (req, res) => {
  try {
    await store.ready();
    const group = await store.groups.get(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

    if (!group.organizer_email) {
      return res.status(422).json({ error: 'This group has no organizer email on file.' });
    }

    await sendJoinRequest({
      groupName: group.name,
      groupLocation: `${group.location}, ${group.country}`,
      organizerEmail: group.organizer_email,
      requesterName: name,
      requesterEmail: email,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send join request' });
  }
});

module.exports = router;
