const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const prescriptionSchema = z.object({
  patientId: z.string().uuid(),
  odSph: z.number().optional().nullable(),
  odCyl: z.number().optional().nullable(),
  odAxis: z.number().optional().nullable(),
  oiSph: z.number().optional().nullable(),
  oiCyl: z.number().optional().nullable(),
  oiAxis: z.number().optional().nullable(),
  pupillaryDist: z.number().optional().nullable(),
  lensType: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  professional: z.string().optional().nullable(),
  date: z.string().optional(),
});

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { patientId, page = 1, limit = 20 } = req.query;
    const where = patientId ? { patientId } : {};
    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: { patient: true },
      }),
      prisma.prescription.count({ where }),
    ]);
    res.json({ data: prescriptions, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validate(prescriptionSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    const prescription = await prisma.prescription.create({
      data,
      include: { patient: true },
    });
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    delete data.patientId;
    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data,
      include: { patient: true },
    });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.prescription.delete({ where: { id: req.params.id } });
    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
