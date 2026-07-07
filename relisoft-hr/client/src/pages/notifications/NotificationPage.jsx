import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, CheckCheck, ChevronLeft, ChevronRight, Inbox, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const typeConfig = {
  in_app: { icon: Bell, color: 'text-relisoft-600', bg: 'bg-relisoft-100' },
  email: { icon: Mail, color: 'text-relisoft-600', bg: 'bg-relisoft-100' },
  sms: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
  whatsapp: { icon: Smartphone, color: 'text-green-600', bg: 'bg-green-100' },
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (filterType !== 'all') params.type = filterType;
      const { data } = await notificationAPI.getAll(params);
      const list = Array.isArray(data) ? data : data.data || [];
      setNotifications(list);
      setTotalPages(data.totalPages || Math.ceil((data.total || list.length) / pageSize) || 1);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [filterType]);
  useEffect(() => { fetchNotifications(); }, [filterType, page]);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const types = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'in_app', label: 'In-App', icon: Bell },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'sms', label: 'SMS', icon: MessageSquare },
    { key: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
  ];

  const getIcon = (type) => {
    const cfg = typeConfig[type] || typeConfig.in_app;
    const Icon = cfg.icon;
    return (
      <div className={`p-2 rounded-lg ${cfg.bg}`}>
        <Icon size={18} className={cfg.color} />
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Notification Center</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2"><CheckCheck size={18} /> Mark All Read</button>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {types.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${filterType === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse flex gap-4 items-start">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="card text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div
              key={n._id || i}
              onClick={() => !n.read && handleMarkRead(n._id)}
              className={`card flex items-start gap-4 cursor-pointer transition-all hover:shadow-md ${!n.read ? 'border-l-4 border-l-relisoft-500 bg-relisoft-50/30' : ''}`}
            >
              {getIcon(n.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>{n.title}</h3>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-relisoft-500 flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-400 mt-2">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="btn-secondary flex items-center gap-1 disabled:opacity-50"><ChevronLeft size={16} /> Prev</button>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="btn-secondary flex items-center gap-1 disabled:opacity-50">Next <ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
