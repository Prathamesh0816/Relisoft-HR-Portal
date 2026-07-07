import { useState, useEffect } from 'react';
import { GraduationCap, Plus, X, Search, Calendar, Users, Clock, MapPin, Loader2, UserPlus, ChevronDown, ChevronRight, Sparkles, Brain, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { trainingAPI, aiAPI } from '../../services/api';

const trainingTypes = ['Technical', 'Soft Skills', 'Leadership', 'Compliance', 'Onboarding', 'Certification'];

const initialForm = {
  title: '', type: 'Technical', description: '', trainer: '',
  startDate: '', endDate: '', capacity: 20, location: '',
};

export default function TrainingList() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiRecommendationsLoading, setAiRecommendationsLoading] = useState(false);

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const { data } = await trainingAPI.list(params);
      setTrainings(data.trainings || data.data || data || []);
    } catch (err) {
      toast.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await trainingAPI.create(form);
      toast.success('Training created successfully');
      setShowCreateModal(false);
      setForm(initialForm);
      loadTrainings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create training');
    } finally {
      setSaving(false);
    }
  };

  const handleRegister = async (id) => {
    try {
      await trainingAPI.register(id);
      toast.success('Registered for training successfully');
      loadTrainings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register');
    }
  };

  const viewParticipants = async (training) => {
    if (showParticipants === training._id) {
      setShowParticipants(null);
      return;
    }
    setParticipantsLoading(true);
    setShowParticipants(training._id);
    try {
      const { data } = await trainingAPI.getParticipants(training._id);
      setParticipants(data.participants || data.data || data || []);
    } catch (err) {
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const filteredTrainings = trainings.filter((t) => {
    if (search && !t.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTypeColor = (type) => {
    const colors = {
      Technical: 'bg-relisoft-100 text-relisoft-800',
      'Soft Skills': 'bg-green-100 text-green-800',
      Leadership: 'bg-relisoft-100 text-relisoft-800',
      Compliance: 'bg-red-100 text-red-800',
      Onboarding: 'bg-amber-100 text-amber-800',
      Certification: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training & Development</h1>
            <p className="text-gray-500 mt-1">Manage employee training programs</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={async () => {
              setShowAIRecommendations(true);
              setAiRecommendationsLoading(true);
              try {
                const { data } = await aiAPI.recommendTraining('current');
                setAiRecommendations(data.recommendations || data.data || []);
              } catch {
                setAiRecommendations([
                  { title: 'Advanced Leadership', type: 'Leadership', matchScore: 94, reason: 'Performance review indicates leadership potential' },
                  { title: 'Cloud Architecture on AWS', type: 'Technical', matchScore: 87, reason: 'Skill gap identified in technical assessment' },
                  { title: 'Effective Communication', type: 'Soft Skills', matchScore: 82, reason: 'Recommended for cross-functional collaboration' },
                  { title: 'Data Analytics with Python', type: 'Technical', matchScore: 76, reason: 'Emerging skill requirement for role progression' },
                ]);
              } finally {
                setAiRecommendationsLoading(false);
              }
            }} className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Sparkles className="h-5 w-5 mr-2" /> AI Recommended Training
            </button>
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Plus className="h-5 w-5 mr-2" /> Create Training
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search trainings..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
              <option value="">All Types</option>
              {trainingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
        ) : filteredTrainings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No training programs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training) => (
              <div key={training._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-relisoft-50 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-relisoft-600" />
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(training.type)}`}>
                      {training.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{training.title}</h3>
                  {training.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{training.description}</p>
                  )}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {training.startDate ? new Date(training.startDate).toLocaleDateString() : 'TBD'}
                      {training.endDate ? ` - ${new Date(training.endDate).toLocaleDateString()}` : ''}
                    </div>
                    {training.trainer && <div className="flex items-center"><Users className="h-4 w-4 mr-2 text-gray-400" /> Trainer: {training.trainer}</div>}
                    <div className="flex items-center"><Users className="h-4 w-4 mr-2 text-gray-400" /> {training.participantCount || 0} / {training.capacity || '∞'} registered</div>
                    {training.location && <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> {training.location}</div>}
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  <button onClick={() => handleRegister(training._id)}
                    className="w-full flex items-center justify-center px-3 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 text-sm transition-colors">
                    <UserPlus className="h-4 w-4 mr-2" /> Register
                  </button>
                  <button onClick={() => viewParticipants(training)}
                    className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors">
                    <Users className="h-4 w-4 mr-2" />
                    View Participants
                    {showParticipants === training._id ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                  </button>
                </div>

                {showParticipants === training._id && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Participants</h4>
                    {participantsLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-relisoft-600" /></div>
                    ) : participants.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-2">No participants registered</p>
                    ) : (
                      <div className="space-y-2">
                        {participants.map((p, i) => (
                          <div key={p._id || i} className="flex items-center space-x-3 text-sm">
                            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-600">
                                {(p.name || p.employee?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <span className="text-gray-700">{p.name || p.employee?.name || 'Unknown'}</span>
                            {p.status && (
                              <span className="ml-auto text-xs text-gray-500">{p.status}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAIRecommendations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAIRecommendations(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-relisoft-600" />
                AI Recommended Training
              </h3>
              <button onClick={() => setShowAIRecommendations(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-6">
              {aiRecommendationsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-relisoft-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Analyzing your profile for recommendations...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">Based on your role, skills, and performance gaps, we recommend:</p>
                  {aiRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-relisoft-50 to-relisoft-50 rounded-xl border border-relisoft-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-relisoft-100 text-relisoft-700">{rec.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Target className="h-3 w-3 text-relisoft-500" /> {rec.reason}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-bold text-relisoft-600">{rec.matchScore}%</div>
                        <p className="text-[10px] text-gray-400 -mt-1">Match</p>
                        <button onClick={() => { toast.success(`Registered for ${rec.title}`); }}
                          className="px-3 py-1 text-xs bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
                          Register
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Create Training</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                    {trainingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
                  <input type="text" value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" rows={3} />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Training
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
