import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const result = await api.get('/dashboard/reports', { period });
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const formatSalesData = (salesByDay) =>
    salesByDay?.map((d) => ({
      date: new Date(d.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
      total: Number(d.total),
      count: d.count,
    })) || [];

  const formatMonthlyData = (monthly) =>
    monthly?.map((d) => ({
      month: monthNames[d.month],
      total: Number(d.total),
      count: d.count,
    })) || [];

  const formatPaymentData = (payments) =>
    payments?.map((d) => {
      const labels = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia' };
      return { name: labels[d.method] || d.method, value: Number(d.total), count: d.count };
    }) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6"><div className="skeleton h-64 rounded" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
          <p className="text-gray-500 mt-1">Análisis de ventas y rendimiento</p>
        </motion.div>
        <div className="flex gap-2">
          {[
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mes' },
            { value: 'year', label: 'Año' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Sales */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Ventas Diarias</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={formatSalesData(data?.salesByDay)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Sales */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Ventas Mensuales</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={formatMonthlyData(data?.monthlySales)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Methods */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Métodos de Pago</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={formatPaymentData(data?.salesByPayment)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {formatPaymentData(data?.salesByPayment).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Productos Más Vendidos</h3>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {data?.topProducts?.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.total_sold} uds.</p>
                  <p className="text-xs text-green-600">{formatCurrency(Number(p.total_revenue))}</p>
                </div>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <p className="text-center text-gray-500 py-8">Sin datos disponibles</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
