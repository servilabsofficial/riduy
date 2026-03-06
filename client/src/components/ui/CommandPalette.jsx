import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Package, ShoppingCart, FileText, Calendar, UserCog,
  LayoutDashboard, BarChart3, Truck, DollarSign, Building2, X,
} from 'lucide-react';
import api from '../../utils/api';

const quickActions = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', section: 'Navegar' },
  { label: 'Pacientes', icon: Users, path: '/patients', section: 'Navegar' },
  { label: 'Ventas', icon: ShoppingCart, path: '/sales', section: 'Navegar' },
  { label: 'Inventario', icon: Package, path: '/inventory', section: 'Navegar' },
  { label: 'Recetas', icon: FileText, path: '/prescriptions', section: 'Navegar' },
  { label: 'Citas', icon: Calendar, path: '/appointments', section: 'Navegar' },
  { label: 'Pedidos Lab.', icon: Truck, path: '/orders', section: 'Navegar' },
  { label: 'Empleados', icon: UserCog, path: '/employees', section: 'Navegar' },
  { label: 'Contabilidad', icon: DollarSign, path: '/finance', section: 'Navegar' },
  { label: 'Reportes', icon: BarChart3, path: '/reports', section: 'Navegar' },
  { label: 'Sucursales', icon: Building2, path: '/branches', section: 'Navegar' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get('/search', { q: query });
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = query.length < 2
    ? quickActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const allItems = [...filtered, ...results];

  const handleSelect = (item) => {
    setOpen(false);
    if (item.path) navigate(item.path);
    else if (item.url) navigate(item.url);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      handleSelect(allItems[selectedIndex]);
    }
  };

  const typeIcons = { patient: Users, product: Package, employee: UserCog, prescription: FileText };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Buscar pacientes, productos, navegar..."
                className="flex-1 py-4 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">Buscando...</div>
              )}

              {!loading && allItems.length === 0 && query.length >= 2 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">No se encontraron resultados</div>
              )}

              {!loading && query.length < 2 && filtered.length > 0 && (
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Accesos rápidos
                </div>
              )}

              {!loading && allItems.map((item, idx) => {
                const Icon = item.icon || typeIcons[item.type] || Search;
                return (
                  <button
                    key={item.id || item.label || idx}
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      idx === selectedIndex
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon size={18} className="flex-shrink-0 opacity-60" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title || item.label}</p>
                      {item.subtitle && <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>}
                    </div>
                    {item.type && (
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 flex-shrink-0">
                        {item.type === 'patient' ? 'Paciente' : item.type === 'product' ? 'Producto' : item.type === 'employee' ? 'Empleado' : 'Receta'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">↑↓</kbd> navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">↵</kbd> seleccionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">Ctrl+K</kbd> abrir/cerrar
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
