const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get notifications for current user
router.get('/', async (req, res) => {
  try {
    const { unread, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (unread === 'true') where.read = false;
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user.id, read: false } }),
    ]);
    res.json({
      data: notifications,
      total,
      unreadCount,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all as read
router.post('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create notification (system use)
router.post('/', async (req, res) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: req.body.userId,
        type: req.body.type,
        title: req.body.title,
        message: req.body.message,
        data: req.body.data ? JSON.stringify(req.body.data) : null,
        branchId: req.body.branchId,
      },
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
