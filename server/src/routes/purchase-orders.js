const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  branchId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
    unitCost: z.number().min(0),
  })).min(1),
});

router.use(authenticate);

// List purchase orders
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          supplier: true,
          branch: { select: { id: true, name: true } },
          items: { include: { product: { select: { id: true, name: true, brand: true } } } },
          _count: { select: { items: true } },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);
    res.json({ data: orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        branch: true,
        items: { include: { product: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create purchase order
router.post('/', validate(purchaseOrderSchema), async (req, res) => {
  try {
    const { items, ...rest } = req.body;
    const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
    const order = await prisma.purchaseOrder.create({
      data: {
        ...rest,
        totalAmount,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            subtotal: i.quantity * i.unitCost,
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const data = { status };
    if (status === 'SENT') data.orderedAt = new Date();
    if (status === 'RECEIVED') data.receivedAt = new Date();

    const order = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data,
      include: { items: { include: { product: true } } },
    });

    // Auto-update stock when received
    if (status === 'RECEIVED') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate from low stock
router.post('/generate-from-stock', async (req, res) => {
  try {
    const lowStockProducts = await prisma.$queryRaw`
      SELECT id, name, stock, "minStock", "supplierId", cost
      FROM "Product"
      WHERE stock <= "minStock" AND active = true AND "supplierId" IS NOT NULL
    `;
    if (lowStockProducts.length === 0) {
      return res.json({ message: 'No low stock products with suppliers', orders: [] });
    }
    // Group by supplier
    const bySupplier = {};
    for (const p of lowStockProducts) {
      if (!bySupplier[p.supplierId]) bySupplier[p.supplierId] = [];
      const reorderQty = Math.max((p.minStock - p.stock) * 2, p.minStock);
      bySupplier[p.supplierId].push({
        productId: p.id,
        quantity: reorderQty,
        unitCost: Number(p.cost),
        subtotal: reorderQty * Number(p.cost),
      });
    }
    const orders = [];
    for (const [supplierId, items] of Object.entries(bySupplier)) {
      const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
      const order = await prisma.purchaseOrder.create({
        data: {
          supplierId,
          totalAmount,
          notes: 'Auto-generated from low stock alert',
          items: { create: items },
        },
        include: { supplier: true, items: { include: { product: true } } },
      });
      orders.push(order);
    }
    res.status(201).json({ message: `${orders.length} purchase orders created`, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.purchaseOrder.delete({ where: { id: req.params.id } });
    res.json({ message: 'Purchase order deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
