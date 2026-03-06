import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import OrderForm from './OrderForm';
import { formatDate, getStatusLabel } from '../../utils/formatters';
import api from '../../utils/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const data = await api.get('/orders', params);
      setOrders(data.data);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSave = async (data) => {
    try {
      if (selected) {
        await api.put(`/orders/${selected.id}`, data);
        toast.success('Pedido actualizado');
      } else {
        await api.post('/orders', data);
        toast.success('Pedido creado');
      }
      setShowForm(false);
      setSelected(null);
      loadOrders();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (order) => {
    if (!confirm('¿Eliminar este pedido?')) return;
    try {
      await api.delete(`/orders/${order.id}`);
      toast.success('Pedido eliminado');
      loadOrders();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const columns = [
    {
      header: 'Paciente',
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.patient?.firstName} {row.patient?.lastName}
        </span>
      ),
    },
    {
      header: 'Producto',
      render: (row) => row.product?.name || '-',
    },
    { header: 'Fecha', render: (row) => formatDate(row.createdAt) },
    { header: 'Fecha estimada', render: (row) => formatDate(row.estimatedDate) },
    {
      header: 'Estado',
      render: (row) => <Badge status={row.status} />,
    },
    { header: 'Responsable', render: (row) => row.user?.name || '-' },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setSelected(row); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Edit2 size={16} className="text-blue-500" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos de Laboratorio</h1>
          <p className="text-gray-500 mt-1">Seguimiento de pedidos de lentes</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setSelected(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Pedido
        </motion.button>
      </div>

      <div className="flex gap-2">
        {['', 'PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {s ? getStatusLabel(s) : 'Todos'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={orders} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelected(null); }} title={selected ? 'Editar Pedido' : 'Nuevo Pedido'} size="lg">
        <OrderForm order={selected} onSubmit={handleSave} onCancel={() => { setShowForm(false); setSelected(null); }} />
      </Modal>
    </div>
  );
}
