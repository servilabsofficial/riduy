const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

// Get current open register for user
router.get('/current', async (req, res) => {
  try {
    const register = await prisma.cashRegister.findFirst({
      where: { userId: req.user.id, status: 'OPEN' },
      include: {
        movements: { orderBy: { createdAt: 'desc' } },
        user: { select: { id: true, name: true } },
      },
    });
    res.json(register);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List registers
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const [registers, total] = await Promise.all([
      prisma.cashRegister.findMany({
        where,
        orderBy: { openedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          _count: { select: { movements: true } },
        },
      }),
      prisma.cashRegister.count({ where }),
    ]);
    res.json({ data: registers, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Open register
router.post('/open', async (req, res) => {
  try {
    const existing = await prisma.cashRegister.findFirst({
      where: { userId: req.user.id, status: 'OPEN' },
    });
    if (existing) return res.status(400).json({ error: 'Ya tiene una caja abierta' });
    const register = await prisma.cashRegister.create({
      data: {
        userId: req.user.id,
        openAmount: Number(req.body.openAmount) || 0,
        branchId: req.body.branchId || null,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json(register);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Close register
router.post('/:id/close', async (req, res) => {
  try {
    const register = await prisma.cashRegister.findUnique({
      where: { id: req.params.id },
      include: { movements: true },
    });
    if (!register) return res.status(404).json({ error: 'Not found' });
    if (register.status === 'CLOSED') return res.status(400).json({ error: 'Already closed' });

    const totalIncome = register.movements
      .filter((m) => m.type === 'INCOME')
      .reduce((s, m) => s + m.amount, 0);
    const totalExpense = register.movements
      .filter((m) => m.type === 'EXPENSE')
      .reduce((s, m) => s + m.amount, 0);
    const expectedAmount = register.openAmount + totalIncome - totalExpense;
    const closeAmount = Number(req.body.closeAmount) || 0;

    const updated = await prisma.cashRegister.update({
      where: { id: req.params.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closeAmount,
        expectedAmount,
        difference: closeAmount - expectedAmount,
        notes: req.body.notes,
      },
      include: {
        user: { select: { id: true, name: true } },
        movements: { orderBy: { createdAt: 'desc' } },
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add movement
router.post('/:id/movements', async (req, res) => {
  try {
    const movement = await prisma.cashMovement.create({
      data: {
        cashRegisterId: req.params.id,
        type: req.body.type,
        amount: Number(req.body.amount),
        description: req.body.description,
      },
    });
    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
