const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ results: [] });

    const [patients, products, employees, sales] = await Promise.all([
      prisma.patient.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, firstName: true, lastName: true, phone: true, email: true },
      }),
      prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, brand: true, type: true, stock: true, price: true },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true, role: true },
      }),
      prisma.prescription.findMany({
        where: {
          patient: {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        take: 5,
        include: { patient: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    res.json({
      results: [
        ...patients.map((p) => ({ type: 'patient', id: p.id, title: `${p.firstName} ${p.lastName}`, subtitle: p.phone || p.email, url: '/patients' })),
        ...products.map((p) => ({ type: 'product', id: p.id, title: p.name, subtitle: `${p.brand || ''} - Stock: ${p.stock}`, url: '/inventory' })),
        ...employees.map((e) => ({ type: 'employee', id: e.id, title: e.name, subtitle: e.role, url: '/employees' })),
        ...sales.map((r) => ({ type: 'prescription', id: r.id, title: `Receta - ${r.patient?.firstName} ${r.patient?.lastName}`, subtitle: r.lensType || 'Receta', url: '/prescriptions' })),
      ],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
