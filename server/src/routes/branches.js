const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const branchSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  active: z.boolean().optional(),
});

router.use(authenticate);

// List branches
router.get('/', async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { users: true, cashRegisters: true, expenses: true } },
      },
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get branch by ID
router.get('/:id', async (req, res) => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.id },
      include: {
        users: { select: { id: true, name: true, role: true, active: true } },
        _count: { select: { users: true, expenses: true, cashRegisters: true } },
      },
    });
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create branch
router.post('/', authorize('ADMIN'), validate(branchSchema), async (req, res) => {
  try {
    const branch = await prisma.branch.create({ data: req.body });
    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update branch
router.put('/:id', authorize('ADMIN'), validate(branchSchema), async (req, res) => {
  try {
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete branch
router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.branch.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ message: 'Branch deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
