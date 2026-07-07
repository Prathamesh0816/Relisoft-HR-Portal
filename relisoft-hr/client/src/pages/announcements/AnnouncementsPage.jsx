import { useState, useEffect } from 'react';
import { Megaphone, Plus, Pin, X, Loader2, MessageCircle, ThumbsUp, Send, Calendar, User, Building2, Bell, Cake } from 'lucide-react';
import { socialAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const demoAnnouncements = [
  { _id: 'ad1', employee: { firstName: 'Priya', lastName: 'Sharma' }, content: '🎉 Q3 Town Hall is scheduled for July 15th at 3:00 PM in the main conference room. All employees must attend. Agenda includes quarterly results, new product launch, and team awards.\n\nLunch will be provided!', pinned: true, likes: [{ _id: 'l1' }, { _id: 'l2' }, { _id: 'l3' }, { _id: 'l4' }], comments: [{ employee: { firstName: 'Arun', lastName: 'Kumar' }, content: 'Will there be a virtual option?' }, { employee: { firstName: 'Priya', lastName: 'Sharma' }, content: 'Yes Arun, Zoom link will be shared closer to the date.' }], createdAt: '2026-07-06T09:00:00Z' },
  { _id: 'ad2', employee: { firstName: 'HR', lastName: 'Team' }, content: '📢 New Health Insurance Plans are now live! Visit the Benefits portal to compare plans and enroll. Deadline: July 20th.\n\nKey changes:\n• Increased coverage for dental\n• New mental wellness program\n• Lower deductibles for family plans', pinned: false, likes: [{ _id: 'l5' }, { _id: 'l6' }], comments: [{ employee: { firstName: 'Neha', lastName: 'Patel' }, content: 'Great news! The mental wellness addition is much needed.' }], createdAt: '2026-07-05T14:00:00Z' },
  { _id: 'ad3', employee: { firstName: 'IT', lastName: 'Desk' }, content: '🖥️ Scheduled server maintenance this Saturday (July 11) from 10 PM to 2 AM. The HR portal and email may be intermittently unavailable.\n\nPlease save your work before leaving on Friday.', pinned: false, likes: [{ _id: 'l7' }], comments: [], createdAt: '2026-07-04T11:30:00Z' },
  { _id: 'ad4', employee: { firstName: 'Admin', lastName: 'Team' }, content: '🏏 ReliSoft Cricket Tournament 2026 registrations are now open! Team sizes: 8 members per team. Matches will be held on weekends.\n\nRegister via the Sports Club portal by July 18th. Winners get a trophy + cash prize!', pinned: false, likes: [{ _id: 'l8' }, { _id: 'l9' }, { _id: 'l10' }], comments: [{ employee: { firstName: 'Vikram', lastName: 'Joshi' }, content: 'Count me in! 🏏' }, { employee: { firstName: 'Sneha', lastName: 'Gupta' }, content: 'Let us form a team from HR!' }], createdAt: '2026-07-03T08:00:00Z' },
  { _id: 'ad5', employee: { firstName: 'Finance', lastName: 'Team' }, content: '💰 July salary advances can be requested until the 15th. Use the Salary Advance module in the portal. Maximum advance: 50% of monthly salary. Repayment over 3 months.', pinned: false, likes: [], comments: [], createdAt: '2026-07-02T10:00:00Z' },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(demoAnnouncements);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ content: '', visibility: 'all' });
  const [expandedId, setExpandedId] = useState(null);
  const [commentText, setCommentText] = useState({});

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await socialAPI.getPosts({ type: 'announcement', limit: 50 });
      const list = data?.data || data || [];
      if (list.length > 0) setAnnouncements(list);
    } catch {}
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await socialAPI.createPost({ ...form, type: 'announcement' });
      toast.success('Announcement posted');
      setShowCreate(false);
      setForm({ content: '', visibility: 'all' });
      fetchAnnouncements();
    } catch (err) {
      const newAnn = { _id: 'na' + Date.now(), employee: { firstName: 'You', lastName: '' }, content: form.content, pinned: false, likes: [], comments: [], createdAt: new Date().toISOString() };
      setAnnouncements([newAnn, ...announcements]);
      setShowCreate(false);
      setForm({ content: '', visibility: 'all' });
      toast.success('Announcement posted (offline)');
    }
  };

  const handleLike = async (id) => {
    try {
      const { data } = await socialAPI.likePost(id);
      const updated = data?.data || data;
      setAnnouncements((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch {
      setAnnouncements((prev) => prev.map((a) => a._id === id ? { ...a, likes: [...a.likes, { _id: 'tmp' }] } : a));
    }
  };

  const handleComment = async (id) => {
    const text = commentText[id];
    if (!text?.trim()) return;
    try {
      await socialAPI.addComment(id, { content: text });
      toast.success('Comment added');
      setCommentText({ ...commentText, [id]: '' });
      fetchAnnouncements();
    } catch {
      setAnnouncements((prev) => prev.map((a) => a._id === id ? { ...a, comments: [...(a.comments || []), { employee: { firstName: 'You', lastName: '' }, content: text }] } : a));
      setCommentText({ ...commentText, [id]: '' });
      toast.success('Comment added (offline)');
    }
  };

  const pinned = announcements.filter(a => a.pinned);
  const unpinned = announcements.filter(a => !a.pinned);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📢 Announcements</h1>
            <p className="text-gray-500 mt-1">Company-wide announcements and updates</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Megaphone size={18} /> New Announcement
          </button>
        </div>

        {pinned.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Pin size={14} className="text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pinned</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              {pinned.map((a) => (
                <div key={a._id} className="flex items-start gap-3">
                  <Megaphone size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.employee?.firstName} {a.employee?.lastName}</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {[...pinned, ...unpinned].map((a) => (
            <div key={a._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'var(--moss)' }}>
                    {a.employee?.firstName?.[0]}{a.employee?.lastName?.[0] || 'R'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{a.employee?.firstName} {a.employee?.lastName}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: 'var(--moss)', opacity: 0.9 }}>
                        <Megaphone size={10} className="inline mr-1" />Announcement
                      </span>
                      {a.pinned && <Pin size={14} className="text-amber-500" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={10} /> {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{a.content}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><ThumbsUp size={12} /> {a.likes?.length || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {a.comments?.length || 0}</span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleLike(a._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                    <ThumbsUp size={14} /> Like
                  </button>
                  <button onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                    <MessageCircle size={14} /> Comment
                  </button>
                </div>

                {expandedId === a._id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                    {(a.comments || []).map((c, ci) => (
                      <div key={ci} className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                          {c.employee?.firstName?.[0]}{c.employee?.lastName?.[0] || '?'}
                        </div>
                        <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                          <span className="text-xs font-semibold text-gray-900">{c.employee?.firstName} {c.employee?.lastName}</span>
                          <p className="text-sm text-gray-600">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input type="text" value={commentText[a._id] || ''} onChange={(e) => setCommentText({ ...commentText, [a._id]: e.target.value })}
                        placeholder="Write a comment..." className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-relisoft-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(a._id)} />
                      <button onClick={() => handleComment(a._id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--moss)' }}>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Announcement 📢" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Announcement</label>
            <textarea className="input-field" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Type your announcement here...&#10;&#10;Tip: Use emojis to make it engaging! 🎉📢🚀" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
            <select className="input-field" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="department">My Department</option>
              <option value="team">My Team</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><Send size={16} /> Post Announcement</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
