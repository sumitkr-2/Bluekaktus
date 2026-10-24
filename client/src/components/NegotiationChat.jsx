import { useState } from "react";
import { Bot, Send, User, LoaderCircle } from "lucide-react";

export default function NegotiationChat({ onAsk }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your fabric procurement assistant. Ask me to compare suppliers, recommend a target price, or draft a counteroffer."
    }
  ]);
  const [loading, setLoading] = useState(false);

  async function send(text = message) {
    const query = text.trim();

    if (!query || loading) return;

    setMessages(prev => [...prev, { role: "user", text: query }]);
    setMessage("");
    setLoading(true);

    try {
      const reply = await onAsk(query);
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "I couldn't process that request. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel chat-panel">
      <div className="chat-header">
        <div className="agent-icon"><Bot size={21} /></div>
        <div>
          <h3>AI Negotiator</h3>
          <p className="muted">Fabric procurement assistant</p>
        </div>
        <span className="online-dot" />
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div className={`chat-message ${m.role}`} key={i}>
            <div className="message-avatar">
              {m.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="message-text">{m.text}</div>
          </div>
        ))}

        {loading && (
          <div className="loading-message">
            <LoaderCircle size={16} className="spin" />
            Analyzing quotations...
          </div>
        )}
      </div>

      <div className="suggestions">
        {[
          "Which supplier is best?",
          "Generate a counteroffer"
        ].map(q => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => send(q)}
          >
            {q}
          </button>
        ))}
      </div>

      <form
        className="chat-input"
        onSubmit={e => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Ask about fabric prices..."
          aria-label="Message to AI negotiator"
        />
        <button type="submit" disabled={loading || !message.trim()}>
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}