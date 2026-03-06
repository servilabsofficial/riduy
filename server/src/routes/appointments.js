const express = require('express');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  date: z.string(),
  time: z.string(),
  type: z.string().min(1),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional().nullable(),
});

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { date, status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.date = {
        gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
      };
    }
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          patient: true,
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);
    res.json({ data: appointments, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: true, user: { select: { id: true, name: true } } },
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validate(appointmentSchema), async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };
    data.date = new Date(data.date);
    const appointment = await prisma.appointment.create({
      data,
      include: { patient: true, user: { select: { id: true, name: true } } },
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    delete data.userId;
    delete data.patientId;
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data,
      include: { patient: true, user: { select: { id: true, name: true } } },
    });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
