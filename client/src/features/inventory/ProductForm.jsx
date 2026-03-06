import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import api from '../../utils/api';

export default function ProductForm({ product, onSubmit, onCancel }) {
  const [suppliers, setSuppliers] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product ? {
      name: product.name,
      brand: product.brand || '',
      type: product.type,
      price: product.price,
      cost: product.cost || 0,
      stock: product.stock,
      minStock: product.minStock,
      supplierId: product.supplierId || '',
    } : { type: 'FRAME', stock: 0, minStock: 5, cost: 0 },
  });

  useEffect(() => {
    api.get('/suppliers').then(setSuppliers).catch(() => {});
  }, []);

  const processData = (data) => ({
    ...data,
    price: Number(data.price),
    cost: Number(data.cost),
    stock: Number(data.stock),
    minStock: Number(data.minStock),
    supplierId: data.supplierId || null,
  });

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(processData(d)))} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
          <input {...register('name', { required: 'Requerido' })} className="input-field" placeholder="Nombre del producto" />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
          <input {...register('brand')} className="input-field" placeholder="Marca" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo *</label>
          <select {...register('type', { required: 'Requerido' })} className="input-field">
            <option value="FRAME">Montura</option>
            <option value="LENS">Lente</option>
            <option value="CONTACT_LENS">Lente de contacto</option>
            <option value="ACCESSORY">Accesorio</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
          <select {...register('supplierId')} className="input-field">
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio *</label>
          <input type="number" step="0.01" {...register('price', { required: 'Requerido', min: 0 })} className="input-field" placeholder="0.00" />
          {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costo</label>
          <input type="number" step="0.01" {...register('cost', { min: 0 })} className="input-field" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
          <input type="number" {...register('stock', { min: 0 })} className="input-field" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock mínimo</label>
          <input type="number" {...register('minStock', { min: 0 })} className="input-field" placeholder="5" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2">
          <X size={16} /> Cancelar
        </button>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save size={16} /> {product ? 'Actualizar' : 'Crear'} Producto
        </button>
      </div>
    </form>
  );
}
