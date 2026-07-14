import { useEffect, useState } from 'react'
import useStore from '../store'
import { getContractors, createContractor, updateContractor, getContractorEmployees, addContractorEmployee, updateContractorEmployee, deactivateContractorEmployee } from '../api'
import { Building, Plus, Edit3, CheckCircle, X, Users, ChevronDown, ChevronRight, Briefcase } from 'lucide-react'

export default function ContractorManager() {
  const { contractors, setContractors, setMessage, currentUser } = useStore()
  const isAdmin = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState('contractors')
  const [contForm, setContForm] = useState({ companyName: '', contactPerson: '', email: '', phone: '', status: 'Active' })
  const [showContForm, setShowContForm] = useState(false)
  const [editingContId, setEditingContId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [employees, setEmployees] = useState([])
  const [empForm, setEmpForm] = useState({ fullName: '', email: '', role: '', status: 'Active' })
  const [showEmpForm, setShowEmpForm] = useState(false)

  useEffect(() => {
    getContractors().then((r) => setContractors({ list: r.contractors || [], loading: false }))
  }, [])

  const refreshContractors = async () => {
    const r = await getContractors()
    setContractors({ list: r.contractors || [] })
  }

  const loadEmployees = async (contractorId) => {
    try {
      const r = await getContractorEmployees(contractorId)
      setEmployees(r.employees || [])
    } catch { setEmployees([]) }
  }

  const handleSaveContractor = async (e) => {
    e.preventDefault()
    try {
      if (editingContId) {
        await updateContractor(editingContId, contForm)
        setMessage({ type: 'success', text: 'Contractor updated.' })
      } else {
        await createContractor(contForm)
        setMessage({ type: 'success', text: 'Contractor created.' })
      }
      setContForm({ companyName: '', contactPerson: '', email: '', phone: '', status: 'Active' })
      setEditingContId(null)
      setShowContForm(false)
      await refreshContractors()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    if (!expandedId) return
    try {
      await addContractorEmployee(expandedId, empForm)
      setMessage({ type: 'success', text: 'Employee added.' })
      setEmpForm({ fullName: '', email: '', role: '', status: 'Active' })
      setShowEmpForm(false)
      await loadEmployees(expandedId)
      const r = await getContractorEmployees(expandedId)
      setContractors({ employees: r.employees || [] })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleDeactivate = async (id) => {
    try { await deactivateContractorEmployee(id); setMessage({ type: 'success', text: 'Employee deactivated.' }); if (expandedId) await loadEmployees(expandedId) }
    catch { setMessage({ type: 'error', text: 'Failed.' }) }
  }

  const toggleExpand = async (contractor) => {
    if (expandedId === contractor.id) {
      setExpandedId(null)
      setEmployees([])
    } else {
      setExpandedId(contractor.id)
      await loadEmployees(contractor.id)
    }
  }

  const editContractor = (c) => {
    setContForm({ companyName: c.companyName, contactPerson: c.contactPerson || '', email: c.email || '', phone: c.phone || '', status: c.status })
    setEditingContId(c.id)
    setShowContForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('contractors')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'contractors' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Contractors</button>
            <button onClick={() => setTab('employees')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'employees' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Employees</button>
            {isAdmin && <button onClick={() => { setShowContForm(!showContForm); if (!showContForm) { setContForm({ companyName: '', contactPerson: '', email: '', phone: '', status: 'Active' }); setEditingContId(null) } }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'add' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>{showContForm ? 'Cancel' : 'Add'}</button>}
          </div>
        </div>
      </div>

      {tab === 'contractors' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Contractors</h2>
          <p className="text-muted text-sm mb-4">Manage external contractor companies and their employees.</p>
          {contractors.list.length === 0 ? (
            <p className="text-muted text-sm">No contractors yet.</p>
          ) : (
            <div className="space-y-3">
              {contractors.list.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] cursor-pointer hover:bg-navy/5" onClick={() => toggleExpand(c)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center">
                        <Building size={18} className="text-navy-dark" />
                      </div>
                      <div>
                        <div className="font-bold text-navy dark:text-white text-sm">{c.companyName}</div>
                        <div className="text-xs text-muted">{c.contactPerson} · {c.email} · {c.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{c.status}</span>
                      {isAdmin && <button onClick={(e) => { e.stopPropagation(); editContractor(c) }} className="p-1.5 rounded-lg border border-navy/10 text-muted hover:bg-navy/5"><Edit3 size={14} /></button>}
                      {expandedId === c.id ? <ChevronDown size={18} className="text-muted" /> : <ChevronRight size={18} className="text-muted" />}
                    </div>
                  </div>
                  {expandedId === c.id && (
                    <div className="ml-12 mt-2 space-y-2">
                      {employees.length === 0 ? (
                        <p className="text-xs text-muted p-2">No employees listed.</p>
                      ) : (
                        employees.map((e) => (
                          <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border border-navy/5 dark:border-white/5 bg-white dark:bg-[var(--bg-secondary)]">
                            <div>
                              <div className="font-bold text-navy dark:text-white text-xs">{e.fullName}</div>
                              <div className="text-[10px] text-muted">{e.role} · {e.email}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${e.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{e.status}</span>
                              {e.status === 'Active' && isAdmin && (
                                <button onClick={() => handleDeactivate(e.id)} className="p-1 rounded-lg bg-red-50 text-red-600"><X size={12} /></button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {isAdmin && (
                        <div className="pt-2">
                          {showEmpForm ? (
                            <form onSubmit={handleAddEmployee} className="grid grid-cols-4 gap-2 p-3 rounded-xl border border-navy/10 bg-amber-50/30">
                              <input value={empForm.fullName} onChange={(e) => setEmpForm((s) => ({ ...s, fullName: e.target.value }))} required placeholder="Name" className="input text-xs" />
                              <input type="email" value={empForm.email} onChange={(e) => setEmpForm((s) => ({ ...s, email: e.target.value }))} required placeholder="Email" className="input text-xs" />
                              <input value={empForm.role} onChange={(e) => setEmpForm((s) => ({ ...s, role: e.target.value }))} required placeholder="Role" className="input text-xs" />
                              <div className="flex gap-1">
                                <button type="submit" className="btn-primary text-xs flex-1"><Plus size={12} className="inline mr-1" />Add</button>
                                <button type="button" onClick={() => setShowEmpForm(false)} className="px-2 py-1 rounded-lg border border-navy/10 text-xs text-muted"><X size={12} /></button>
                              </div>
                            </form>
                          ) : (
                            <button onClick={() => setShowEmpForm(true)} className="btn-primary text-xs"><Plus size={12} className="inline mr-1" />Add Employee</button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'employees' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Contractor Employees</h2>
          <p className="text-muted text-sm mb-4">All contractor employees across companies.</p>
          {contractors.employees.length === 0 ? (
            <p className="text-muted text-sm">No contractor employees.</p>
          ) : (
            <div className="space-y-3">
              {contractors.employees.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{e.fullName}</div>
                    <div className="text-xs text-muted">{e.contractorName} · {e.role} · {e.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${e.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{e.status}</span>
                    {e.status === 'Active' && isAdmin && (
                      <button onClick={() => handleDeactivate(e.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100"><X size={14} className="inline mr-1" />Deactivate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'add' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">{editingContId ? 'Edit' : 'Add'} Contractor</h2>
          <p className="text-muted text-sm mb-4">{editingContId ? 'Update' : 'Register'} a contractor company.</p>
          <form onSubmit={handleSaveContractor} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name</label>
                <input value={contForm.companyName} onChange={(e) => setContForm((s) => ({ ...s, companyName: e.target.value }))} required className="input w-full" />
              </div>
              <div>
                <label className="label">Contact Person</label>
                <input value={contForm.contactPerson} onChange={(e) => setContForm((s) => ({ ...s, contactPerson: e.target.value }))} className="input w-full" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={contForm.email} onChange={(e) => setContForm((s) => ({ ...s, email: e.target.value }))} className="input w-full" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={contForm.phone} onChange={(e) => setContForm((s) => ({ ...s, phone: e.target.value }))} className="input w-full" />
              </div>
              <div>
                <label className="label">Status</label>
                <select value={contForm.status} onChange={(e) => setContForm((s) => ({ ...s, status: e.target.value }))} className="input w-full">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary"><Building size={16} /> {editingContId ? 'Update' : 'Create'} Contractor</button>
          </form>
        </div>
      )}
    </div>
  )
}
