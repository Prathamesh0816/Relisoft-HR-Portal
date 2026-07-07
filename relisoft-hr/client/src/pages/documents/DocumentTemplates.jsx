import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Loader2, Award, Building2, Landmark, FileCheck, Shield, DollarSign, CreditCard, BadgeCheck, Stamp, Printer, ExternalLink, Search, ChevronDown, ChevronUp, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentTemplateAPI } from '../../services/api';

const CATEGORY_CONFIG = {
  certificate: { label: 'Certificates & Awards', icon: Award, color: 'from-purple-500 to-pink-500' },
  statutory: { label: 'Statutory & Tax', icon: Landmark, color: 'from-blue-500 to-indigo-500' },
  'hr-letter': { label: 'HR Letters', icon: FileText, color: 'from-green-500 to-teal-500' },
  financial: { label: 'Financial Documents', icon: DollarSign, color: 'from-emerald-500 to-green-500' },
  noc: { label: 'NOC & Clearance', icon: Shield, color: 'from-orange-500 to-red-500' },
  compliance: { label: 'Compliance', icon: FileCheck, color: 'from-cyan-500 to-blue-500' },
  other: { label: 'Other Documents', icon: BadgeCheck, color: 'from-gray-500 to-slate-600' },
};

const CATEGORY_ORDER = ['certificate', 'statutory', 'hr-letter', 'financial', 'noc', 'compliance', 'other'];

const BRANDING = {
  companyName: 'ReliSoft Technologies',
  tagline: 'Empowering Enterprises, Enabling Excellence',
  address: 'Platina Tower, 5th Floor, Plot No. C-59, Bandra Kurla Complex, Mumbai – 400051',
  website: 'https://www.relisofttechnologies.com',
  primaryColor: '#1e40af',
};

export default function DocumentTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('certificate');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadTemplates(); loadEmployees(); }, []);

  const loadTemplates = async () => {
    try {
      const res = await documentTemplateAPI.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTemplates(data);
    } catch { toast.error('Failed to load templates'); }
    finally { setLoading(false); }
  };

  const loadEmployees = async () => {
    try {
      const { data } = await documentTemplateAPI.getAll();
      setEmployees([]);
    } catch { }
  };

  const searchEmployees = async (q) => {
    setEmployeeSearch(q);
    if (q.length < 2) { setEmployees([]); return; }
    try {
      const res = await documentTemplateAPI.getAll();
      setEmployees([]);
    } catch { }
  };

  const selectTemplate = async (tmpl) => {
    setSelectedTemplate(tmpl);
    setGeneratedDoc(null);
    setAutoFilled(false);
    const defaults = {};
    (tmpl.variables || []).forEach(v => {
      defaults[v.name] = v.defaultValue || '';
    });
    setFormValues(defaults);
    if (selectedEmployee) autoFillValues();
  };

  const selectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setShowEmployeePicker(false);
    if (selectedTemplate) autoFillValues();
  };

  const autoFillValues = () => {
    if (!selectedEmployee || !selectedTemplate) return;
    const filled = { ...formValues };
    (selectedTemplate.variables || []).forEach(v => {
      if (v.type === 'employee-field' && v.employeeField && selectedEmployee[v.employeeField]) {
        filled[v.name] = selectedEmployee[v.employeeField];
      }
    });
    const emp = selectedEmployee;
    filled.empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || filled.empName;
    filled.empDesignation = emp.designation || emp.position || filled.empDesignation;
    filled.empDepartment = emp.department || filled.empDepartment;
    filled.empId = emp.employeeId || emp.empId || filled.empId;
    filled.empEmail = emp.email || filled.empEmail;
    filled.empJoinDate = emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('en-IN') : filled.empJoinDate;
    setFormValues(filled);
    setAutoFilled(true);
    toast.success('Employee details auto-filled');
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    const missing = (selectedTemplate.variables || []).filter(v => v.required && !formValues[v.name]);
    if (missing.length > 0) {
      toast.error(`Please fill required fields: ${missing.map(v => v.label).join(', ')}`);
      return;
    }
    setGenerating(true);
    try {
      const res = await documentTemplateAPI.generate({
        templateCode: selectedTemplate.code,
        employeeId: selectedEmployee?._id,
        variables: formValues,
      });
      setGeneratedDoc(res.data?.html || res.data?.data?.html);
      toast.success('Document generated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate document');
    } finally { setGenerating(false); }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatedDoc);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name || 'document'} - ${selectedEmployee ? selectedEmployee.firstName + ' ' + selectedEmployee.lastName : ''}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  const grouped = {};
  templates.forEach(t => {
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return;
    const cat = t.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  });

  const isStaticField = (name) => ['empName', 'empFirstName', 'empLastName', 'empEmail', 'empPhone', 'empDesignation', 'empDepartment', 'empId', 'empGrade', 'empJoinDate', 'empPan', 'empAadhaar', 'empUan', 'empBankName', 'empBankAccount', 'empIfsc', 'empAddress', 'currentDate', 'currentYear', 'financialYear', 'companyName', 'companyShortName', 'companyAddress', 'companyPhone', 'companyEmail', 'companyWebsite', 'companyCin', 'companyGst', 'companyPan'].includes(name);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Document Templates</h1>
            <p className="text-blue-200 text-sm mt-1">Generate official HR documents with auto-filled employee details & ReliSoft branding</p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-blue-200">
            <img src={`https://ui-avatars.com/api/?name=RS&background=1e40af&color=fff&size=32`} className="rounded" alt="logo" />
            <span>{BRANDING.companyName} · v2.0</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search templates..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowEmployeePicker(true)}>
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm flex-1">{selectedEmployee ? `${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim() || selectedEmployee.email : 'Select Employee (auto-fill)'}</span>
              {selectedEmployee && <button onClick={(e) => { e.stopPropagation(); setSelectedEmployee(null); setAutoFilled(false); }} className="text-xs text-red-500 hover:text-red-700">Clear</button>}
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {CATEGORY_ORDER.map(catKey => {
                const catTemplates = grouped[catKey] || [];
                if (catTemplates.length === 0) return null;
                const config = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.other;
                const Icon = config.icon;
                const isExpanded = expandedCategory === catKey;
                return (
                  <div key={catKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedCategory(isExpanded ? null : catKey)}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{config.label}</p>
                          <p className="text-xs text-gray-400">{catTemplates.length} templates</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </button>
                    {isExpanded && <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {catTemplates.map(t => (
                        <button key={t.code} className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${selectedTemplate?.code === t.code ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                          onClick={() => selectTemplate(t)}>
                          <FileText className={`h-4 w-4 ${selectedTemplate?.code === t.code ? 'text-blue-600' : 'text-gray-300'}`} />
                          <span className="flex-1 truncate">{t.name}</span>
                          {t.officialLink && <ExternalLink className="h-3 w-3 text-gray-300" title="Official info available" />}
                        </button>
                      ))}
                    </div>}
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 text-xs text-blue-800">
              <p className="font-semibold mb-1">🔒 Document Security</p>
              <p>All documents are generated with ReliSoft watermarks, headers, and digital signatures. Official links redirect to government portals for verification.</p>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-4">
            {!selectedTemplate && !generatedDoc && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FileText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Select a Document Template</h3>
                <p className="text-gray-300 text-sm">Choose a template from the left panel to generate an official ReliSoft document with auto-filled employee details, watermarks, and branding.</p>
              </div>
            )}

            {selectedTemplate && !generatedDoc && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedTemplate.showWatermark !== false && <span className="inline-flex items-center gap-1 mr-3"><Stamp className="h-3 w-3" /> Watermarked</span>}
                      {selectedTemplate.officialLink && <a href={selectedTemplate.officialLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {selectedTemplate.officialLinkText || 'Official Info'}</a>}
                    </p>
                  </div>
                  {selectedEmployee && <span className="badge badge-green flex items-center gap-1"><User className="h-3 w-3" /> {selectedEmployee.firstName || 'Selected'}</span>}
                </div>

                {(selectedTemplate.variables || []).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><PenSquare className="h-4 w-4" /> Document Details</h3>
                    {autoFilled && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">✓ Employee details auto-filled from profile</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(selectedTemplate.variables || []).map(v => (
                        <div key={v.name}>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            {v.label} {v.required && <span className="text-red-500">*</span>}
                            {isStaticField(v.name) && <span className="text-xs text-blue-400 ml-1">(auto)</span>}
                          </label>
                          {v.type === 'select' ? (
                            <select className="input-field" value={formValues[v.name] || ''} onChange={(e) => setFormValues({ ...formValues, [v.name]: e.target.value })}>
                              <option value="">Select {v.label}...</option>
                              {(v.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : v.type === 'date' ? (
                            <input type="date" className="input-field" value={formValues[v.name] || ''} onChange={(e) => setFormValues({ ...formValues, [v.name]: e.target.value })} />
                          ) : v.type === 'number' ? (
                            <input type="number" className="input-field" value={formValues[v.name] || ''} onChange={(e) => setFormValues({ ...formValues, [v.name]: e.target.value })} />
                          ) : (
                            <input type="text" className="input-field" value={formValues[v.name] || ''} onChange={(e) => setFormValues({ ...formValues, [v.name]: e.target.value })} placeholder={`Enter ${v.label}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {generating ? 'Generating...' : 'Generate Document'}
                  </button>
                  <button onClick={() => { setSelectedTemplate(null); setGeneratedDoc(null); setFormValues({}); }} className="btn-secondary">Cancel</button>
                </div>

                {selectedTemplate.officialLink && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedTemplate.officialLinkText || 'Official Information'}</p>
                      <a href={selectedTemplate.officialLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{selectedTemplate.officialLink}</a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {generatedDoc && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedTemplate?.name} — Generated</h3>
                    <p className="text-xs text-gray-500">ReliSoft branded • Watermarked • Ready to print</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="btn-primary flex items-center gap-2"><Printer className="h-4 w-4" /> Print</button>
                    <button onClick={handleDownload} className="btn-secondary flex items-center gap-2"><Download className="h-4 w-4" /> Download</button>
                    <button onClick={() => setGeneratedDoc(null)} className="btn-secondary">Back</button>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs text-gray-400 ml-2">ReliSoft Document Preview</span>
                  </div>
                  <div className="max-h-[800px] overflow-y-auto">
                    <iframe srcDoc={generatedDoc} className="w-full" style={{ minHeight: '700px' }} title="Document Preview" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEmployeePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEmployeePicker(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Select Employee</h3>
              <p className="text-xs text-gray-500 mt-1">Search and select an employee to auto-fill document details</p>
            </div>
            <div className="p-4">
              <input type="text" placeholder="Search by name, email, or employee ID..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                value={employeeSearch} onChange={(e) => searchEmployees(e.target.value)} autoFocus />
            </div>
            <div className="overflow-y-auto max-h-[40vh] p-2">
              {employees.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  {employeeSearch.length < 2 ? 'Type at least 2 characters to search' : 'No employees found'}
                </div>
              ) : employees.map(emp => (
                <div key={emp._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => selectEmployee(emp)}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                    {(emp.firstName?.[0] || '?')}{(emp.lastName?.[0] || '')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-gray-400">{emp.designation || emp.position} · {emp.department} · {emp.employeeId || emp.empId}</p>
                  </div>
                  <span className="text-xs text-blue-600 hover:underline">Select</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white text-sm mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">🔗 Official Links</h4>
              <ul className="space-y-1.5 text-gray-300 text-xs">
                <li><a href="https://www.epfindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-300">EPFO India — PF & Pension</a></li>
                <li><a href="https://www.incometax.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-300">Income Tax Portal — TDS/Form 16</a></li>
                <li><a href="https://www.esic.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-300">ESIC — Employee Insurance</a></li>
                <li><a href="https://www.nsdl.co.in" target="_blank" rel="noreferrer" className="hover:text-blue-300">NSDL — Tax Information Network</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">🏢 ReliSoft Resources</h4>
              <ul className="space-y-1.5 text-gray-300 text-xs">
                <li><a href="https://www.relisofttechnologies.com/hr/policies" target="_blank" rel="noreferrer" className="hover:text-blue-300">HR Policies & Procedures</a></li>
                <li><a href="https://www.relisofttechnologies.com/hr/payroll-policy" target="_blank" rel="noreferrer" className="hover:text-blue-300">Payroll & Compensation Policy</a></li>
                <li><a href="https://www.relisofttechnologies.com/hr/recognition" target="_blank" rel="noreferrer" className="hover:text-blue-300">Recognition & Awards Program</a></li>
                <li><a href="https://www.relisofttechnologies.com/hr/loan-policy" target="_blank" rel="noreferrer" className="hover:text-blue-300">Loan & Advance Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">📄 Document Types</h4>
              <ul className="space-y-1.5 text-gray-300 text-xs">
                <li>Award Certificates & Recognition Letters</li>
                <li>PF Nomination, TDS Certificate, Form 16</li>
                <li>Bonafide, Experience, Salary Certificate</li>
                <li>NOC, Loan Clearance, Gate Pass</li>
                <li>All with ReliSoft watermark & branding</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} {BRANDING.companyName}. All documents are system-generated with unique watermarks and digital signatures. Verify authenticity at {BRANDING.website}/verify
          </div>
        </div>
      </div>
    </div>
  );
}
