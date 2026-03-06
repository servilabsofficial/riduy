import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye as EyeIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import PrescriptionForm from './PrescriptionForm';
import { formatDate } from '../../utils/formatters';
import api from '../../utils/api';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/prescriptions', { page, limit: 15 });
      setPrescriptions(data.data);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Error al cargar recetas');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const handleSave = async (data) => {
    try {
      if (selected) {
        await api.put(`/prescriptions/${selected.id}`, data);
        toast.success('Receta actualizada');
      } else {
        await api.post('/prescriptions', data);
        toast.success('Receta creada');
      }
      setShowForm(false);
      setSelected(null);
      loadPrescriptions();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (rx) => {
    if (!confirm('¿Eliminar esta receta?')) return;
    try {
      await api.delete(`/prescriptions/${rx.id}`);
      toast.success('Receta eliminada');
      loadPrescriptions();
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
    { header: 'Fecha', render: (row) => formatDate(row.date) },
    {
      header: 'OD (SPH/CYL/AXIS)',
      render: (row) => (
        <span className="text-sm font-mono">{row.odSph ?? '-'} / {row.odCyl ?? '-'} / {row.odAxis ?? '-'}</span>
      ),
    },
    {
      header: 'OI (SPH/CYL/AXIS)',
      render: (row) => (
        <span className="text-sm font-mono">{row.oiSph ?? '-'} / {row.oiCyl ?? '-'} / {row.oiAxis ?? '-'}</span>
      ),
    },
    { header: 'Tipo lente', accessor: 'lensType' },
    { header: 'Profesional', accessor: 'professional' },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recetas Oftalmológicas</h1>
          <p className="text-gray-500 mt-1">Gestión de recetas de pacientes</p>
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
          Nueva Receta
        </motion.button>
      </div>

      <DataTable columns={columns} data={prescriptions} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelected(null); }} title={selected ? 'Editar Receta' : 'Nueva Receta'} size="xl">
        <PrescriptionForm prescription={selected} onSubmit={handleSave} onCancel={() => { setShowForm(false); setSelected(null); }} />
      </Modal>
    </div>
  );
}
