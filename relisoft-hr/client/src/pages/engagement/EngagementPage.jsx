import { useState, useEffect } from 'react';
import { Plus, ThumbsUp, MessageSquare, BarChart3, Star, Heart, Award, Send, CheckCircle } from 'lucide-react';
import { surveyAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const EngagementPage = () => {
  const [activeTab, setActiveTab] = useState('surveys');
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(null);
  const [surveyForm, setSurveyForm] = useState({ title: '', description: '', questions: [''] });
  const [responses, setResponses] = useState({});
  const [kudosList, setKudosList] = useState([
    { from: 'Alice', to: 'Bob', message: 'Great work on the project!', date: '2024-01-15' },
    { from: 'Charlie', to: 'Diana', message: 'Always helpful and responsive', date: '2024-01-14' },
  ]);
  const [kudoForm, setKudoForm] = useState({ to: '', message: '' });
  const [feedbackForm, setFeedbackForm] = useState({ type: '', subject: '', message: '' });
  const [surveyResults, setSurveyResults] = useState(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const { data } = await surveyAPI.getAll();
      setSurveys(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (activeTab === 'surveys') fetchSurveys(); }, [activeTab]);

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    try {
      await surveyAPI.create(surveyForm);
      toast.success('Survey created');
      setShowCreateModal(false);
      setSurveyForm({ title: '', description: '', questions: [''] });
      fetchSurveys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create survey');
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!showRespondModal) return;
    try {
      await surveyAPI.submit(showRespondModal._id, { answers: responses });
      toast.success('Survey response submitted');
      setShowRespondModal(null);
      setResponses({});
      fetchSurveys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit response');
    }
  };

  const handleViewResults = async (survey) => {
    try {
      const { data } = await surveyAPI.results(survey._id);
      setSurveyResults(data);
      setShowResultsModal(true);
    } catch (err) {
      toast.error('Failed to load results');
    }
  };

  const handleKudoSubmit = (e) => {
    e.preventDefault();
    setKudosList((prev) => [
      { from: 'You', to: kudoForm.to, message: kudoForm.message, date: new Date().toISOString().split('T')[0] },
      ...prev,
    ]);
    toast.success('Kudo sent!');
    setKudoForm({ to: '', message: '' });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    toast.success('Feedback submitted. Thank you!');
    setFeedbackForm({ type: '', subject: '', message: '' });
  };

  const tabs = [
    { key: 'surveys', label: 'Surveys', icon: BarChart3 },
    { key: 'recognition', label: 'Recognition Wall', icon: Award },
    { key: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Employee Engagement</h1>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'surveys' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Create Survey</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card animate-pulse"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
              ))
            ) : surveys.length === 0 ? (
              <div className="col-span-full card text-center text-gray-500 py-8">No surveys found</div>
            ) : (
              surveys.map((survey, i) => (
                <div key={survey._id || i} className="card">
                  <h3 className="font-semibold text-gray-900 mb-1">{survey.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{survey.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{survey.questions?.length || 0} questions</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowRespondModal(survey); setResponses({}); }} className="btn-primary text-xs px-2 py-1 flex items-center gap-1"><MessageSquare size={12} /> Respond</button>
                      <button onClick={() => handleViewResults(survey)} className="btn-secondary text-xs px-2 py-1 flex items-center gap-1"><BarChart3 size={12} /> Results</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'recognition' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Award size={20} /> Recognition Wall</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {kudosList.map((kudo, i) => (
                <div key={i} className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full"><Star size={18} className="text-yellow-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {kudo.from} <Heart size={12} className="inline text-red-400 mx-0.5" /> {kudo.to}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">"{kudo.message}"</p>
                      <p className="text-xs text-gray-400 mt-2">{kudo.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Send Kudos</h3>
            <form onSubmit={handleKudoSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input type="text" className="input-field" value={kudoForm.to} onChange={(e) => setKudoForm({ ...kudoForm, to: e.target.value })} required placeholder="Colleague name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea className="input-field" rows={3} value={kudoForm.message} onChange={(e) => setKudoForm({ ...kudoForm, message: e.target.value })} required placeholder="Say something nice..." />
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"><Send size={16} /> Send Kudos</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="card-header">Submit Feedback</h2>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="input-field" value={feedbackForm.type} onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })} required>
                  <option value="">Select Type</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Appreciation">Appreciation</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" className="input-field" value={feedbackForm.subject} onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea className="input-field" rows={5} value={feedbackForm.message} onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })} required />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2"><Send size={16} /> Submit Feedback</button>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Survey" size="lg">
        <form onSubmit={handleCreateSurvey} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Survey Title</label>
            <input type="text" className="input-field" value={surveyForm.title} onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={2} value={surveyForm.description} onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
            {surveyForm.questions.map((q, qi) => (
              <div key={qi} className="flex items-center gap-2 mb-2">
                <input type="text" className="input-field" value={q} onChange={(e) => { const qs = [...surveyForm.questions]; qs[qi] = e.target.value; setSurveyForm({ ...surveyForm, questions: qs }); }} placeholder={`Question ${qi + 1}`} />
                <button type="button" onClick={() => { const qs = surveyForm.questions.filter((_, i) => i !== qi); setSurveyForm({ ...surveyForm, questions: qs }); }} className="text-red-500 text-xs">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setSurveyForm({ ...surveyForm, questions: [...surveyForm.questions, ''] })} className="text-xs text-relisoft-600 font-medium">+ Add Question</button>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Survey</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showRespondModal} onClose={() => setShowRespondModal(null)} title={showRespondModal?.title} size="lg">
        <form onSubmit={handleSubmitResponse} className="space-y-4">
          <p className="text-sm text-gray-600">{showRespondModal?.description}</p>
          {showRespondModal?.questions?.map((q, qi) => (
            <div key={qi}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{q}</label>
              <textarea className="input-field" rows={2} value={responses[qi] || ''} onChange={(e) => setResponses({ ...responses, [qi]: e.target.value })} required />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowRespondModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><Send size={16} /> Submit</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showResultsModal} onClose={() => setShowResultsModal(null)} title="Survey Results" size="lg">
        <div className="space-y-4">
          {surveyResults ? (
            <div className="space-y-3">
              {Object.entries(surveyResults).map(([question, answers]) => (
                <div key={question} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">{question}</p>
                  <div className="space-y-1">
                    {Array.isArray(answers) ? answers.map((a, ai) => (
                      <p key={ai} className="text-sm text-gray-600">• {a}</p>
                    )) : (
                      <p className="text-sm text-gray-500">No response data available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No results available yet</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EngagementPage;
