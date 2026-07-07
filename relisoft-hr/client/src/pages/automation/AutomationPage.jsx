import { useState } from 'react';
import { Bot, Bell, Scan, ToggleLeft, ToggleRight, Plus, Trash2, MessageSquare, Calendar, Clock, Sparkles, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import AIChatbot from '../../components/common/AIChatbot';
import toast from 'react-hot-toast';

const AutomationPage = () => {
  const [activeSection, setActiveSection] = useState('chatbot');
  const [rules, setRules] = useState([
    { id: 1, name: 'Leave Balance Reminder', trigger: 'Monthly on 1st', action: 'Send email', status: true, lastRun: '2024-01-01' },
    { id: 2, name: 'Attendance Alert', trigger: 'Daily at 10 AM', action: 'Push notification', status: true, lastRun: '2024-01-15' },
    { id: 3, name: 'Document Expiry', trigger: 'Weekly on Monday', action: 'Mark as expired', status: false, lastRun: '2023-12-20' },
  ]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [reminderForm, setReminderForm] = useState({ name: '', trigger: '', action: '' });

  const handleToggleRule = (id) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, status: !r.status } : r));
    toast.success('Rule toggled');
  };

  const handleDeleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success('Rule deleted');
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    setRules((prev) => [...prev, { ...reminderForm, id: Date.now(), status: true, lastRun: 'Never' }]);
    toast.success('Automation rule created');
    setShowRuleModal(false);
    setReminderForm({ name: '', trigger: '', action: '' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Automation Features</h1>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {[
          { key: 'chatbot', label: 'AI Chatbot', icon: Bot },
          { key: 'reminders', label: 'Reminders', icon: Bell },
          { key: 'ocr', label: 'OCR Settings', icon: Scan },
          { key: 'rules', label: 'Automation Rules', icon: MessageSquare },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeSection === s.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={16} /> {s.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'chatbot' && (
        <div className="card relative min-h-[400px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-relisoft-100 rounded-lg"><Bot size={24} className="text-relisoft-600" /></div>
            <div>
              <h2 className="font-semibold text-gray-900">AI HR Assistant</h2>
              <p className="text-sm text-gray-500">AI-powered HR chatbot integration</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <AIChatbot />
          </div>
        </div>
      )}

      {activeSection === 'reminders' && (
        <div className="card">
          <h2 className="card-header">Reminder Rules</h2>
          <div className="space-y-3">
            {[
              { name: 'Leave Expiry', desc: 'Remind employees about unused leave 30 days before expiry', freq: 'Daily at 9 AM' },
              { name: 'Document Renewal', desc: 'Alert for documents expiring within 15 days', freq: 'Daily at 10 AM' },
              { name: 'Probation End', desc: 'Notify HR 7 days before probation ends', freq: 'Daily at 8 AM' },
              { name: 'Compliance Due', desc: 'Remind compliance team 7 days before due date', freq: 'Weekly on Monday' },
            ].map((rem, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Bell size={18} className="text-relisoft-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{rem.name}</p>
                  <p className="text-xs text-gray-500">{rem.desc}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={12} /> {rem.freq}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-success text-[10px]">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'ocr' && (
        <div className="card">
          <h2 className="card-header">OCR Settings</h2>
          <p className="text-sm text-gray-500 mb-4">Configure OCR for automated document scanning and data extraction.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-scan uploaded documents</p>
                <p className="text-xs text-gray-500">Automatically extract text from uploaded images/PDFs</p>
              </div>
              <span className="badge badge-success">Enabled</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test OCR (Paste an image URL or upload)</label>
              <div className="flex gap-2">
                <input type="text" className="input-field flex-1" value={ocrText} onChange={(e) => setOcrText(e.target.value)} placeholder="Paste image URL or text to process..." />
                <button className="btn-primary flex items-center gap-1"><Scan size={16} /> Scan</button>
              </div>
            </div>
            {ocrText && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Extracted Text:</p>
                <p className="text-sm text-gray-700">Sample extracted text would appear here after OCR processing.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'rules' && (
        <div>
          <div className="flex justify-end gap-3 mb-4">
            <button onClick={async () => {
              toast.loading('Analyzing usage patterns...');
              setTimeout(() => {
                toast.dismiss();
                const newRules = [
                  { id: Date.now() + 1, name: 'Late Attendance Auto-Notify', trigger: 'Daily at 9:30 AM', action: 'Send Email', status: true, lastRun: 'Never' },
                  { id: Date.now() + 2, name: 'Leave Balance Warning', trigger: 'Weekly on Monday', action: 'Push Notification', status: true, lastRun: 'Never' },
                ];
                setRules(prev => [...prev, ...newRules]);
                toast.success('AI suggested 2 new rules based on usage patterns');
              }, 2000);
            }} className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 flex items-center gap-2">
              <Sparkles size={18} /> AI Suggest Rules
            </button>
            <button onClick={() => setShowRuleModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Rule</button>
          </div>
          <div className="space-y-2">
            {rules.map((rule, i) => (
              <div key={rule.id || i} className="card flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">{rule.name}</h3>
                    <span className={`badge ${rule.status ? 'badge-success' : 'badge-gray'}`}>{rule.status ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Bell size={12} /> Trigger: {rule.trigger}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> Action: {rule.action}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> Last Run: {rule.lastRun}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleRule(rule.id)} className={`p-1.5 rounded-lg ${rule.status ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {rule.status ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} title="Create Automation Rule" size="md">
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input type="text" className="input-field" value={reminderForm.name} onChange={(e) => setReminderForm({ ...reminderForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
            <input type="text" className="input-field" value={reminderForm.trigger} onChange={(e) => setReminderForm({ ...reminderForm, trigger: e.target.value })} placeholder="e.g., Daily at 9 AM" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select className="input-field" value={reminderForm.action} onChange={(e) => setReminderForm({ ...reminderForm, action: e.target.value })} required>
              <option value="">Select Action</option>
              <option value="Send Email">Send Email</option>
              <option value="Push Notification">Push Notification</option>
              <option value="SMS Alert">SMS Alert</option>
              <option value="Slack Message">Slack Message</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowRuleModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Rule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AutomationPage;
