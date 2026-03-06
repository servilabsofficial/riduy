const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional().nullable(),
  type: z.enum(['FRAME', 'LENS', 'CONTACT_LENS', 'ACCESSORY']),
  price: z.number().min(0),
  cost: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  supplierId: z.string().uuid().optional().nullable(),
});

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search, type, lowStock, page = 1, limit = 20 } = req.query;
    const where = { active: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (lowStock === 'true') {
      where.stock = { lte: prisma.product.fields?.minStock || 5 };
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: { supplier: true },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ data: products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/low-stock', async (req, res) => {
  try {
    const products = await prisma.$queryRaw`
      SELECT * FROM "Product" WHERE stock <= "minStock" AND active = true ORDER BY stock ASC
    `;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { supplier: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validate(productSchema), async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
      include: { supplier: true },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
      include: { supplier: true },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ message: 'Product deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
