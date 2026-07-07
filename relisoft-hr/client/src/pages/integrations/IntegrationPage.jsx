import { useState } from 'react';
import { Link2, Link2Off, Settings, Key, RefreshCw, Database, Building2, Landmark, Fingerprint } from 'lucide-react';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const integrationsData = [
  {
    id: 'erp',
    name: 'ERP System',
    description: 'Connect to your ERP for employee data sync',
    icon: Building2,
    color: 'bg-relisoft-100 text-relisoft-600',
    fields: [
      { key: 'api_url', label: 'API URL', type: 'text' },
      { key: 'api_key', label: 'API Key', type: 'password' },
      { key: 'company_code', label: 'Company Code', type: 'text' },
    ],
  },
  {
    id: 'm365',
    name: 'Microsoft 365',
    description: 'Sync users, emails, and calendars',
    icon: Database,
    color: 'bg-relisoft-100 text-relisoft-600',
    fields: [
      { key: 'tenant_id', label: 'Tenant ID', type: 'text' },
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
    ],
  },
  {
    id: 'banking',
    name: 'Banking Integration',
    description: 'Process payroll and salary disbursements',
    icon: Landmark,
    color: 'bg-green-100 text-green-600',
    fields: [
      { key: 'bank_name', label: 'Bank Name', type: 'text' },
      { key: 'account_number', label: 'Account Number', type: 'text' },
      { key: 'api_token', label: 'API Token', type: 'password' },
    ],
  },
  {
    id: 'biometric',
    name: 'Biometric System',
    description: 'Import attendance from biometric devices',
    icon: Fingerprint,
    color: 'bg-orange-100 text-orange-600',
    fields: [
      { key: 'device_ip', label: 'Device IP', type: 'text' },
      { key: 'port', label: 'Port', type: 'text' },
      { key: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
];

const IntegrationPage = () => {
  const [connections, setConnections] = useState({
    erp: false,
    m365: false,
    banking: false,
    biometric: false,
  });
  const [configModal, setConfigModal] = useState(null);
  const [configForms, setConfigForms] = useState({});
  const [showApiModal, setShowApiModal] = useState(null);

  const handleToggle = (id) => {
    const newState = !connections[id];
    setConnections((prev) => ({ ...prev, [id]: newState }));
    toast.success(`${integrationsData.find((i) => i.id === id)?.name} ${newState ? 'connected' : 'disconnected'}`);
  };

  const handleSaveConfig = () => {
    if (!configModal) return;
    toast.success(`${integrationsData.find((i) => i.id === configModal)?.name} configuration saved`);
    setConfigModal(null);
  };

  const handleGenerateApiKey = (id) => {
    const key = 'sk-' + Math.random().toString(36).substring(2, 34);
    setShowApiModal({ id, key });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Integrations</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrationsData.map((integration) => {
          const Icon = integration.icon;
          const isConnected = connections[integration.id];

          return (
            <div key={integration.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${integration.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <span className={`badge ${isConnected ? 'badge-success' : 'badge-gray'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => handleToggle(integration.id)}
                  className={`${isConnected ? 'btn-danger' : 'btn-success'} text-xs px-3 py-1.5 flex items-center gap-1`}
                >
                  {isConnected ? <Link2Off size={14} /> : <Link2 size={14} />}
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
                <button onClick={() => { setConfigModal(integration.id); if (!configForms[integration.id]) { const form = {}; integration.fields.forEach((f) => { form[f.key] = ''; }); setConfigForms((prev) => ({ ...prev, [integration.id]: form })); } }} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Settings size={14} /> Configure
                </button>
                <button onClick={() => handleGenerateApiKey(integration.id)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Key size={14} /> API Key
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RefreshCw size={12} />
                  <span>Last sync: {isConnected ? 'Today at 10:30 AM' : 'Never'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={!!configModal} onClose={() => setConfigModal(null)} title={`Configure: ${integrationsData.find((i) => i.id === configModal)?.name}`} size="lg">
        {configModal && configForms[configModal] && (
          <div className="space-y-4">
            {integrationsData.find((i) => i.id === configModal)?.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  className="input-field"
                  value={configForms[configModal]?.[field.key] || ''}
                  onChange={(e) => setConfigForms((prev) => ({ ...prev, [configModal]: { ...prev[configModal], [field.key]: e.target.value } }))}
                />
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setConfigModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveConfig} className="btn-primary">Save Configuration</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!showApiModal} onClose={() => setShowApiModal(null)} title="API Key">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            API Key for: <strong>{integrationsData.find((i) => i.id === showApiModal?.id)?.name}</strong>
          </p>
          <div className="flex gap-2">
            <input type="text" className="input-field font-mono text-xs" value={showApiModal?.key || ''} readOnly />
            <button onClick={() => { navigator.clipboard.writeText(showApiModal?.key || ''); toast.success('Copied to clipboard'); }} className="btn-primary flex items-center gap-1"><Key size={14} /> Copy</button>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
            Store this API key securely. It will not be shown again.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IntegrationPage;
