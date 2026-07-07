import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { useAIChat } from '../../hooks/useAI';

const quickActions = [
  { label: 'Apply for leave', icon: '📅' },
  { label: 'My balance', icon: '💰' },
  { label: 'HR Policies', icon: '📋' },
  { label: 'My attendance', icon: '⏰' },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, clearMessages, loading } = useAIChat();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('aiChatMessages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          parsed.forEach(m => {
            if (m.role === 'assistant' && !messages.find(x => x.timestamp === m.timestamp)) {
            }
          });
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('aiChatMessages', JSON.stringify(messages.slice(-50)));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  const handleQuickAction = (action) => {
    setInput(action.label);
    setTimeout(() => handleSend({ preventDefault: () => {} }), 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-relisoft-600 to-relisoft-800 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center group"
        title="AI HR Assistant"
      >
        <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-72' : 'w-80 sm:w-96'} transition-all duration-300`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-relisoft-600 to-relisoft-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI HR Assistant</h3>
              <p className="text-[10px] text-relisoft-200">ReliSoft HR</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
              <Minimize2 className="h-4 w-4" />
            </button>
            <button onClick={() => { setIsOpen(false); clearMessages(); }} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="h-10 w-10 text-relisoft-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Hello! I'm your AI HR Assistant</p>
                  <p className="text-xs text-gray-400 mt-1">Ask me anything about HR policies, leave, attendance, and more.</p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-relisoft-300 hover:text-relisoft-600 hover:bg-relisoft-50 transition-colors shadow-sm"
                      >
                        <span>{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-relisoft-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md shadow-sm'
                  }`}>
                    {msg.content}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 text-[10px] text-relisoft-200">
                        Sources: {msg.sources.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-relisoft-600" />
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-100 bg-white">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-relisoft-600 outline-none placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 bg-relisoft-600 text-white rounded-xl hover:bg-relisoft-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
