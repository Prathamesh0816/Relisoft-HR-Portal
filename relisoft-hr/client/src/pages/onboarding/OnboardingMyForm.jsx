import { useState, useEffect } from 'react'
import { Loader2, Upload, FileText, CheckCircle, Download, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { onboardingAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function OnboardingMyForm() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employeeId, setEmployeeId] = useState('')

  const [form, setForm] = useState({
    panNumber: '',
    aadhaarNumber: '',
    hasPriorExperience: false,
    previousEmployerName: '',
    yearsOfExperience: '',
    relievingEmailForwarded: false,
  })

  const [files, setFiles] = useState({
    experienceLetter: null,
    salarySlips: [],
    additionalDocuments: [],
  })

  useEffect(() => {
    if (user?.employeeDbId) {
      setEmployeeId(user.employeeDbId)
      loadProfile(user.employeeDbId)
    } else {
      setLoading(false)
    }
  }, [user])

  const loadProfile = async (empId) => {
    try {
      const res = await onboardingAPI.getProfile(empId)
      setProfile(res.data.profile)
      setDocuments(res.data.documents || [])
      if (res.data.profile) {
        setForm({
          panNumber: res.data.profile.panNumber || '',
          aadhaarNumber: res.data.profile.aadhaarNumber || '',
          hasPriorExperience: res.data.profile.hasPriorExperience || false,
          previousEmployerName: res.data.profile.previousEmployerName || '',
          yearsOfExperience: res.data.profile.yearsOfExperience || '',
          relievingEmailForwarded: res.data.profile.relievingEmailForwarded || false,
        })
      }
    } catch (err) {
      if (err.response?.status !== 404) toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.panNumber || form.panNumber.length < 10) {
      return toast.error('Valid PAN number is required')
    }
    if (!form.aadhaarNumber || form.aadhaarNumber.replace(/\s/g, '').length < 12) {
      return toast.error('Valid Aadhaar number is required')
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('employeeId', employeeId)
      formData.append('panNumber', form.panNumber)
      formData.append('aadhaarNumber', form.aadhaarNumber)
      formData.append('hasPriorExperience', form.hasPriorExperience)
      if (form.hasPriorExperience) {
        formData.append('previousEmployerName', form.previousEmployerName)
        formData.append('yearsOfExperience', form.yearsOfExperience)
        formData.append('relievingEmailForwarded', form.relievingEmailForwarded)
      }
      if (files.experienceLetter) formData.append('experienceLetter', files.experienceLetter)
      for (const slip of files.salarySlips) formData.append('salarySlips', slip)
      for (const doc of files.additionalDocuments) formData.append('additionalDocuments', doc)

      const res = await onboardingAPI.saveProfile(formData)
      toast.success(res.data?.message || 'Onboarding profile saved')
      loadProfile(employeeId)
      setFiles({ experienceLetter: null, salarySlips: [], additionalDocuments: [] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (field, file) => {
    if (field === 'salarySlips') {
      setFiles(f => ({ ...f, salarySlips: [...f.salarySlips, file] }))
    } else {
      setFiles(f => ({ ...f, [field]: file }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-relisoft-600" />
      </div>
    )
  }

  if (!employeeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" />
          <p>Employee profile not linked to your account.</p>
          <p className="text-sm">Contact HR to link your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <FileText className="h-7 w-7 text-relisoft-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
            <p className="text-gray-500 mt-1">Complete your onboarding profile and upload documents</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Identity Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label>
                <input type="text" value={form.panNumber} onChange={e => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F" maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                <input type="text" value={form.aadhaarNumber} onChange={e => setForm({ ...form, aadhaarNumber: e.target.value })}
                  placeholder="1234 5678 9012" maxLength={14}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prior Experience</h2>
            <label className="flex items-center mb-4 cursor-pointer">
              <input type="checkbox" checked={form.hasPriorExperience}
                onChange={e => setForm({ ...form, hasPriorExperience: e.target.checked })}
                className="rounded border-gray-300 text-relisoft-600 focus:ring-relisoft-600" />
              <span className="ml-2 text-sm text-gray-700">I have prior work experience</span>
            </label>
            {form.hasPriorExperience && (
              <div className="space-y-4 pl-6 border-l-2 border-relisoft-200 ml-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous Employer</label>
                    <input type="text" value={form.previousEmployerName}
                      onChange={e => setForm({ ...form, previousEmployerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input type="number" min="0" step="0.5" value={form.yearsOfExperience}
                      onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.relievingEmailForwarded}
                    onChange={e => setForm({ ...form, relievingEmailForwarded: e.target.checked })}
                    className="rounded border-gray-300 text-relisoft-600 focus:ring-relisoft-600" />
                  <span className="ml-2 text-sm text-gray-600">Relieving letter email forwarded to HR</span>
                </label>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
            <div className="space-y-4">
              <FileUploadField label="Experience Letter" field="experienceLetter"
                file={files.experienceLetter} onChange={(f) => handleFileChange('experienceLetter', f)} />
              <FileUploadField label="Salary Slips (last 3 months)" field="salarySlips" multiple
                files={files.salarySlips} onChange={(f) => handleFileChange('salarySlips', f)} />
              <FileUploadField label="Additional Documents" field="additionalDocuments" multiple
                files={files.additionalDocuments} onChange={(f) => handleFileChange('additionalDocuments', f)} />
            </div>
            {documents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h3>
                <div className="space-y-1.5">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-600">{doc.originalFileName}</span>
                        <span className="ml-2 text-xs text-gray-400">({doc.documentType})</span>
                      </div>
                      <a href={`/api/onboarding/documents/${doc.id}`} target="_blank" rel="noreferrer"
                        className="text-relisoft-600 hover:text-relisoft-700">
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FileUploadField({ label, field, file, files, multiple, onChange }) {
  const inputId = `file-${field}`
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label htmlFor={inputId}
        className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-relisoft-400 hover:bg-relisoft-50 transition-colors">
        <Upload className="h-5 w-5 text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">
          {multiple
            ? (files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload files')
            : (file ? file.name : 'Click to upload file')}
        </span>
      </label>
      <input id={inputId} type="file" multiple={multiple} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); e.target.value = '' }} />
    </div>
  )
}
