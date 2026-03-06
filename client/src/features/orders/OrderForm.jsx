import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import api from '../../utils/api';

export default function OrderForm({ order, onSubmit, onCancel }) {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [products, setProducts] = useState([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: order ? {
      patientId: order.patientId,
      prescriptionId: order.prescriptionId || '',
      productId: order.productId || '',
      status: order.status,
      notes: order.notes || '',
      estimatedDate: order.estimatedDate ? new Date(order.estimatedDate).toISOString().split('T')[0] : '',
    } : { status: 'PENDING' },
  });

  const patientId = watch('patientId');

  useEffect(() => {
    Promise.all([
      api.get('/patients', { limit: 200 }),
      api.get('/products', { limit: 200 }),
    ]).then(([p, pr]) => {
      setPatients(p.data || []);
      setProducts(pr.data || []);
    });
  }, []);

  useEffect(() => {
    if (patientId) {
      api.get('/prescriptions', { patientId, limit: 50 }).then((data) => setPrescriptions(data.data || [])).catch(() => {});
    }
  }, [patientId]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!order && (
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receta</label>
          <select {...register('prescriptionId')} className="input-field">
            <option value="">Sin receta</option>
            {prescriptions.map((rx) => (
              <option key={rx.id} value={rx.id}>{rx.lensType} - {new Date(rx.date).toLocaleDateString()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Producto</label>
          <select {...register('productId')} className="input-field">
            <option value="">Seleccionar...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
          <select {...register('status')} className="input-field">
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En proceso</option>
            <option value="READY">Listo</option>
            <option value="DELIVERED">Entregado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha estimada</label>
          <input type="date" {...register('estimatedDate')} className="input-field" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
        <textarea {...register('notes')} className="input-field" rows={2} placeholder="Observaciones..." />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2"><X size={16} /> Cancelar</button>
        <button type="submit" className="btn-primary flex items-center gap-2"><Save size={16} /> {order ? 'Actualizar' : 'Crear'} Pedido</button>
      </div>
    </form>
  );
}
