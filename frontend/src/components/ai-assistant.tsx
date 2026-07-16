'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { aiApi } from '@/lib/api'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 px-4 py-2"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1565C0]/10">
        <Bot size={14} className="text-[#1565C0]" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 dark:bg-gray-800">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-[#1565C0]"
            style={{ animationDelay: `${delay}ms`, animationDuration: '800ms' }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex items-start gap-2 px-4 py-2.5 ${isUser ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-[#1565C0]/10'
        }`}
      >
        {isUser ? (
          <User size={14} className="text-gray-600 dark:text-gray-400" />
        ) : (
          <Bot size={14} className="text-[#1565C0]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">
          {isUser ? 'You' : 'Deskora AI'}
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          {msg.content}
        </p>
      </div>
    </motion.div>
  )
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1565C0]/10 to-[#D4AF37]/10 ring-1 ring-[#1565C0]/10 dark:from-[#1565C0]/20 dark:to-[#D4AF37]/5 dark:ring-white/5">
        <Bot size={28} className="text-[#1565C0]/60" />
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {t('aiAssistant.welcome')}
      </p>
      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
        {t('aiAssistant.welcomeHint')}
      </p>
    </motion.div>
  )
}

function MobileChatPanel({
  close,
  t,
  messages,
  loading,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  inputRef,
  messagesEndRef,
}: {
  close: () => void
  t: (key: string) => string
  messages: Message[]
  loading: boolean
  input: string
  setInput: (v: string) => void
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-2xl shadow-black/[0.08] backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/95"
    >
      <div className="relative flex items-center justify-between bg-gradient-to-r from-[#1565C0] to-[#0d47a1] px-5 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
              <Bot size={15} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              <span>Des</span>
              <span className="text-[#D4AF37]">K</span>
              <span>ora</span>
              <span className="ml-1.5 font-medium opacity-80">Assistant</span>
            </span>
          </div>
          <span className="mt-0.5 pl-9 text-[11px] font-medium text-white/55">
            {t('aiAssistant.subtitle')}
          </span>
        </div>
        <button
          onClick={close}
          aria-label="Close AI Assistant"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/15 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {messages.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] dark:border-gray-800">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('aiAssistant.placeholder')}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400
                       focus:border-[#1565C0]/40 focus:bg-white focus:ring-[3px] focus:ring-[#1565C0]/10
                       disabled:opacity-50
                       dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:placeholder:text-gray-500
                       dark:focus:border-[#1565C0]/50 dark:focus:bg-gray-900 dark:focus:ring-[#1565C0]/15"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1565C0] text-white transition-all
                       hover:bg-[#0d47a1] hover:shadow-lg hover:shadow-[#1565C0]/25 active:scale-90
                       disabled:opacity-40 disabled:hover:shadow-none"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function DesktopChatPanel({
  close,
  t,
  messages,
  loading,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  inputRef,
  messagesEndRef,
}: {
  close: () => void
  t: (key: string) => string
  messages: Message[]
  loading: boolean
  input: string
  setInput: (v: string) => void
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed z-[100] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 lg:top-[68px] lg:right-4 lg:left-auto lg:bottom-auto lg:translate-x-0 lg:translate-y-0"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-auto max-h-[600px] w-[480px] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-2xl shadow-black/[0.08] backdrop-blur-xl lg:w-[420px] dark:border-gray-700/60 dark:bg-gray-900/95"
      >
        <div className="relative flex items-center justify-between bg-gradient-to-r from-[#1565C0] to-[#0d47a1] px-5 py-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                <Bot size={15} className="text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white">
                <span>Des</span>
                <span className="text-[#D4AF37]">K</span>
                <span>ora</span>
                <span className="ml-1.5 font-medium opacity-80">Assistant</span>
              </span>
            </div>
            <span className="mt-0.5 pl-9 text-[11px] font-medium text-white/55">
              {t('aiAssistant.subtitle')}
            </span>
          </div>
          <button
            onClick={close}
            aria-label="Close AI Assistant"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/15 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {messages.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <div>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aiAssistant.placeholder')}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400
                         focus:border-[#1565C0]/40 focus:bg-white focus:ring-[3px] focus:ring-[#1565C0]/10
                         disabled:opacity-50
                         dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:placeholder:text-gray-500
                         dark:focus:border-[#1565C0]/50 dark:focus:bg-gray-900 dark:focus:ring-[#1565C0]/15"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1565C0] text-white transition-all
                         hover:bg-[#0d47a1] hover:shadow-lg hover:shadow-[#1565C0]/25 active:scale-90
                         disabled:opacity-40 disabled:hover:shadow-none"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AiAssistant() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!isMobile || !isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isMobile, isOpen])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setTimeout(() => buttonRef.current?.focus(), 200)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const chatMessages = [...messages, userMessage].map((m) => ({ role: m.role, content: m.content }))
      const res = await aiApi.chat(chatMessages)
      const reply: string = res.data.reply || ''
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { reply?: string } }; message?: string }
      const fallback = error.response?.data?.reply || error.message || t('aiAssistant.errorMessage')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fallback },
      ])
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

  const close = () => {
    setIsOpen(false)
    setTimeout(() => buttonRef.current?.focus(), 200)
  }

  const sharedProps = {
    close,
    t,
    messages,
    loading,
    input,
    setInput,
    handleSend,
    handleKeyDown,
    inputRef,
    messagesEndRef,
  }

  const content = isOpen ? (
    isMobile ? (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/45"
          style={{ zIndex: 999999 }}
          onClick={close}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex flex-col p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,16px))]"
          style={{ zIndex: 999999 }}
        >
          <MobileChatPanel {...sharedProps} />
        </motion.div>
      </>
    ) : (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm"
          onClick={close}
        />
        <DesktopChatPanel {...sharedProps} />
      </>
    )
  ) : null

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-label={isOpen ? t('aiAssistant.close') : t('aiAssistant.open')}
        className="group rounded-lg p-2 md:p-2.5 text-gray-500 transition-all duration-300 hover:scale-105 hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm hover:shadow-purple-200/50 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-purple-400 dark:hover:shadow-purple-900/30"
      >
        <MessageCircle size={16} className="transition-transform duration-300 group-hover:scale-110" />
      </button>
      {isMobile && typeof document !== 'undefined'
        ? createPortal(<AnimatePresence>{content}</AnimatePresence>, document.body)
        : <AnimatePresence>{content}</AnimatePresence>
      }
    </>
  )
}
