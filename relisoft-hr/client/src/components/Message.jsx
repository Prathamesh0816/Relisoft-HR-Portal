export default function Message({ message }) {
  if (!message) return null
  const isError = message.type === 'error'
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md px-5 py-4 rounded-xl shadow-2xl text-sm font-semibold ${
      isError
        ? 'bg-red-50 dark:bg-red-900/80 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800'
        : 'bg-emerald-50 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
    }`}>
      {message.text}
    </div>
  )
}
