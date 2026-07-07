import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { excelAPI } from '../../services/api'

function downloadBlob(data, filename) {
  const url = window.URL.createObjectURL(new Blob([data]))
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export default function ExcelUploadPage() {
  const [activeTab, setActiveTab] = useState('employees')
  const [employeesFile, setEmployeesFile] = useState(null)
  const [balanceFile, setBalanceFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const employeesRef = useRef()
  const balanceRef = useRef()

  const handleUpload = async (type) => {
    const file = type === 'employees' ? employeesFile : balanceFile
    if (!file) return toast.error('Please select a file first')

    setUploading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = type === 'employees'
        ? await excelAPI.uploadEmployees(formData)
        : await excelAPI.uploadLeaveBalances(formData)
      setResult({ type, success: true, data: res.data })
      toast.success('Upload completed successfully')
      if (type === 'employees') { setEmployeesFile(null); if (employeesRef.current) employeesRef.current.value = '' }
      else { setBalanceFile(null); if (balanceRef.current) balanceRef.current.value = '' }
    } catch (err) {
      setResult({ type, success: false, error: err.response?.data?.message || 'Upload failed' })
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <FileSpreadsheet className="h-7 w-7 text-relisoft-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Upload</h1>
            <p className="text-gray-500 mt-1">Upload employees and leave balances via Excel</p>
          </div>
        </div>

        <div className="mb-4 border-b border-gray-200">
          <div className="flex space-x-1">
            <button onClick={() => setActiveTab('employees')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'employees' ? 'border-relisoft-600 text-relisoft-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>Upload Employees</button>
            <button onClick={() => setActiveTab('balances')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'balances' ? 'border-relisoft-600 text-relisoft-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>Upload Leave Balances</button>
          </div>
        </div>

        {activeTab === 'employees' && (
          <UploadSection
            title="Upload Existing Employees"
            description="Upload an Excel file (.xlsx) containing existing employee data. Required columns: EmployeeCode, FullName, Email, Department, Designation, JobRole, EmploymentType, WorkLocation, Role."
            file={employeesFile}
            setFile={setEmployeesFile}
            onUpload={() => handleUpload('employees')}
            uploading={uploading}
            ref={employeesRef}
            onDownload={async () => {
              try {
                const res = await excelAPI.downloadEmployeeTemplate()
                downloadBlob(res.data, 'employee-template.csv')
              } catch (err) { toast.error('Failed to download template') }
            }}
          />
        )}

        {activeTab === 'balances' && (
          <UploadSection
            title="Upload Leave Balances"
            description="Upload an Excel file (.xlsx) containing leave balances. Required columns: EmployeeCode, LeaveTypeName, AllocatedLeaves, UsedLeaves."
            file={balanceFile}
            setFile={setBalanceFile}
            onUpload={() => handleUpload('balances')}
            uploading={uploading}
            ref={balanceRef}
            onDownload={async () => {
              try {
                const res = await excelAPI.downloadLeaveBalanceTemplate()
                downloadBlob(res.data, 'leave-balances-template.csv')
              } catch (err) { toast.error('Failed to download template') }
            }}
          />
        )}

        {result && result.type === activeTab && (
          <div className={`mt-6 rounded-xl border p-4 ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Upload Completed' : 'Upload Failed'}
                </p>
                {result.success ? (
                  <pre className="mt-1 text-sm text-green-700 whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                ) : (
                  <p className="mt-1 text-sm text-red-700">{result.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UploadSection({ title, description, file, setFile, onUpload, uploading, ref, onDownload }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-6">{description}</p>

      <div className="flex items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-relisoft-400 transition-colors"
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) setFile(f)
          else toast.error('Please upload an Excel file (.xlsx or .xls)')
        }}>
        <div className="text-center">
          <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          {file ? (
            <div>
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <button onClick={() => setFile(null)}
                className="mt-2 text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500">Drag and drop your file here, or</p>
              <label htmlFor={`file-${title}`}
                className="inline-block mt-2 px-4 py-2 bg-relisoft-600 text-white text-sm rounded-lg cursor-pointer hover:bg-relisoft-700">
                Browse Files
              </label>
              <input id={`file-${title}`} type="file" accept=".xlsx,.xls" className="hidden" ref={ref}
                onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button onClick={onDownload}
          className="text-sm text-relisoft-600 hover:text-relisoft-700 flex items-center">
          <Download className="h-4 w-4 mr-1" /> Download Template
        </button>
        <button onClick={onUpload} disabled={!file || uploading}
          className="px-6 py-2.5 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
          {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Upload
        </button>
      </div>
    </div>
  )
}
