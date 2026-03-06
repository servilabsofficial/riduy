const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

// List audit logs
router.get('/', async (req, res) => {
  try {
    const { module, userId, page = 1, limit = 30, startDate, endDate } = req.query;
    const where = {};
    if (module) where.module = module;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true, role: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({ data: logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get modules list
router.get('/modules', async (req, res) => {
  try {
    const modules = await prisma.auditLog.findMany({
      distinct: ['module'],
      select: { module: true },
    });
    res.json(modules.map((m) => m.module));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
