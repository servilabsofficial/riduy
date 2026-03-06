import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Calendar, FileText, ShoppingBag } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';

export default function PatientDetail({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      const data = await api.get(`/patients/${patientId}`);
      setPatient(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500">Cargando...</div>;
  if (!patient) return <div className="py-8 text-center text-gray-500">Paciente no encontrado</div>;

  const tabs = [
    { id: 'info', label: 'Información' },
    { id: 'prescriptions', label: `Recetas (${patient.prescriptions?.length || 0})` },
    { id: 'sales', label: `Compras (${patient.sales?.length || 0})` },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              tab === t.id ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.div layoutId="patient-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{patient.phone || 'Sin teléfono'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{patient.email || 'Sin email'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{patient.address || 'Sin dirección'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{formatDate(patient.birthDate)}</span>
            </div>
          </div>
          {patient.notes && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              {patient.notes}
            </div>
          )}
        </motion.div>
      )}

      {tab === 'prescriptions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {patient.prescriptions?.length === 0 ? (
            <p className="py-4 text-center text-gray-500">Sin recetas registradas</p>
          ) : (
            patient.prescriptions?.map((rx) => (
              <div key={rx.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{rx.lensType || 'Receta'}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(rx.date)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <p>OD: SPH {rx.odSph} | CYL {rx.odCyl} | AXIS {rx.odAxis}</p>
                  <p>OI: SPH {rx.oiSph} | CYL {rx.oiCyl} | AXIS {rx.oiAxis}</p>
                  <p>DP: {rx.pupillaryDist}mm</p>
                  <p>Prof: {rx.professional}</p>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {tab === 'sales' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {patient.sales?.length === 0 ? (
            <p className="py-4 text-center text-gray-500">Sin compras registradas</p>
          ) : (
            patient.sales?.map((sale) => (
              <div key={sale.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-600">{formatCurrency(sale.total)}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(sale.createdAt)}</span>
                </div>
                <div className="space-y-1">
                  {sale.items?.map((item) => (
                    <p key={item.id} className="text-xs text-gray-600 dark:text-gray-400">
                      {item.quantity}x {item.product?.name} - {formatCurrency(item.subtotal)}
                    </p>
                  ))}
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
