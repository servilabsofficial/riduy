import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import api from '../../utils/api';

export default function AppointmentForm({ appointment, onSubmit, onCancel }) {
  const [patients, setPatients] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: appointment ? {
      patientId: appointment.patientId,
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
      time: appointment.time,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes || '',
    } : {
      date: new Date().toISOString().split('T')[0],
      status: 'SCHEDULED',
      type: 'Examen visual',
    },
  });

  useEffect(() => {
    api.get('/patients', { limit: 200 }).then((data) => setPatients(data.data || [])).catch(() => {});
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!appointment && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paciente *</label>
          <select {...register('patientId', { required: 'Requerido' })} className="input-field">
            <option value="">Seleccionar...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
          {errors.patientId && <p className="mt-1 text-sm text-red-500">{errors.patientId.message}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha *</label>
          <input type="date" {...register('date', { required: 'Requerido' })} className="input-field" />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora *</label>
          <input type="time" {...register('time', { required: 'Requerido' })} className="input-field" />
          {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo *</label>
          <select {...register('type', { required: 'Requerido' })} className="input-field">
            <option value="Examen visual">Examen visual</option>
            <option value="Consulta">Consulta</option>
            <option value="Control">Control</option>
            <option value="Ajuste de lentes">Ajuste de lentes</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
          <select {...register('status')} className="input-field">
            <option value="SCHEDULED">Agendada</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
        <textarea {...register('notes')} className="input-field" rows={2} placeholder="Observaciones..." />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2"><X size={16} /> Cancelar</button>
        <button type="submit" className="btn-primary flex items-center gap-2"><Save size={16} /> {appointment ? 'Actualizar' : 'Crear'} Cita</button>
      </div>
    </form>
  );
}
