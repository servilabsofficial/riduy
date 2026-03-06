const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: { _count: { select: { prescriptions: true, sales: true } } },
      }),
      prisma.patient.count({ where }),
    ]);
    res.json({ data: patients, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        prescriptions: { orderBy: { date: 'desc' } },
        sales: { include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { date: 'desc' } },
        orders: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validate(patientSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    const patient = await prisma.patient.create({ data });
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', validate(patientSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data,
    });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.patient.delete({ where: { id: req.params.id } });
    res.json({ message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
