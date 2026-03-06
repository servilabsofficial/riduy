const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const supplierSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
});

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validate(supplierSchema), async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({ data: req.body });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', validate(supplierSchema), async (req, res) => {
  try {
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: req.params.id } });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
