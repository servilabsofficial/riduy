import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import ProductForm from './ProductForm';
import { formatCurrency, getProductTypeLabel } from '../../utils/formatters';
import api from '../../utils/api';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const data = await api.get('/products', params);
      setProducts(data.data);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSave = async (data) => {
    try {
      if (selected) {
        await api.put(`/products/${selected.id}`, data);
        toast.success('Producto actualizado');
      } else {
        await api.post('/products', data);
        toast.success('Producto creado');
      }
      setShowForm(false);
      setSelected(null);
      loadProducts();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`¿Desactivar "${product.name}"?`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      toast.success('Producto desactivado');
      loadProducts();
    } catch {
      toast.error('Error al desactivar');
    }
  };

  const typeColors = {
    FRAME: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    LENS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CONTACT_LENS: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    ACCESSORY: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  const columns = [
    {
      header: 'Producto',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
          {row.brand && <p className="text-xs text-gray-500">{row.brand}</p>}
        </div>
      ),
    },
    {
      header: 'Tipo',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[row.type]}`}>
          {getProductTypeLabel(row.type)}
        </span>
      ),
    },
    { header: 'Precio', render: (row) => <span className="font-medium">{formatCurrency(row.price)}</span> },
    {
      header: 'Stock',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`font-medium ${row.stock <= row.minStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
            {row.stock}
          </span>
          {row.stock <= row.minStock && <AlertTriangle size={14} className="text-red-500" />}
        </div>
      ),
    },
    { header: 'Proveedor', render: (row) => row.supplier?.name || '-' },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario</h1>
          <p className="text-gray-500 mt-1">Gestión de productos y stock</p>
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
          Nuevo Producto
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-72">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar productos..." />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">Todos los tipos</option>
          <option value="FRAME">Monturas</option>
          <option value="LENS">Lentes</option>
          <option value="CONTACT_LENS">Lentes de contacto</option>
          <option value="ACCESSORY">Accesorios</option>
        </select>
      </div>

      <DataTable columns={columns} data={products} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelected(null); }} title={selected ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
        <ProductForm product={selected} onSubmit={handleSave} onCancel={() => { setShowForm(false); setSelected(null); }} />
      </Modal>
    </div>
  );
}
