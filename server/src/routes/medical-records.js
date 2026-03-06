const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const recordSchema = z.object({
  patientId: z.string().uuid(),
  diagnosis: z.string().optional().nullable(),
  intraocularPressureOD: z.number().optional().nullable(),
  intraocularPressureOI: z.number().optional().nullable(),
  visualAcuityOD: z.string().optional().nullable(),
  visualAcuityOI: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  evolution: z.string().optional().nullable(),
  professional: z.string().optional().nullable(),
  date: z.string().optional(),
});

router.use(authenticate);

// List medical records
router.get('/', async (req, res) => {
  try {
    const { patientId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (patientId) where.patientId = patientId;
    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: { patient: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.medicalRecord.count({ where }),
    ]);
    res.json({ data: records, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create
router.post('/', validate(recordSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    const record = await prisma.medicalRecord.create({
      data,
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    delete data.patientId;
    const record = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data,
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await prisma.medicalRecord.delete({ where: { id: req.params.id } });
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
