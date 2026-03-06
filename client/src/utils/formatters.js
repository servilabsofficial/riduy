export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount || 0);
};

export const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    READY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    DELIVERED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En proceso',
    READY: 'Listo',
    DELIVERED: 'Entregado',
    SCHEDULED: 'Agendada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  };
  return labels[status] || status;
};

export const getProductTypeLabel = (type) => {
  const labels = {
    FRAME: 'Montura',
    LENS: 'Lente',
    CONTACT_LENS: 'Lente de contacto',
    ACCESSORY: 'Accesorio',
  };
  return labels[type] || type;
};

export const getPaymentMethodLabel = (method) => {
  const labels = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  };
  return labels[method] || method;
};

export const getRoleLabel = (role) => {
  const labels = {
    ADMIN: 'Administrador',
    SELLER: 'Vendedor',
    OPTOMETRIST: 'Optometrista',
    ACCOUNTANT: 'Contador',
    RECEPTIONIST: 'Recepción',
    LAB_TECH: 'Técnico Lab.',
  };
  return labels[role] || role;
};

export const getRoleColor = (role) => {
  const colors = {
    ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    SELLER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    OPTOMETRIST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ACCOUNTANT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    RECEPTIONIST: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    LAB_TECH: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  };
  return colors[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
};

export const getExpenseCategoryLabel = (cat) => {
  const labels = {
    RENT: 'Alquiler',
    UTILITIES: 'Servicios',
    SUPPLIES: 'Insumos',
    SALARIES: 'Salarios',
    MARKETING: 'Marketing',
    MAINTENANCE: 'Mantenimiento',
    OTHER: 'Otro',
  };
  return labels[cat] || cat;
};

export const getExpenseCategoryColor = (cat) => {
  const colors = {
    RENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    UTILITIES: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    SUPPLIES: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    SALARIES: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    MARKETING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    MAINTENANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };
  return colors[cat] || 'bg-gray-100 text-gray-700';
};

export const getPurchaseOrderStatusLabel = (status) => {
  const labels = {
    DRAFT: 'Borrador',
    SENT: 'Enviado',
    RECEIVED: 'Recibido',
    CANCELLED: 'Cancelado',
  };
  return labels[status] || status;
};

export const getPurchaseOrderStatusColor = (status) => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    RECEIVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-MX').format(num || 0);
};

export const formatPercent = (num) => {
  return `${(num || 0).toFixed(1)}%`;
};
