import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, Mail, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import PatientForm from './PatientForm';
import PatientDetail from './PatientDetail';
import { formatDate } from '../../utils/formatters';
import api from '../../utils/api';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const data = await api.get('/patients', params);
      setPatients(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleDelete = async (patient) => {
    if (!confirm(`¿Eliminar a ${patient.firstName} ${patient.lastName}?`)) return;
    try {
      await api.delete(`/patients/${patient.id}`);
      toast.success('Paciente eliminado');
      loadPatients();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleSave = async (data) => {
    try {
      if (selected) {
        await api.put(`/patients/${selected.id}`, data);
        toast.success('Paciente actualizado');
      } else {
        await api.post('/patients', data);
        toast.success('Paciente creado');
      }
      setShowForm(false);
      setSelected(null);
      loadPatients();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const columns = [
    {
      header: 'Paciente',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.firstName} {row.lastName}</p>
          {row.email && <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} />{row.email}</p>}
        </div>
      ),
    },
    {
      header: 'Teléfono',
      render: (row) => row.phone ? (
        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Phone size={14} />{row.phone}</span>
      ) : '-',
    },
    { header: 'Nacimiento', render: (row) => formatDate(row.birthDate) },
    { header: 'Recetas', render: (row) => row._count?.prescriptions || 0 },
    { header: 'Compras', render: (row) => row._count?.sales || 0 },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setSelected(row); setShowDetail(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Eye size={16} className="text-gray-500" />
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pacientes</h1>
          <p className="text-gray-500 mt-1">Gestión de pacientes de la óptica</p>
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
          Nuevo Paciente
        </motion.button>
      </div>

      <div className="max-w-sm">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar pacientes..." />
      </div>

      <DataTable
        columns={columns}
        data={patients}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelected(null); }} title={selected ? 'Editar Paciente' : 'Nuevo Paciente'} size="lg">
        <PatientForm patient={selected} onSubmit={handleSave} onCancel={() => { setShowForm(false); setSelected(null); }} />
      </Modal>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelected(null); }} title="Detalle del Paciente" size="xl">
        {selected && <PatientDetail patientId={selected.id} />}
      </Modal>
    </div>
  );
}
