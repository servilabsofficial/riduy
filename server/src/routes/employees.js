const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const employeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'SELLER', 'OPTOMETRIST', 'ACCOUNTANT', 'RECEPTIONIST', 'LAB_TECH']),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  document: z.string().optional().nullable(),
  hireDate: z.string().optional().nullable(),
  salary: z.number().optional().nullable(),
  branchId: z.string().uuid().optional().nullable(),
  active: z.boolean().optional(),
});

const attendanceSchema = z.object({
  userId: z.string().uuid(),
  checkIn: z.string(),
  checkOut: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.use(authenticate);

// List employees
router.get('/', async (req, res) => {
  try {
    const { search, role, active, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (active !== undefined) where.active = active === 'true';
    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true, email: true, name: true, role: true, active: true,
          phone: true, address: true, document: true, hireDate: true,
          salary: true, branchId: true, createdAt: true,
          branch: { select: { id: true, name: true } },
          _count: { select: { sales: true, commissions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ data: employees, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Employee performance stats
router.get('/performance', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sellers = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true, name: true, role: true,
        sales: {
          where: { createdAt: { gte: startOfMonth } },
          select: { total: true },
        },
        commissions: {
          where: { createdAt: { gte: startOfMonth } },
          select: { amount: true, paid: true },
        },
      },
    });
    const performance = sellers.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      totalSales: u.sales.reduce((s, sale) => s + sale.total, 0),
      salesCount: u.sales.length,
      totalCommissions: u.commissions.reduce((s, c) => s + c.amount, 0),
      pendingCommissions: u.commissions.filter((c) => !c.paid).reduce((s, c) => s + c.amount, 0),
    }));
    performance.sort((a, b) => b.totalSales - a.totalSales);
    res.json(performance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, role: true, active: true,
        phone: true, address: true, document: true, hireDate: true,
        salary: true, branchId: true, createdAt: true,
        branch: true,
        _count: { select: { sales: true, commissions: true, attendance: true } },
      },
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create employee
router.post('/', authorize('ADMIN'), validate(employeeSchema), async (req, res) => {
  try {
    const { password, hireDate, ...rest } = req.body;
    const exists = await prisma.user.findUnique({ where: { email: rest.email } });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password || 'temp1234', 10);
    const employee = await prisma.user.create({
      data: {
        ...rest,
        password: hashed,
        hireDate: hireDate ? new Date(hireDate) : null,
      },
      select: {
        id: true, email: true, name: true, role: true, active: true,
        phone: true, address: true, document: true, hireDate: true,
        salary: true, branchId: true, createdAt: true,
      },
    });
    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update employee
router.put('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const { password, hireDate, ...rest } = req.body;
    const data = { ...rest };
    if (password) data.password = await bcrypt.hash(password, 10);
    if (hireDate) data.hireDate = new Date(hireDate);
    const employee = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true, email: true, name: true, role: true, active: true,
        phone: true, address: true, document: true, hireDate: true,
        salary: true, branchId: true, createdAt: true,
      },
    });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle active
router.patch('/:id/toggle', authorize('ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { active: !user.active },
    });
    res.json({ active: updated.active });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Attendance
router.get('/:id/attendance', async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = { userId: req.params.id };
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      where.date = { gte: start, lt: end };
    }
    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 50,
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/attendance', validate(attendanceSchema), async (req, res) => {
  try {
    const data = {
      userId: req.body.userId,
      checkIn: new Date(req.body.checkIn),
      checkOut: req.body.checkOut ? new Date(req.body.checkOut) : null,
      notes: req.body.notes,
      date: new Date(req.body.checkIn),
    };
    if (data.checkOut && data.checkIn) {
      data.hoursWorked = (data.checkOut - data.checkIn) / (1000 * 60 * 60);
    }
    const record = await prisma.attendance.create({ data });
    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
