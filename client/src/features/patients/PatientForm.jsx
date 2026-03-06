import { useForm } from 'react-hook-form';
import { Save, X } from 'lucide-react';

export default function PatientForm({ patient, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: patient ? {
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : '',
      notes: patient.notes || '',
    } : {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
          <input {...register('firstName', { required: 'Requerido' })} className="input-field" placeholder="Nombre" />
          {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido *</label>
          <input {...register('lastName', { required: 'Requerido' })} className="input-field" placeholder="Apellido" />
          {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
          <input {...register('phone')} className="input-field" placeholder="+52 55 1234 5678" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" {...register('email')} className="input-field" placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de nacimiento</label>
          <input type="date" {...register('birthDate')} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
          <input {...register('address')} className="input-field" placeholder="Dirección completa" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
        <textarea {...register('notes')} className="input-field" rows={3} placeholder="Observaciones..." />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2">
          <X size={16} /> Cancelar
        </button>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save size={16} /> {patient ? 'Actualizar' : 'Crear'} Paciente
        </button>
      </div>
    </form>
  );
}
