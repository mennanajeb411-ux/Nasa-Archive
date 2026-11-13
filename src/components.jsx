import { useEffect, useRef, useState } from 'react'

const WEBHOOK_URL = 'https://ammar864.app.n8n.cloud/webhook/the-forgotten-ones'

const sessionId =
  localStorage.getItem('chat-session') ||
  (() => {
    const id = crypto.randomUUID()
    localStorage.setItem('chat-session', id)
    return id
  })()

/* بيطلّع نص الرد مهما كان شكله (JSON أو نص عادي) */
function extractReply(data) {
  const item = Array.isArray(data) ? data[0] : data
  if (typeof item === 'string') return item
  return (
    item?.output ||
    item?.text ||
    item?.reply ||
    item?.response ||
    item?.message ||
    JSON.stringify(item)
  )
}

function Chat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! Ask me anything about the forgotten spacecraft and missions. 🚀' },
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      })
      if (!res.ok) throw new Error('Request failed: ' + res.status)

      const raw = await res.text()
      let reply = raw
      try {
        reply = extractReply(JSON.parse(raw))
      } catch {
        /* الرد نص عادي */
      }
      setMessages((m) => [...m, { role: 'bot', text: reply }])
    } catch (err) {
      console.error(err)
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>Mission Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
            ))}
            {loading && <div className="chat-msg bot typing">Thinking…</div>}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type your question…"
            />
            <button onClick={send} disabled={loading}>Send</button>
          </div>
        </div>
      )}

      <button className="chat-toggle" onClick={() => setOpen((o) => !o)} aria-label="Open chat">
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}

export default Chat