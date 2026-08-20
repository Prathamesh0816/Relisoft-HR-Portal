import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card-surface">
          <div className="p-6">
            <h2 className="font-heading font-bold text-lg text-navy dark:text-white">Something went wrong in this view</h2>
            <p className="text-sm text-navy/50 dark:text-white/50 mt-1">The page failed to load. Switch to another view and try again, or report this issue to IT.</p>
            <pre className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl overflow-x-auto max-h-40">{this.state.error?.message || 'Unknown error'}</pre>
            <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-3 px-4 py-2 bg-navy dark:bg-navy-dark text-white font-bold text-sm rounded-xl">Retry</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}