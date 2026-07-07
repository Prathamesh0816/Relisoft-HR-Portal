import { SkeletonPage } from '../../components/resilience/Skeleton'
import ChatPanel from '../../components/resilience/ChatPanel'
import ErrorState from '../../components/resilience/ErrorState'

export default function AIAssistant() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-500 mt-1">Natural language workforce analysis</p>
      </div>
      <div className="h-[calc(100vh-220px)] min-h-[500px]">
        <ChatPanel />
      </div>
    </div>
  )
}
