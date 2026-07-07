import { useState } from 'react';
import { Users, Calendar, FileText, Vote, BookOpen, ExternalLink, Plus, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const members = [
  { name: 'Dr. Ananya Sharma', role: 'Chairperson', type: 'Internal', expertise: 'AI Ethics', tenure: '2025-2027' },
  { name: 'Rajesh Kumar', role: 'ViceChair', type: 'Internal', expertise: 'Data Science', tenure: '2025-2027' },
  { name: 'Neha Gupta', role: 'Secretary', type: 'Internal', expertise: 'Compliance', tenure: '2025-2027' },
  { name: 'Dr. Vikram Patel', role: 'Member', type: 'External (NASSCOM)', expertise: 'AI Policy', tenure: '2025-2026' },
  { name: 'Sarah Chen', role: 'Member', type: 'External', expertise: 'Generative AI', tenure: '2025-2026' },
  { name: 'Amit Verma', role: 'Member', type: 'Internal', expertise: 'ML Engineering', tenure: '2025-2027' },
];

const proposals = [
  { title: 'AI-Powered Resume Screening', status: 'Voting', votesFor: 4, votesAgainst: 1, deadline: '2026-07-15' },
  { title: 'Ethics Framework for Employee Monitoring', status: 'UnderDiscussion', votesFor: 0, votesAgainst: 0, deadline: '2026-08-01' },
  { title: 'Chatbot for HR Query Resolution', status: 'Approved', votesFor: 5, votesAgainst: 0, deadline: '2026-06-20' },
  { title: 'Attrition Prediction Model v2', status: 'Draft', votesFor: 0, votesAgainst: 0, deadline: '-' },
];

const upcomingMeetings = [
  { title: 'Q3 AI Strategy Review', date: '2026-07-10', status: 'Scheduled' },
  { title: 'AI Ethics Policy Workshop', date: '2026-07-25', status: 'Scheduled' },
  { title: 'Vendor AI Tool Evaluation', date: '2026-08-05', status: 'Draft' },
];

const AICouncilPage = () => {
  const [activeTab, setActiveTab] = useState('members');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">AI Council Platform</h1>
        <p className="text-sm text-gray-500 mt-1">Governing AI adoption, ethics, and strategy</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {[
          { id: 'members', label: 'Members', icon: Users },
          { id: 'proposals', label: 'Proposals', icon: Vote },
          { id: 'meetings', label: 'Meetings', icon: Calendar },
          { id: 'resources', label: 'Resources', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'members' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Council Members ({members.length})</h2>
            <button className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Member</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{m.role}</p>
                  </div>
                  <span className={`badge ${m.type.includes('External') ? 'badge-warning' : 'badge-info'}`}>
                    {m.type}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p>Expertise: {m.expertise}</p>
                  <p>Tenure: {m.tenure}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'proposals' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">AI Proposals</h2>
            <button className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Proposal</button>
          </div>
          <div className="space-y-4">
            {proposals.map((p, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Deadline: {p.deadline}</p>
                  </div>
                  <span className={`badge ${
                    p.status === 'Approved' ? 'badge-success' :
                    p.status === 'Voting' ? 'badge-warning' :
                    p.status === 'UnderDiscussion' ? 'badge-info' : 'badge-gray'
                  }`}>{p.status}</span>
                </div>
                {(p.votesFor > 0 || p.votesAgainst > 0) && (
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14} /> {p.votesFor}</span>
                    <span className="flex items-center gap-1 text-red-600"><Clock size={14} /> {p.votesAgainst}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
            <button className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Schedule Meeting</button>
          </div>
          <div className="space-y-4">
            {upcomingMeetings.map((m, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{m.date}</p>
                  </div>
                  <span className={`badge ${m.status === 'Scheduled' ? 'badge-success' : 'badge-gray'}`}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">AI Ethics Charter v2.1</h4>
                  <p className="text-xs text-gray-500">Updated June 2026</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">AI Governance Policy</h4>
                  <p className="text-xs text-gray-500">Approved by Council Q1 2026</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Annual AI Report 2025</h4>
                  <p className="text-xs text-gray-500">Published March 2026</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICouncilPage;
