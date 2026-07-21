import { useState } from 'react'
import useStore from '../store'
import { changePassword } from '../api'

export default function Settings() {
  const { setMessage } = useStore()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setSubmitting(true)
    try {
      const res = await changePassword(form.oldPassword, form.newPassword)
      setMessage({ type: 'success', text: res.message })
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="card-surface p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-navy dark:text-white">Change password</h3>
          <p className="text-sm text-muted mt-1">Update your account password. You'll use the new password next time you sign in.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Current password</label>
            <input
              type="password"
              value={form.oldPassword}
              onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
              placeholder="Enter current password"
              required
              className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">New password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Enter new password"
              required
              className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Confirm new password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
              className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white"
            />
          </div>
          <button type="submit" disabled={submitting} className="gold-button w-full h-12 rounded-xl font-bold text-sm">
            {submitting ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
