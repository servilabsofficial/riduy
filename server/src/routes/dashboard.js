const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todaySales, totalPatients, pendingOrders, lowStockProducts, recentSales, upcomingAppointments] =
      await Promise.all([
        prisma.sale.aggregate({
          where: { createdAt: { gte: today, lt: tomorrow } },
          _sum: { total: true },
          _count: true,
        }),
        prisma.patient.count(),
        prisma.order.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
        prisma.$queryRaw`SELECT COUNT(*)::int as count FROM "Product" WHERE stock <= "minStock" AND active = true`,
        prisma.sale.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { patient: true, user: { select: { name: true } } },
        }),
        prisma.appointment.findMany({
          where: { date: { gte: today }, status: 'SCHEDULED' },
          take: 5,
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
          include: { patient: true },
        }),
      ]);

    res.json({
      todaySales: todaySales._sum.total || 0,
      todaySalesCount: todaySales._count || 0,
      totalPatients,
      pendingOrders,
      lowStockCount: lowStockProducts[0]?.count || 0,
      recentSales,
      upcomingAppointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const [salesByDay, topProducts, salesByPayment, monthlySales] = await Promise.all([
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date, SUM(total) as total, COUNT(*)::int as count
        FROM "Sale"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      prisma.$queryRaw`
        SELECT p.name, p.brand, SUM(si.quantity)::int as total_sold, SUM(si.subtotal) as total_revenue
        FROM "SaleItem" si
        JOIN "Product" p ON si."productId" = p.id
        JOIN "Sale" s ON si."saleId" = s.id
        WHERE s."createdAt" >= ${startDate}
        GROUP BY p.id, p.name, p.brand
        ORDER BY total_sold DESC
        LIMIT 10
      `,
      prisma.$queryRaw`
        SELECT "paymentMethod" as method, COUNT(*)::int as count, SUM(total) as total
        FROM "Sale"
        WHERE "createdAt" >= ${startDate}
        GROUP BY "paymentMethod"
      `,
      prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM "createdAt")::int as month,
          SUM(total) as total,
          COUNT(*)::int as count
        FROM "Sale"
        WHERE "createdAt" >= ${new Date(now.getFullYear(), 0, 1)}
        GROUP BY EXTRACT(MONTH FROM "createdAt")
        ORDER BY month ASC
      `,
    ]);

    res.json({ salesByDay, topProducts, salesByPayment, monthlySales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
