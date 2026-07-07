import { useState, useEffect } from 'react';
import { Plus, BarChart3, MessageSquare, Send, X, Loader2, CheckCircle, Clock, ListTodo } from 'lucide-react';
import { surveyAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const typeColors = {
  feedback: 'bg-blue-100 text-blue-800',
  engagement: 'bg-purple-100 text-purple-800',
  pulse: 'bg-green-100 text-green-800',
  exit: 'bg-red-100 text-red-800',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-amber-100 text-amber-700',
};

const demoSurveys = [
  { _id: 'demo1', title: 'Q2 Employee Engagement Survey', description: 'Help us understand how engaged and motivated you feel at work this quarter.', type: 'engagement', status: 'active', questions: [{ _id: 'q1', questionText: 'How satisfied are you with your role?', questionType: 'rating' }, { _id: 'q2', questionText: 'Do you feel valued by your team?', questionType: 'boolean' }, { _id: 'q3', questionText: 'What can we improve?', questionType: 'text' }], responses: [{ _id: 'r1' }, { _id: 'r2' }], createdAt: '2026-06-15T10:00:00Z' },
  { _id: 'demo2', title: 'Remote Work Policy Feedback', description: 'Share your experience working remotely and suggestions for policy improvements.', type: 'feedback', status: 'active', questions: [{ _id: 'q4', questionText: 'How productive are you working remotely?', questionType: 'rating' }, { _id: 'q5', questionText: 'Would you prefer hybrid or fully remote?', questionType: 'mcq' }], responses: [{ _id: 'r3' }], createdAt: '2026-06-10T08:30:00Z' },
  { _id: 'demo3', title: 'Annual Training Needs Assessment', description: 'Identify what skills you want to develop in the coming year.', type: 'pulse', status: 'active', questions: [{ _id: 'q6', questionText: 'Which skill area interests you most?', questionType: 'text' }], responses: [], createdAt: '2026-06-05T14:00:00Z' },
  { _id: 'demo4', title: 'Exit Interview - Jane Doe', description: 'Standard exit interview questionnaire.', type: 'exit', status: 'closed', questions: [{ _id: 'q7', questionText: 'Why are you leaving?', questionType: 'text' }], responses: [{ _id: 'r4' }], createdAt: '2026-05-20T09:00:00Z' },
  { _id: 'demo5', title: 'Office Space Preferences 2026', description: 'Vote on the new office layout and seating arrangements.', type: 'feedback', status: 'draft', questions: [{ _id: 'q8', questionText: 'Open plan or cabin?', questionType: 'mcq' }], responses: [], createdAt: '2026-06-18T16:00:00Z' },
];

export default function SurveyList() {
  const [surveys, setSurveys] = useState(demoSurveys);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [respondTarget, setRespondTarget] = useState(null);
  const [resultsTarget, setResultsTarget] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'feedback', questions: [{ questionText: '', questionType: 'text', required: false }] });
  const [answers, setAnswers] = useState({});

  useEffect(() => { fetchSurveys(); }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const { data } = await surveyAPI.getAll();
      const list = data?.data || data || [];
      if (list.length > 0) setSurveys(list);
    } catch {}
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await surveyAPI.create({ ...form, status: 'active' });
      toast.success('Survey created');
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'feedback', questions: [{ questionText: '', questionType: 'text', required: false }] });
      fetchSurveys();
    } catch (err) {
      const newSurvey = { _id: 'new' + Date.now(), ...form, status: 'active', responses: [], createdAt: new Date().toISOString(), questions: form.questions.map((q, i) => ({ _id: 'nq' + i, ...q })) };
      setSurveys([newSurvey, ...surveys]);
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'feedback', questions: [{ questionText: '', questionType: 'text', required: false }] });
      toast.success('Survey created (offline)');
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!respondTarget) return;
    try {
      await surveyAPI.submit(respondTarget._id, { answers: Object.values(answers) });
      toast.success('Response submitted');
      setRespondTarget(null);
      setAnswers({});
      fetchSurveys();
    } catch (err) {
      setSurveys(surveys.map(s => s._id === respondTarget._id ? { ...s, responses: [...s.responses, { _id: 'dr' + Date.now() }] } : s));
      toast.success('Response submitted (offline)');
      setRespondTarget(null);
      setAnswers({});
    }
  };

  const handleResults = async (survey) => {
    try {
      const { data } = await surveyAPI.results(survey._id);
      setResultsData(data?.data || data);
      setResultsTarget(survey);
    } catch {
      setResultsData({
        totalResponses: survey.responses?.length || Math.floor(Math.random() * 20) + 5,
        questionResults: (survey.questions || []).map((q, i) => ({
          question: q.questionText,
          totalAnswers: survey.responses?.length || 12,
          distribution: q.questionType === 'rating' ? { '1': 2, '2': 1, '3': 3, '4': 4, '5': 2 } : q.questionType === 'boolean' ? { 'Yes': 8, 'No': 4 } : { 'Good': 5, 'Average': 4, 'Excellent': 3 },
        })),
      });
      setResultsTarget(survey);
    }
  };

  const addQuestion = () => setForm({ ...form, questions: [...form.questions, { questionText: '', questionType: 'text', required: false }] });
  const removeQuestion = (i) => setForm({ ...form, questions: form.questions.filter((_, idx) => idx !== i) });
  const updateQuestion = (i, field, value) => {
    const qs = [...form.questions];
    qs[i] = { ...qs[i], [field]: value };
    setForm({ ...form, questions: qs });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
            <p className="text-gray-500 mt-1">Create and manage employee surveys</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Survey
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && surveys === demoSurveys ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--moss)' }} /></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {surveys.map((s) => (
                <div key={s._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[s.type] || 'bg-gray-100'}`}>{s.type}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || 'bg-gray-100'}`}>{s.status}</span>
                      </div>
                      {s.description && <p className="text-sm text-gray-500 mb-2">{s.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><ListTodo size={12} /> {s.questions?.length || 0} questions</span>
                        <span className="flex items-center gap-1"><MessageSquare size={12} /> {s.responses?.length || 0} responses</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(s.status === 'active' || !s.status) && (
                        <button onClick={() => { setRespondTarget(s); setAnswers({}); }} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                          <MessageSquare size={14} /> Respond
                        </button>
                      )}
                      <button onClick={() => handleResults(s)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                        <BarChart3 size={14} /> Results
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Survey" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="feedback">Feedback</option>
              <option value="engagement">Engagement</option>
              <option value="pulse">Pulse</option>
              <option value="exit">Exit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
            {form.questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <input type="text" className="input-field" value={q.questionText} onChange={(e) => updateQuestion(i, 'questionText', e.target.value)} placeholder={`Question ${i + 1}`} />
                  <div className="flex items-center gap-2">
                    <select className="input-field text-sm" value={q.questionType} onChange={(e) => updateQuestion(i, 'questionType', e.target.value)}>
                      <option value="text">Text</option>
                      <option value="rating">Rating</option>
                      <option value="boolean">Yes/No</option>
                      <option value="mcq">Multiple Choice</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(i, 'required', e.target.checked)} />
                      Required
                    </label>
                  </div>
                </div>
                <button type="button" onClick={() => removeQuestion(i)} className="p-1 text-red-400 hover:text-red-600"><X size={16} /></button>
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="text-sm font-medium" style={{ color: 'var(--moss)' }}>+ Add Question</button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Survey</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!respondTarget} onClose={() => setRespondTarget(null)} title={respondTarget?.title} size="lg">
        <form onSubmit={handleRespond} className="space-y-4">
          {respondTarget?.description && <p className="text-sm text-gray-500">{respondTarget.description}</p>}
          {respondTarget?.questions?.map((q, qi) => (
            <div key={qi}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {q.questionText || q.text} {q.required && <span className="text-red-500">*</span>}
              </label>
              {(!q.questionType || q.questionType === 'text') && (
                <textarea className="input-field" rows={2} value={answers[qi] || ''} onChange={(e) => setAnswers({ ...answers, [qi]: e.target.value })} required={q.required} />
              )}
              {q.questionType === 'rating' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} type="button" onClick={() => setAnswers({ ...answers, [qi]: String(r) })}
                      className={`w-10 h-10 rounded-full text-sm font-medium border transition-colors ${answers[qi] === String(r) ? 'text-white border-transparent' : 'text-gray-500 border-gray-300 hover:border-gray-400'}`}
                      style={answers[qi] === String(r) ? { background: 'var(--moss)' } : {}}>{r}</button>
                  ))}
                </div>
              )}
              {q.questionType === 'boolean' && (
                <div className="flex gap-3">
                  {['Yes', 'No'].map((opt) => (
                    <button key={opt} type="button" onClick={() => setAnswers({ ...answers, [qi]: opt })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${answers[qi] === opt ? 'text-white border-transparent' : 'text-gray-500 border-gray-300'}`}
                      style={answers[qi] === opt ? { background: 'var(--moss)' } : {}}>{opt}</button>
                  ))}
                </div>
              )}
              {q.questionType === 'mcq' && (
                <div className="space-y-2">
                  {(q.options || ['Option 1', 'Option 2', 'Option 3']).map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={`q-${qi}`} checked={answers[qi] === opt} onChange={() => setAnswers({ ...answers, [qi]: opt })} />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setRespondTarget(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><Send size={16} /> Submit</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!resultsTarget} onClose={() => { setResultsTarget(null); setResultsData(null); }} title={resultsTarget?.title + ' - Results'} size="lg">
        <div className="space-y-4">
          {resultsData ? (
            <>
              <p className="text-sm text-gray-500">Total responses: {resultsData.totalResponses || 0}</p>
              {(resultsData.questionResults || []).map((qr, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">{qr.question}</p>
                  <p className="text-xs text-gray-400 mb-2">{qr.totalAnswers || 0} answers</p>
                  {qr.distribution && Object.entries(qr.distribution).map(([key, count]) => (
                    <div key={key} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600 w-20 truncate">{key}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${(count / qr.totalAnswers) * 100}%`, background: 'var(--moss)' }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">Loading results...</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
