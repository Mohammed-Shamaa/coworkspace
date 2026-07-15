'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { aiApi } from '@/lib/api'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1565C0]/10">
        <Bot size={14} className="text-[#1565C0]" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#1565C0]" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#1565C0]" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#1565C0]" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export default function AiAssistant() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const chatMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
      const res = await aiApi.chat(chatMessages)
      const reply: string = res.data.reply || ''
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t('aiAssistant.errorMessage')
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('aiAssistant.close') : t('aiAssistant.open')}
        className="group relative rounded-lg p-2 md:p-2.5 text-gray-500 transition-all duration-300 hover:scale-105 hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm hover:shadow-purple-200/50 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-purple-400 dark:hover:shadow-purple-900/30"
      >
        <MessageCircle size={16} className="transition-transform duration-300 group-hover:scale-110" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-4 right-4 z-[100] w-[calc(100vw-2rem)] max-w-sm origin-bottom-right transition-all duration-300 ease-out md:bottom-6 md:right-6 ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-black/10 dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#1565C0] to-[#0d47a1] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-white" />
              <span className="text-sm font-semibold text-white">{t('aiAssistant.title')}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'min(60vh, 400px)' }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <Bot size={40} className="mb-3 text-[#1565C0]/30" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('aiAssistant.welcome')}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('aiAssistant.welcomeHint')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-2 px-4 py-3 ${msg.role === 'assistant' ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      msg.role === 'assistant' ? 'bg-[#1565C0]/10' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <Bot size={14} className="text-[#1565C0]" />
                      ) : (
                        <User size={14} className="text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                        {msg.role === 'assistant' ? t('aiAssistant.bot') : t('aiAssistant.you')}
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('aiAssistant.placeholder')}
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#1565C0] focus:bg-white focus:ring-1 focus:ring-[#1565C0]/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-[#1565C0] dark:focus:bg-gray-900"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1565C0] text-white transition-all hover:bg-[#0d47a1] disabled:opacity-40"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
""