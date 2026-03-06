import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import api from '../../utils/api';

export default function PrescriptionForm({ prescription, onSubmit, onCancel }) {
  const [patients, setPatients] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: prescription ? {
      patientId: prescription.patientId,
      odSph: prescription.odSph,
      odCyl: prescription.odCyl,
      odAxis: prescription.odAxis,
      oiSph: prescription.oiSph,
      oiCyl: prescription.oiCyl,
      oiAxis: prescription.oiAxis,
      pupillaryDist: prescription.pupillaryDist,
      lensType: prescription.lensType || '',
      observations: prescription.observations || '',
      professional: prescription.professional || '',
      date: prescription.date ? new Date(prescription.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    } : {
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    api.get('/patients', { limit: 200 }).then((data) => setPatients(data.data || [])).catch(() => {});
  }, []);

  const processData = (data) => {
    const numFields = ['odSph', 'odCyl', 'odAxis', 'oiSph', 'oiCyl', 'oiAxis', 'pupillaryDist'];
    const processed = { ...data };
    numFields.forEach((f) => {
      processed[f] = processed[f] !== '' && processed[f] != null ? Number(processed[f]) : null;
    });
    return processed;
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(processData(data)))} className="space-y-6">
      {/* Patient + date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!prescription && (
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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
          <input type="date" {...register('date')} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profesional</label>
          <input {...register('professional')} className="input-field" placeholder="Dr..." />
        </div>
      </div>

      {/* Eyes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OD */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ojo Derecho (OD)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">SPH</label>
              <input type="number" step="0.25" {...register('odSph')} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CYL</label>
              <input type="number" step="0.25" {...register('odCyl')} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">AXIS</label>
              <input type="number" step="1" {...register('odAxis')} className="input-field" placeholder="0" />
            </div>
          </div>
        </div>
        {/* OI */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ojo Izquierdo (OI)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">SPH</label>
              <input type="number" step="0.25" {...register('oiSph')} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CYL</label>
              <input type="number" step="0.25" {...register('oiCyl')} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">AXIS</label>
              <input type="number" step="1" {...register('oiAxis')} className="input-field" placeholder="0" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distancia pupilar (mm)</label>
          <input type="number" step="0.5" {...register('pupillaryDist')} className="input-field" placeholder="64" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de lente</label>
          <select {...register('lensType')} className="input-field">
            <option value="">Seleccionar...</option>
            <option value="Monofocal">Monofocal</option>
            <option value="Bifocal">Bifocal</option>
            <option value="Progresivo">Progresivo</option>
            <option value="Lentes de contacto">Lentes de contacto</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
        <textarea {...register('observations')} className="input-field" rows={2} placeholder="Observaciones..." />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2">
          <X size={16} /> Cancelar
        </button>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save size={16} /> {prescription ? 'Actualizar' : 'Guardar'} Receta
        </button>
      </div>
    </form>
  );
}
