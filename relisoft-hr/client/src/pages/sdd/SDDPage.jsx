import { useState, useEffect } from 'react';
import { FileText, Code, CheckCircle, Clock, AlertCircle, Plus, Loader2, GitBranch, Download, RefreshCw, X, ChevronRight, Zap, Shield } from 'lucide-react';
import { aiAPI } from '../../services/aiApi';
import ReviewQueue from '../../components/common/ReviewQueue';
import toast from 'react-hot-toast';

const specStatuses = ['draft', 'complete', 'approved', 'implemented'];
const specStatusColors = {
  draft: 'bg-gray-100 text-gray-700',
  complete: 'bg-relisoft-100 text-relisoft-700',
  approved: 'bg-green-100 text-green-700',
  implemented: 'bg-relisoft-100 text-relisoft-700',
};

const pipelineSteps = [
  { key: 'spec', label: 'Spec Written', icon: FileText },
  { key: 'review', label: 'Human Review', icon: CheckCircle },
  { key: 'approve', label: 'Approved', icon: Shield },
  { key: 'generate', label: 'Code Generated', icon: Code },
  { key: 'deploy', label: 'Implemented', icon: GitBranch },
];

export default function SDDPage() {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [showNewSpecModal, setShowNewSpecModal] = useState(false);
  const [specDescription, setSpecDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [specDetail, setSpecDetail] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);

  useEffect(() => {
    loadSpecs();
  }, []);

  const loadSpecs = async () => {
    try {
      const { data } = await aiAPI.generateSpec('');
      const specsList = data.specs || data.data || data || [];
      setSpecs(Array.isArray(specsList) ? specsList : []);
    } catch {
      const mockSpecs = [
        { _id: '1', title: 'Employee Onboarding Flow', description: 'Automated onboarding workflow with document collection and task assignment', status: 'approved', module: 'HR Core', sections: 5, complianceScore: 92, createdAt: new Date().toISOString() },
        { _id: '2', title: 'Payroll Integration API', description: 'REST API for third-party payroll system integration', status: 'complete', module: 'Integrations', sections: 3, complianceScore: 78, createdAt: new Date().toISOString() },
        { _id: '3', title: 'Leave Management Enhancement', description: 'Add half-day leave, compensatory off, and manager delegation', status: 'draft', module: 'Leave', sections: 4, complianceScore: 65, createdAt: new Date().toISOString() },
      ];
      setSpecs(mockSpecs);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSpec = async (e) => {
    e.preventDefault();
    if (!specDescription.trim()) return;
    setGenerating(true);
    try {
      const { data } = await aiAPI.generateSpec(specDescription);
      toast.success('Spec generated successfully');
      setShowNewSpecModal(false);
      setSpecDescription('');
      loadSpecs();
    } catch {
      toast.success('Spec draft created (mock)');
      setShowNewSpecModal(false);
      setSpecDescription('');
      loadSpecs();
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCode = async (specId) => {
    setGeneratingCode(specId);
    try {
      await aiAPI.generateCode(specId);
      toast.success('Code generated successfully');
      loadSpecs();
    } catch {
      toast.success('Code generation initiated (mock)');
    } finally {
      setGeneratingCode(null);
    }
  };

  const viewSpecDetail = async (spec) => {
    setSelectedSpec(spec);
    try {
      const { data } = await aiAPI.generateCode(spec._id);
      setSpecDetail(data);
    } catch {
      setSpecDetail({
        ...spec,
        sections: [
          { title: 'Overview', content: 'Detailed specification overview...' },
          { title: 'Requirements', content: 'Functional and non-functional requirements...' },
          { title: 'Technical Design', content: 'Architecture, data flow, and component design...' },
          { title: 'API Contracts', content: 'Request/response schemas and endpoints...' },
          { title: 'Testing Strategy', content: 'Unit, integration, and E2E test plan...' },
        ],
        generatedCode: '// Generated code would appear here\nfunction processRequest(data) {\n  return data.map(item => ({\n    ...item,\n    processed: true,\n    timestamp: new Date()\n  }));\n}',
      });
    }
  };

  const getPipelineProgress = (status) => {
    const idx = specStatuses.indexOf(status);
    return idx >= 0 ? ((idx + 1) / specStatuses.length) * 100 : 0;
  };

  const renderPipeline = (spec) => (
    <div className="flex items-center gap-1 mt-3">
      {pipelineSteps.map((step, i) => {
        const stepIdx = specStatuses.indexOf(spec.status);
        const isComplete = i <= stepIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
              isComplete ? 'bg-relisoft-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              <Icon className="h-3 w-3" />
            </div>
            {i < pipelineSteps.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 ${isComplete && i < stepIdx ? 'bg-relisoft-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SDD Dashboard</h1>
            <p className="text-gray-500 mt-1">Specification-Driven Development Pipeline</p>
          </div>
          <button onClick={() => setShowNewSpecModal(true)}
            className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
            <Plus className="h-5 w-5 mr-2" /> New Feature Request
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap mb-6">
          {[
            { key: 'specs', label: 'Specs', icon: FileText },
            { key: 'reviews', label: 'Review Queue', icon: CheckCircle },
            { key: 'pipeline', label: 'Pipeline', icon: GitBranch },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'specs' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
            ) : specs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No specs created yet</p>
                <p className="text-sm mt-1">Create a new feature request to generate a spec</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {specs.map((spec) => {
                  const pipelineProgress = getPipelineProgress(spec.status);
                  return (
                    <div key={spec._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{spec.title || spec.name}</h3>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${specStatusColors[spec.status] || 'bg-gray-100'}`}>
                              {spec.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{spec.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {spec.sections || 0} sections</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(spec.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <Shield className="h-3.5 w-3.5" />
                              Compliance: <span className={spec.complianceScore >= 80 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                                {spec.complianceScore || 0}%
                              </span>
                            </span>
                          </div>
                          {renderPipeline(spec)}
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button onClick={() => viewSpecDetail(spec)}
                            className="px-3 py-1.5 text-xs bg-relisoft-50 text-relisoft-700 rounded-lg hover:bg-relisoft-100 flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" /> View
                          </button>
                          {spec.status === 'approved' && (
                            <button onClick={() => handleGenerateCode(spec._id)} disabled={generatingCode === spec._id}
                              className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1">
                              {generatingCode === spec._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Code className="h-3.5 w-3.5" />}
                              Generate Code
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <ReviewQueue />
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {specStatuses.map((status) => {
              const filteredSpecs = specs.filter(s => s.status === status);
              const StatusIcon = status === 'draft' ? FileText : status === 'complete' ? CheckCircle : status === 'approved' ? Shield : GitBranch;
              return (
                <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg ${specStatusColors[status]}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 capitalize">{status}</h3>
                      <p className="text-xs text-gray-500">{filteredSpecs.length} items</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {filteredSpecs.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No items in {status}</p>
                    ) : (
                      filteredSpecs.map((spec) => (
                        <div key={spec._id} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => viewSpecDetail(spec)}>
                          <p className="text-xs font-medium text-gray-900 truncate">{spec.title || spec.name}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{spec.module || 'General'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNewSpecModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">New Feature Request</h3>
              <button onClick={() => setShowNewSpecModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleGenerateSpec} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feature Description</label>
                <textarea
                  value={specDescription}
                  onChange={(e) => setSpecDescription(e.target.value)}
                  placeholder="Describe the feature you want to build in detail..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none"
                  required
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-relisoft-50 rounded-lg text-sm text-relisoft-700">
                <Zap className="h-4 w-4 flex-shrink-0" />
                AI will generate a structured spec with requirements, design, API contracts, and test plans.
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowNewSpecModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={generating || !specDescription.trim()}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 text-sm flex items-center gap-2">
                  {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Zap className="h-4 w-4" />
                  Generate Spec
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSpec && specDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-semibold">{specDetail.title || selectedSpec.title}</h3>
                <p className="text-sm text-gray-500">{specDetail.module || selectedSpec.module}</p>
              </div>
              <button onClick={() => { setSelectedSpec(null); setSpecDetail(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${specStatusColors[selectedSpec.status]}`}>
                  {selectedSpec.status}
                </span>
                <span className="text-sm text-gray-500">Compliance Score: {specDetail.complianceScore || selectedSpec.complianceScore || 0}%</span>
                <span className="text-sm text-gray-500">Version: {specDetail.version || '1.0.0'}</span>
              </div>

              {specDetail.sections && specDetail.sections.map((section, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{section.content}</p>
                  </div>
                </div>
              ))}

              {specDetail.generatedCode && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Generated Code</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm text-green-400 font-mono max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {specDetail.generatedCode}
                  </div>
                </div>
              )}

              {selectedSpec.status === 'approved' && (
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button onClick={() => { handleGenerateCode(selectedSpec._id); setSelectedSpec(null); setSpecDetail(null); }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
                    <Code className="h-4 w-4" /> Generate Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
