import { useState, useEffect } from 'react'
import { Loader2, Shield, ToggleLeft, ToggleRight, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { workspaceAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'

export default function PolicyPanel() {
  const { user } = useAuthStore()
  const [halfDay, setHalfDay] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isHr = user?.roleValue >= 3 || ['admin', 'hr'].includes(user?.role)

  useEffect(() => { loadPolicy() }, [])

  const loadPolicy = async () => {
    try {
      const res = await workspaceAPI.getHrPolicy()
      setHalfDay(res.data.allowHalfDayLeave)
    } catch (err) {
      toast.error('Failed to load HR policy')
    } finally {
      setLoading(false)
    }
  }

  const toggleHalfDay = async () => {
    if (!isHr) return toast.error('Only HR can update this policy')
    setSaving(true)
    try {
      const newVal = !halfDay
      await workspaceAPI.updateHrPolicy({ allowHalfDayLeave: newVal })
      setHalfDay(newVal)
      toast.success(`Half-day leave ${newVal ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast.error('Failed to update policy')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-relisoft-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Shield className="h-7 w-7 text-relisoft-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Control Panel</h1>
            <p className="text-gray-500 mt-1">Manage global HR policies and settings</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Leave Policies</h2>
          <p className="text-sm text-gray-500 mb-6">Configure leave-related global settings</p>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Allow Half-Day Leave</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                When enabled, employees can apply for half-day leave using their full-day leave balance
              </p>
            </div>
            <button onClick={toggleHalfDay} disabled={saving || !isHr}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                halfDay ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : halfDay ? (
                <ToggleRight className="h-5 w-5 mr-1.5" />
              ) : (
                <ToggleLeft className="h-5 w-5 mr-1.5" />
              )}
              {halfDay ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {!isHr && (
            <div className="mt-4 text-xs text-amber-600 bg-amber-50 rounded-lg px-4 py-3">
              Only HR and Admin users can modify policy settings.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Policy Summary</h2>
          <p className="text-sm text-gray-500 mb-4">Current state of all HR policies</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">Half-Day Leave</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${halfDay ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {halfDay ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
