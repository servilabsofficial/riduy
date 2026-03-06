import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  ShoppingCart,
  Truck,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCog,
  Award,
  DollarSign,
  Wallet,
  Building2,
  ClipboardList,
  ShieldCheck,
  Bell,
  Factory,
} from 'lucide-react';
import useUIStore from '../../store/uiStore';

const navSections = [
  {
    title: 'Principal',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/patients', icon: Users, label: 'Pacientes' },
      { path: '/prescriptions', icon: FileText, label: 'Recetas' },
      { path: '/appointments', icon: Calendar, label: 'Citas' },
    ],
  },
  {
    title: 'Ventas',
    items: [
      { path: '/sales', icon: ShoppingCart, label: 'Ventas' },
      { path: '/orders', icon: Truck, label: 'Pedidos Lab.' },
      { path: '/inventory', icon: Package, label: 'Inventario' },
    ],
  },
  {
    title: 'Compras',
    items: [
      { path: '/suppliers', icon: Factory, label: 'Proveedores' },
      { path: '/purchase-orders', icon: ClipboardList, label: 'Órdenes Compra' },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { path: '/finance', icon: DollarSign, label: 'Contabilidad' },
      { path: '/cash-register', icon: Wallet, label: 'Caja' },
      { path: '/commissions', icon: Award, label: 'Comisiones' },
    ],
  },
  {
    title: 'Empresa',
    items: [
      { path: '/employees', icon: UserCog, label: 'Empleados' },
      { path: '/branches', icon: Building2, label: 'Sucursales' },
      { path: '/reports', icon: BarChart3, label: 'Reportes' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { path: '/notifications', icon: Bell, label: 'Notificaciones' },
      { path: '/audit-logs', icon: ShieldCheck, label: 'Auditoría' },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Eye size={20} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap"
              >
                OptiVision
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-3 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? 'mt-1' : ''}>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            {sidebarCollapsed && idx > 0 && (
              <div className="my-1 mx-3 border-t border-gray-200 dark:border-gray-800" />
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon size={19} className="flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Colapsar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
