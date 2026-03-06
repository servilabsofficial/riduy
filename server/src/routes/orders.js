const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const orderSchema = z.object({
  patientId: z.string().uuid(),
  prescriptionId: z.string().uuid().optional().nullable(),
  productId: z.string().uuid().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED']).optional(),
  notes: z.string().optional().nullable(),
  estimatedDate: z.string().optional().nullable(),
});

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          patient: true,
          prescription: true,
          product: true,
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ data: orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        prescription: true,
        product: true,
        user: { select: { id: true, name: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validate(orderSchema), async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };
    if (data.estimatedDate) data.estimatedDate = new Date(data.estimatedDate);
    const order = await prisma.order.create({
      data,
      include: { patient: true, prescription: true, product: true, user: { select: { id: true, name: true } } },
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.estimatedDate) data.estimatedDate = new Date(data.estimatedDate);
    delete data.userId;
    delete data.patientId;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { patient: true, prescription: true, product: true, user: { select: { id: true, name: true } } },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
