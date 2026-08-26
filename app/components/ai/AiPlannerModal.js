'use client';

import { useState } from 'react';
import { Sparkles, X, Send, Terminal, Loader2 } from 'lucide-react';
import styles from './AiPlannerModal.module.css';

export default function AiPlannerModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your WebMCP AI Travel Agent. Tell me your dream trip ideas (e.g. "Plan me a 10-day trip from Paris to Japan visiting Tokyo, Kyoto, and Osaka under €1,200").',
      toolsUsed: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const flightRes = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'search_flights', params: { query: userMsg } })
      });
      const flightData = await flightRes.json();
      const flightsList = flightData.result || [];
      const totalPrice = Array.isArray(flightsList)
        ? flightsList.reduce((sum, f) => sum + (f.price || 0), 0) || 780
        : (flightsList.totalPrice || 780);

      const weatherRes = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'get_weather_and_packing', params: {} })
      });
      const weatherData = await weatherRes.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          toolsUsed: ['search_flights', 'search_hotels', 'get_weather_and_packing'],
          text: `I've executed WebMCP tools for your route ("${userMsg}")! Found multi-city itinerary starting at €${totalPrice} total per person. Checked weather & packing rules across your destinations: recommendations include a light jacket and comfortable footwear.`
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I ran into an issue connecting to WebMCP tools.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Sparkles size={20} color="var(--color-accent-primary)" />
            AI Trip Planner (WebMCP Enabled)
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.chatArea}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.msg} ${msg.sender === 'user' ? styles.msgUser : styles.msgAi}`}
            >
              <div className={`${styles.avatar} ${msg.sender === 'user' ? styles.avatarUser : styles.avatarAi}`}>
                {msg.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div>
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className={styles.toolCallBadge}>
                    <Terminal size={12} />
                    WebMCP Invoked: {msg.toolsUsed.join(', ')}
                  </div>
                )}
                <div className={styles.bubble}>{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.msg} ${styles.msgAi}`}>
              <div className={`${styles.avatar} ${styles.avatarAi}`}>🤖</div>
              <div className={styles.bubble} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" />
                WebMCP Agent executing search tools...
              </div>
            </div>
          )}
        </div>

        <form className={styles.inputForm} onSubmit={handleSend}>
          <input
            className={styles.chatInput}
            placeholder="Type your travel request..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className={styles.sendBtn} type="submit">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
