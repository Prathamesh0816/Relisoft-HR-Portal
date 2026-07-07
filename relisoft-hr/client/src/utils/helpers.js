export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
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
  const map = {
    active: 'badge-success',
    approved: 'badge-success',
    completed: 'badge-success',
    pending: 'badge-warning',
    review: 'badge-warning',
    draft: 'badge-gray',
    rejected: 'badge-danger',
    cancelled: 'badge-danger',
    archived: 'badge-gray',
    inactive: 'badge-gray',
    open: 'badge-info',
    progress: 'badge-info',
  };
  return map[status?.toLowerCase()] || 'badge-gray';
};

export const truncate = (str, len = 50) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
