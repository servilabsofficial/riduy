import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Truck,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../utils/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen general del día</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general del día</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas del día"
          value={stats?.todaySales || 0}
          prefix="$"
          icon={DollarSign}
          color="green"
          delay={0}
        />
        <StatCard
          title="Pacientes registrados"
          value={stats?.totalPatients || 0}
          icon={Users}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Pedidos pendientes"
          value={stats?.pendingOrders || 0}
          icon={Truck}
          color="yellow"
          delay={0.2}
        />
        <StatCard
          title="Stock bajo"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          color="red"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Ventas Recientes</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats?.recentSales?.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">No hay ventas recientes</div>
            ) : (
              stats?.recentSales?.map((sale) => (
                <div key={sale.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sale.patient?.firstName} {sale.patient?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(sale.createdAt)} - {sale.user?.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(sale.total)}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <Calendar size={18} className="text-primary-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Próximas Citas</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats?.upcomingAppointments?.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">No hay citas próximas</div>
            ) : (
              stats?.upcomingAppointments?.map((apt) => (
                <div key={apt.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {apt.patient?.firstName} {apt.patient?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(apt.date)} - {apt.time}</p>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
