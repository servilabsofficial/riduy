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
