import { useState } from 'react';
import { FileText, ScrollText, Plane, AlertTriangle, Upload, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const applications = [
  { id: 'VISA-001', employee: 'John Doe', country: 'USA', type: 'Business', status: 'Approved', validUntil: '2027-06-15' },
  { id: 'VISA-002', employee: 'Jane Smith', country: 'UK', type: 'WorkPermit', status: 'UnderProcessing', submittedAt: '2026-06-10' },
  { id: 'VISA-003', employee: 'Mike Johnson', country: 'Singapore', type: 'Business', status: 'DocumentsPending' },
  { id: 'VISA-004', employee: 'Sarah Wilson', country: 'Germany', type: 'Business', status: 'Approved', validUntil: '2026-12-20' },
];

const expiringPassports = [
  { employee: 'Rajesh Kumar', passportNumber: 'Z1234567', expiryDate: '2026-09-15', daysLeft: 83 },
  { employee: 'Priya Singh', passportNumber: 'Z7654321', expiryDate: '2026-08-25', daysLeft: 62 },
];

const VisaPage = () => {
  const [activeTab, setActiveTab] = useState('applications');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">VISA Documentation Platform</h1>
        <p className="text-sm text-gray-500 mt-1">Manage visa applications and travel documentation</p>
      </div>

      {expiringPassports.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
            <AlertTriangle size={18} /> Passport Expiry Alerts
          </div>
          <div className="space-y-2">
            {expiringPassports.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{p.employee} ({p.passportNumber})</span>
                <span className="text-amber-600 font-medium">Expires in {p.daysLeft} days</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {[
          { id: 'applications', label: 'Applications', icon: FileText },
          { id: 'passports', label: 'Passports', icon: ScrollText },
          { id: 'travel-history', label: 'Travel History', icon: Plane },
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

      {activeTab === 'applications' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Visa Applications</h2>
            <button className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Application</button>
          </div>
          <div className="space-y-4">
            {applications.map((app, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{app.id}</h3>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-sm text-gray-600">{app.employee}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{app.country} - {app.type}</p>
                    {app.validUntil && <p className="text-xs text-gray-400 mt-1">Valid until: {app.validUntil}</p>}
                    {app.submittedAt && <p className="text-xs text-gray-400 mt-1">Submitted: {app.submittedAt}</p>}
                  </div>
                  <span className={`badge ${
                    app.status === 'Approved' ? 'badge-success' :
                    app.status === 'UnderProcessing' ? 'badge-warning' :
                    app.status === 'Rejected' ? 'badge-danger' : 'badge-gray'
                  }`}>{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'passports' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Employee Passports</h2>
            <button className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Passport</button>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 text-center py-8">Passport management module ready for implementation with document upload, expiry tracking, and renewal workflows.</p>
          </div>
        </div>
      )}

      {activeTab === 'travel-history' && (
        <div className="card">
          <p className="text-sm text-gray-500 text-center py-8">Employee travel history tracking with country-wise visa records and travel pattern analytics.</p>
        </div>
      )}
    </div>
  );
};

export default VisaPage;
