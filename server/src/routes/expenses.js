const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const expenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().min(0),
  category: z.enum(['RENT', 'UTILITIES', 'SUPPLIES', 'SALARIES', 'MARKETING', 'MAINTENANCE', 'OTHER']),
  branchId: z.string().uuid().optional().nullable(),
  date: z.string().optional(),
  notes: z.string().optional().nullable(),
});

router.use(authenticate);

// List expenses
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query;
    const where = {};
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59');
    }
    const [expenses, total, totalAmount] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: { branch: { select: { id: true, name: true } } },
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({ where, _sum: { amount: true } }),
    ]);
    res.json({
      data: expenses,
      total,
      totalAmount: totalAmount._sum.amount || 0,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Expense summary
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyExpenses, byCategory] = await Promise.all([
      prisma.expense.aggregate({
        where: { date: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where: { date: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);
    res.json({
      monthlyTotal: monthlyExpenses._sum.amount || 0,
      monthlyCount: monthlyExpenses._count,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        total: c._sum.amount || 0,
        count: c._count,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create expense
router.post('/', validate(expenseSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    const expense = await prisma.expense.create({
      data,
      include: { branch: { select: { id: true, name: true } } },
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update expense
router.put('/:id', validate(expenseSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data,
      include: { branch: { select: { id: true, name: true } } },
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', authorize('ADMIN', 'ACCOUNTANT'), async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
