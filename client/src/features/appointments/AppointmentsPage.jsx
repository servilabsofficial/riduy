import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import AppointmentForm from './AppointmentForm';
import { formatDate, getStatusLabel } from '../../utils/formatters';
import api from '../../utils/api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const data = await api.get('/appointments', params);
      setAppointments(data.data);
    } catch {
      toast.error('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleSave = async (data) => {
    try {
      if (selected) {
        await api.put(`/appointments/${selected.id}`, data);
        toast.success('Cita actualizada');
      } else {
        await api.post('/appointments', data);
        toast.success('Cita creada');
      }
      setShowForm(false);
      setSelected(null);
      loadAppointments();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (apt) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await api.delete(`/appointments/${apt.id}`);
      toast.success('Cita eliminada');
      loadAppointments();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const groupByDate = (items) => {
    const groups = {};
    items.forEach((item) => {
      const date = new Date(item.date).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(appointments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda de Citas</h1>
          <p className="text-gray-500 mt-1">Exámenes visuales y consultas</p>
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
          Nueva Cita
        </motion.button>
      </div>

      <div className="flex gap-2">
        {['', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {s ? getStatusLabel(s) : 'Todas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4"><div className="skeleton h-16 rounded" /></div>
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center text-gray-500">No hay citas registradas</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <motion.div key={date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-primary-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{formatDate(date)}</h3>
                <span className="text-xs text-gray-500">({items.length} citas)</span>
              </div>
              <div className="space-y-2">
                {items.map((apt) => (
                  <motion.div
                    key={apt.id}
                    whileHover={{ x: 4 }}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg">
                        <Clock size={14} />
                        {apt.time}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{apt.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={apt.status} />
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelected(apt); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <Edit2 size={16} className="text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(apt)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelected(null); }} title={selected ? 'Editar Cita' : 'Nueva Cita'} size="md">
        <AppointmentForm appointment={selected} onSubmit={handleSave} onCancel={() => { setShowForm(false); setSelected(null); }} />
      </Modal>
    </div>
  );
}
