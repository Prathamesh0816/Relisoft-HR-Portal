import { useState, useEffect } from 'react';
import { Plus, ToggleLeft, ToggleRight, GitBranch, ArrowRight, UserCheck } from 'lucide-react';
import { workflowAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  Active: 'badge-success',
  Inactive: 'badge-gray',
};

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', module: '', trigger: '', stages: [{ name: '', approvers: [''], order: 1 }],
  });

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const { data } = await workflowAPI.getAll();
      setWorkflows(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await workflowAPI.update(editing._id, formData);
        toast.success('Workflow updated');
      } else {
        await workflowAPI.create(formData);
        toast.success('Workflow created');
      }
      setShowCreateModal(false);
      setEditing(null);
      setFormData({ name: '', module: '', trigger: '', stages: [{ name: '', approvers: [''], order: 1 }] });
      fetchWorkflows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save workflow');
    }
  };

  const handleToggle = async (id) => {
    try {
      await workflowAPI.toggle(id);
      toast.success('Workflow toggled');
      fetchWorkflows();
    } catch (err) {
      toast.error('Failed to toggle workflow');
    }
  };

  const addStage = () => {
    setFormData((prev) => ({
      ...prev,
      stages: [...prev.stages, { name: '', approvers: [''], order: prev.stages.length + 1 }],
    }));
  };

  const updateStage = (index, field, value) => {
    const stages = [...formData.stages];
    stages[index] = { ...stages[index], [field]: value };
    setFormData({ ...formData, stages });
  };

  const addApprover = (stageIndex) => {
    const stages = [...formData.stages];
    stages[stageIndex].approvers.push('');
    setFormData({ ...formData, stages });
  };

  const updateApprover = (stageIndex, approverIndex, value) => {
    const stages = [...formData.stages];
    stages[stageIndex].approvers[approverIndex] = value;
    setFormData({ ...formData, stages });
  };

  const openEdit = (wf) => {
    setEditing(wf);
    setFormData({
      name: wf.name || '',
      module: wf.module || '',
      trigger: wf.trigger || '',
      stages: wf.stages?.length > 0 ? wf.stages : [{ name: '', approvers: [''], order: 1 }],
    });
    setShowCreateModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Workflow & Approvals</h1>
        <button onClick={() => { setEditing(null); setFormData({ name: '', module: '', trigger: '', stages: [{ name: '', approvers: [''], order: 1 }] }); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Workflow
        </button>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Name</th>
                <th className="table-header">Module</th>
                <th className="table-header">Trigger</th>
                <th className="table-header">Stages</th>
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
              ) : workflows.length === 0 ? (
                <tr><td colSpan={6} className="table-cell text-center text-gray-500 py-8">No workflows found</td></tr>
              ) : (
                workflows.map((wf, i) => (
                  <tr key={wf._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{wf.name}</td>
                    <td className="table-cell">{wf.module}</td>
                    <td className="table-cell"><span className="flex items-center gap-1"><GitBranch size={14} />{wf.trigger}</span></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {wf.stages?.map((s, si) => (
                          <span key={si} className="flex items-center gap-1">
                            {si > 0 && <ArrowRight size={12} />}
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{s.name || `Stage ${si + 1}`}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell"><span className={`badge ${statusColors[wf.status] || 'badge-gray'}`}>{wf.status}</span></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(wf)} className="btn-secondary text-xs px-2 py-1">Edit</button>
                        <button onClick={() => handleToggle(wf._id)} className={`p-1.5 rounded-lg transition-colors ${wf.status === 'Active' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                          {wf.status === 'Active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={editing ? 'Edit Workflow' : 'Create Workflow'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
              <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <select className="input-field" value={formData.module} onChange={(e) => setFormData({ ...formData, module: e.target.value })} required>
                <option value="">Select Module</option>
                <option value="Leave">Leave</option>
                <option value="Travel">Travel</option>
                <option value="Expense">Expense</option>
                <option value="Purchase">Purchase</option>
                <option value="Recruitment">Recruitment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
              <input type="text" className="input-field" value={formData.trigger} onChange={(e) => setFormData({ ...formData, trigger: e.target.value })} placeholder="e.g., on_approval_required" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Approval Stages</label>
              <button type="button" onClick={addStage} className="text-xs text-relisoft-600 hover:text-relisoft-700 font-medium">+ Add Stage</button>
            </div>
            <div className="space-y-3">
              {formData.stages.map((stage, si) => (
                <div key={si} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Stage {si + 1}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Stage Name</label>
                      <input type="text" className="input-field text-sm" value={stage.name} onChange={(e) => updateStage(si, 'name', e.target.value)} placeholder="e.g., Manager Approval" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Approvers</label>
                      <div className="space-y-1">
                        {stage.approvers.map((approver, ai) => (
                          <div key={ai} className="flex items-center gap-1">
                            <input type="text" className="input-field text-sm flex-1" value={approver} onChange={(e) => updateApprover(si, ai, e.target.value)} placeholder="Approver email/name" />
                            {ai === stage.approvers.length - 1 && (
                              <button type="button" onClick={() => addApprover(si)} className="text-relisoft-600 text-xs hover:underline">+</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!editing && formData.stages.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><GitBranch size={16} /> Visual Flow</p>
              <div className="flex items-center gap-2 flex-wrap">
                {formData.stages.map((stage, si) => (
                  <div key={si} className="flex items-center gap-2">
                    {si > 0 && <ArrowRight size={18} className="text-gray-400" />}
                    <div className="bg-relisoft-50 border border-relisoft-200 rounded-lg px-3 py-2 text-center">
                      <div className="flex items-center gap-1 justify-center text-xs text-relisoft-700 font-medium">
                        <UserCheck size={14} /> {stage.name || `Stage ${si + 1}`}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{stage.approvers.filter(Boolean).length} approver(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Workflow</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkflowList;
