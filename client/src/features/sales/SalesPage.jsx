import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import NewSaleForm from './NewSaleForm';
import SaleTicket from './SaleTicket';
import { formatCurrency, formatDateTime, getPaymentMethodLabel } from '../../utils/formatters';
import api from '../../utils/api';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNewSale, setShowNewSale] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/sales', { page, limit: 15 });
      setSales(data.data);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleCreateSale = async (data) => {
    try {
      const sale = await api.post('/sales', data);
      toast.success('Venta registrada');
      setShowNewSale(false);
      setSelectedSale(sale);
      setShowTicket(true);
      loadSales();
    } catch {
      toast.error('Error al crear venta');
    }
  };

  const paymentColors = {
    CASH: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CARD: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TRANSFER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
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
    { header: 'Fecha', render: (row) => formatDateTime(row.createdAt) },
    { header: 'Productos', render: (row) => row.items?.length || 0 },
    { header: 'Subtotal', render: (row) => formatCurrency(row.subtotal) },
    {
      header: 'Descuento',
      render: (row) => row.discount > 0 ? <span className="text-red-500">-{formatCurrency(row.discount)}</span> : '-',
    },
    { header: 'Total', render: (row) => <span className="font-semibold text-green-600">{formatCurrency(row.total)}</span> },
    {
      header: 'Pago',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${paymentColors[row.paymentMethod]}`}>
          {getPaymentMethodLabel(row.paymentMethod)}
        </span>
      ),
    },
    {
      header: 'Acciones',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedSale(row); setShowTicket(true); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Eye size={16} className="text-gray-500" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ventas</h1>
          <p className="text-gray-500 mt-1">Registro y gestión de ventas</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewSale(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Venta
        </motion.button>
      </div>

      <DataTable columns={columns} data={sales} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showNewSale} onClose={() => setShowNewSale(false)} title="Nueva Venta" size="xl">
        <NewSaleForm onSubmit={handleCreateSale} onCancel={() => setShowNewSale(false)} />
      </Modal>

      <Modal isOpen={showTicket} onClose={() => { setShowTicket(false); setSelectedSale(null); }} title="Ticket de Venta" size="md">
        {selectedSale && <SaleTicket sale={selectedSale} />}
      </Modal>
    </div>
  );
}
