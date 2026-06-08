const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', async (req, res) => {
  try {
    await store.ready();
    const { category } = req.query;
    const actions = await store.crowdfundActions.all(category || null);
    res.json(actions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch crowdfund actions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await store.ready();
    const action = await store.crowdfundActions.get(req.params.id);
    if (!action) return res.status(404).json({ error: 'Not found' });
    res.json(action);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch action' });
  }
});

module.exports = router;
