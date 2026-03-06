const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

// List commissions
router.get('/', async (req, res) => {
  try {
    const { userId, paid, page = 1, limit = 20, startDate, endDate } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (paid !== undefined) where.paid = paid === 'true';
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }
    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true, role: true } },
          sale: { select: { id: true, total: true, createdAt: true, patient: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.commission.count({ where }),
    ]);
    res.json({ data: commissions, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Commission summary
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyTotal, pendingTotal, paidTotal] = await Promise.all([
      prisma.commission.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.commission.aggregate({
        where: { paid: false },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.commission.aggregate({
        where: { paid: true, paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);
    res.json({
      monthly: { total: monthlyTotal._sum.amount || 0, count: monthlyTotal._count },
      pending: { total: pendingTotal._sum.amount || 0, count: pendingTotal._count },
      paid: { total: paidTotal._sum.amount || 0, count: paidTotal._count },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark commission as paid
router.patch('/:id/pay', authorize('ADMIN', 'ACCOUNTANT'), async (req, res) => {
  try {
    const commission = await prisma.commission.update({
      where: { id: req.params.id },
      data: { paid: true, paidAt: new Date() },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(commission);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk pay
router.post('/bulk-pay', authorize('ADMIN', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { ids } = req.body;
    await prisma.commission.updateMany({
      where: { id: { in: ids } },
      data: { paid: true, paidAt: new Date() },
    });
    res.json({ message: 'Commissions paid', count: ids.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
