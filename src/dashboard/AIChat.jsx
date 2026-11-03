import { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, Sparkles, LoaderCircle } from 'lucide-react'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')

function AIChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isLoading])

  const handleSend = async (e) => {
    e.preventDefault()

    const userMessage = message.trim()

    if (!userMessage || isLoading) return

    setMessage('')
    setError('')

    setMessages((previous) => [
      ...previous,
      {
        role: 'user',
        text: userMessage,
      },
    ])

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to get a response from Nutrio AI.'
        )
      }

      if (!data.success || typeof data.response !== 'string') {
        throw new Error('The AI returned an unexpected response.')
      }

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          text: data.response,
        },
      ])
    } catch (err) {
      console.error('AI Chat Error:', err)

      setError(
        err.message ||
          'Unable to connect to the AI service. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] min-h-[500px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          AI Nutrition Assistant
        </h1>

        <p className="text-gray-500 mt-2">
          Your personal companion for healthier eating.
        </p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <Bot size={23} />
          </div>

          <div>
            <h2 className="font-bold text-gray-800">Nutrio AI</h2>
            <p className="text-xs text-green-600">
              AI Assistant
            </p>
          </div>

          <Sparkles className="ml-auto text-green-600" size={21} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                <Bot size={19} />
              </div>

              <div className="max-w-[80%] p-4 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-700 text-sm leading-relaxed">
                Hello! 👋 I'm Nutrio AI, your nutrition assistant. Ask me about healthy meals, nutrition, calories, or better eating habits.
              </div>
            </div>
          )}

          {messages.map((item, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                item.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              {item.role === 'assistant' && (
                <div className="w-9 h-9 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <Bot size={19} />
                </div>
              )}

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  item.role === 'user'
                    ? 'bg-[#315C45] text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                }`}
              >
                {item.text}
              </div>

              {item.role === 'user' && (
                <div className="w-9 h-9 shrink-0 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                  <User size={19} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                <Bot size={19} />
              </div>

              <div className="flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl rounded-bl-sm text-sm">
                <LoaderCircle size={16} className="animate-spin" />
                Nutrio AI is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2 border border-gray-200">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me about nutrition..."
              maxLength={2000}
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none px-3 py-2 text-sm text-gray-700 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="bg-[#315C45] text-white p-3 rounded-lg hover:bg-[#264B37] disabled:opacity-40 transition"
              aria-label="Send message"
            >
              {isLoading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            Nutrio AI responses are AI-generated. Verify important nutrition advice with a qualified professional.
          </p>
        </form>
      </div>
    </div>
  )
}

export default AIChat