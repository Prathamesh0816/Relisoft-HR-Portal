import { useState, useEffect } from 'react';
import { Plus, FileText, Download, Archive, PenSquare, Eye, Clock } from 'lucide-react';
import { documentAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Draft: 'badge-warning',
  Final: 'badge-success',
  Archived: 'badge-gray',
};

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(null);
  const [showSignModal, setShowSignModal] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: '', content: '' });
  const [signData, setSignData] = useState({ signature: '', name: '' });
  const [versionHistory, setVersionHistory] = useState([]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await documentAPI.getAll();
      setDocuments(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await documentAPI.create(formData);
      toast.success('Document created');
      setShowGenerateModal(false);
      setFormData({ name: '', type: '', content: '' });
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create document');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this document?')) return;
    try {
      await documentAPI.archive(id);
      toast.success('Document archived');
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive');
    }
  };

  const handleSign = async (e) => {
    e.preventDefault();
    if (!showSignModal) return;
    try {
      await documentAPI.sign(showSignModal._id, signData);
      toast.success('Document signed');
      setShowSignModal(null);
      setSignData({ signature: '', name: '' });
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sign');
    }
  };

  const openPreview = (doc) => {
    setShowPreviewModal(doc);
    setVersionHistory(doc.versions || []);
  };

  const handleDownload = (doc) => {
    toast.success(`Downloading ${doc.name}...`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Document Management</h1>
        <button onClick={() => setShowGenerateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Generate Document
        </button>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Employee</th>
                <th className="table-header">Version</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : documents.length === 0 ? (
                <tr><td colSpan={6} className="table-cell text-center text-gray-500 py-8">No documents found</td></tr>
              ) : (
                documents.map((doc, i) => (
                  <tr key={doc._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{doc.name}</td>
                    <td className="table-cell"><span className="flex items-center gap-1"><FileText size={14} />{doc.type}</span></td>
                    <td className="table-cell">{doc.employee?.name || '—'}</td>
                    <td className="table-cell">v{doc.version || 1}</td>
                    <td className="table-cell"><span className={`badge ${statusColors[doc.status] || 'badge-gray'}`}>{doc.status}</span></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openPreview(doc)} className="p-1.5 text-relisoft-600 hover:bg-relisoft-50 rounded-lg" title="Preview"><Eye size={16} /></button>
                        <button onClick={() => handleDownload(doc)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Download"><Download size={16} /></button>
                        <button onClick={() => { setShowSignModal(doc); setSignData({ signature: '', name: '' }); }} className="p-1.5 text-relisoft-600 hover:bg-relisoft-50 rounded-lg" title="E-Sign"><PenSquare size={16} /></button>
                        {doc.status !== 'Archived' && (
                          <button onClick={() => handleArchive(doc._id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="Archive"><Archive size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Document" size="lg">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
              <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Appointment Letter">Appointment Letter</option>
                <option value="Experience Letter">Experience Letter</option>
                <option value="Policy Document">Policy Document</option>
                <option value="Agreement">Agreement</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea className="input-field" rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Enter document content here..." />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowGenerateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Generate</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showPreviewModal} onClose={() => setShowPreviewModal(null)} title={showPreviewModal?.name} size="lg">
        {showPreviewModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-sm text-gray-700 whitespace-pre-wrap">
              {showPreviewModal.content || 'No content available'}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Clock size={14} /> Version History</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {versionHistory.length === 0 ? (
                  <p className="text-xs text-gray-400">No version history</p>
                ) : (
                  versionHistory.map((v, vi) => (
                    <div key={vi} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                      <span className="font-medium">v{v.version || vi + 1}</span>
                      <span className="text-gray-500">{v.updatedAt ? new Date(v.updatedAt).toLocaleString() : ''}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => handleDownload(showPreviewModal)} className="btn-primary flex items-center gap-1"><Download size={16} /> Download</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!showSignModal} onClose={() => setShowSignModal(null)} title="E-Signature">
        <form onSubmit={handleSign} className="space-y-4">
          <p className="text-sm text-gray-600">Signing: <strong>{showSignModal?.name}</strong></p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="input-field" value={signData.name} onChange={(e) => setSignData({ ...signData, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature</label>
            <textarea className="input-field" rows={3} value={signData.signature} onChange={(e) => setSignData({ ...signData, signature: e.target.value })} placeholder="Type your full name as signature..." required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowSignModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><PenSquare size={16} /> Sign Document</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentList;
