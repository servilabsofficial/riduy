const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const saleSchema = z.object({
  patientId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
  })).min(1),
  discount: z.number().min(0).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']),
  notes: z.string().optional().nullable(),
});

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
    }
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          patient: true,
          user: { select: { id: true, name: true } },
          items: { include: { product: true } },
        },
      }),
      prisma.sale.count({ where }),
    ]);
    res.json({ data: sales, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
    });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validate(saleSchema), async (req, res) => {
  try {
    const { patientId, items, discount = 0, paymentMethod, notes } = req.body;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal - discount;

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          patientId,
          userId: req.user.id,
          subtotal,
          discount,
          total,
          paymentMethod,
          notes,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
            })),
          },
        },
        include: {
          patient: true,
          user: { select: { id: true, name: true } },
          items: { include: { product: true } },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
