import { useState, useEffect } from 'react';
import { Award, Star, Heart, ThumbsUp, MessageCircle, Send, Plus, X, Loader2, Search, User, Sparkles } from 'lucide-react';
import { socialAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const demoRecognitions = [
  { _id: 'rd1', employee: { firstName: 'Priya', lastName: 'Sharma' }, content: 'Huge shoutout to Priya for single-handedly debugging that critical production issue at 2 AM! You are a rockstar! 🌟', likes: [{ _id: 'l1' }, { _id: 'l2' }, { _id: 'l3' }, { _id: 'l4' }, { _id: 'l5' }], comments: [{ _id: 'c1', employee: { firstName: 'Rahul', lastName: 'Verma' }, content: 'Absolutely deserved!' }, { _id: 'c2', employee: { firstName: 'Neha', lastName: 'Patel' }, content: 'Priya is amazing! 🎉' }], createdAt: '2026-07-05T14:30:00Z' },
  { _id: 'rd2', employee: { firstName: 'Arun', lastName: 'Kumar' }, content: 'Arun completed the Q3 financial audit ahead of schedule with zero errors. Incredible attention to detail! 📊', likes: [{ _id: 'l6' }, { _id: 'l7' }, { _id: 'l8' }], comments: [{ _id: 'c3', employee: { firstName: 'Sneha', lastName: 'Gupta' }, content: 'Well done Arun! 👏' }], createdAt: '2026-07-04T11:00:00Z' },
  { _id: 'rd3', employee: { firstName: 'Neha', lastName: 'Patel' }, content: 'Neha ran the most successful marketing campaign we have ever seen! 200% lead generation increase! 🚀', likes: [{ _id: 'l9' }, { _id: 'l10' }, { _id: 'l11' }, { _id: 'l12' }], comments: [], createdAt: '2026-07-03T09:15:00Z' },
  { _id: 'rd4', employee: { firstName: 'Rahul', lastName: 'Verma' }, content: 'Rahul volunteered to mentor 3 new joinees this month while managing his own project load. True leadership! 🙌', likes: [{ _id: 'l13' }, { _id: 'l14' }], comments: [{ _id: 'c4', employee: { firstName: 'Priya', lastName: 'Sharma' }, content: 'Rahul is the best mentor! 💪' }], createdAt: '2026-07-02T16:45:00Z' },
  { _id: 'rd5', employee: { firstName: 'Sneha', lastName: 'Gupta' }, content: 'Sneha designed the new onboarding experience and it has received fantastic feedback from all new hires! ✨', likes: [{ _id: 'l15' }, { _id: 'l16' }, { _id: 'l17' }], comments: [], createdAt: '2026-07-01T10:30:00Z' },
  { _id: 'rd6', employee: { firstName: 'Vikram', lastName: 'Joshi' }, content: 'Vikram went above and beyond helping the design team with their tool migration. Team player of the month! 🏆', likes: [{ _id: 'l18' }, { _id: 'l19' }], comments: [{ _id: 'c5', employee: { firstName: 'Arun', lastName: 'Kumar' }, content: 'Vikram always steps up! ⭐' }], createdAt: '2026-06-28T08:00:00Z' },
];

export default function RecognitionPage() {
  const [recognitions, setRecognitions] = useState(demoRecognitions);
  const [loading, setLoading] = useState(true);
  const [showGive, setShowGive] = useState(false);
  const [form, setForm] = useState({ content: '', visibility: 'all' });
  const [liking, setLiking] = useState(null);

  useEffect(() => { fetchRecognitions(); }, []);

  const fetchRecognitions = async () => {
    setLoading(true);
    try {
      const { data } = await socialAPI.getPosts({ type: 'recognition', limit: 50 });
      const list = data?.data || data || [];
      if (list.length > 0) setRecognitions(list);
    } catch {}
    finally { setLoading(false); }
  };

  const handleGive = async (e) => {
    e.preventDefault();
    try {
      await socialAPI.createPost({ ...form, type: 'recognition' });
      toast.success('Recognition shared!');
      setShowGive(false);
      setForm({ content: '', visibility: 'all' });
      fetchRecognitions();
    } catch (err) {
      const newRec = { _id: 'nr' + Date.now(), employee: { firstName: 'You', lastName: '' }, content: form.content, likes: [], comments: [], createdAt: new Date().toISOString() };
      setRecognitions([newRec, ...recognitions]);
      setShowGive(false);
      setForm({ content: '', visibility: 'all' });
      toast.success('Recognition shared! (offline)');
    }
  };

  const handleLike = async (id) => {
    setLiking(id);
    try {
      const { data } = await socialAPI.likePost(id);
      const updated = data?.data || data;
      setRecognitions((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch {
      setRecognitions((prev) => prev.map((r) => r._id === id ? { ...r, likes: r.likes?.includes?.('me') ? r.likes.filter(l => l !== 'me') : [...(r.likes || []), 'me'] } : r));
    }
    finally { setLiking(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recognition Wall 🏆</h1>
            <p className="text-gray-500 mt-1">Celebrate and appreciate your colleagues</p>
          </div>
          <button onClick={() => setShowGive(true)} className="btn-primary flex items-center gap-2">
            <Award size={18} /> Give Recognition
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recognitions.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'var(--gold)' }}>
                  {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{r.employee?.firstName} {r.employee?.lastName}</p>
                  <p className="text-xs text-gray-400">{r.employee?.employeeId || 'ReliSoft'}</p>
                </div>
                <Star className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">{r.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><ThumbsUp size={12} /> {r.likes?.length || 0}</span>
                <span className="flex items-center gap-1"><MessageCircle size={12} /> {r.comments?.length || 0}</span>
                <span className="flex items-center gap-1"><Sparkles size={12} /> {new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => handleLike(r._id)} disabled={liking === r._id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    r.likes?.includes?.('me') ? 'text-pink-600 bg-pink-50' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
                  <ThumbsUp size={14} /> Like
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                  <Heart size={14} /> Appreciate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showGive} onClose={() => setShowGive(false)} title="Give Recognition ⭐" size="md">
        <form onSubmit={handleGive} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recognition Message</label>
            <textarea className="input-field" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Tag @colleague and tell them what you appreciate..." required />
            <p className="text-xs text-gray-400 mt-1">Tip: Start with @ to mention a colleague</p>
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
            <button type="button" onClick={() => setShowGive(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><Send size={16} /> Share Recognition</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
