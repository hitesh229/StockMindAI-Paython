import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Trash2, Sparkles, HelpCircle } from 'lucide-react';
import { aiService } from '../services/api';

const parseMarkdownToHTML = (text) => {
  if (!text) return '';

  let html = text;

  // Escape HTML entities to prevent XSS except for our generated ones
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore '>' for blockquotes after escaping
  html = html.replace(/^&gt;\s*(.*)$/gm, '<blockquote>$1</blockquote>');

  // Headers (Order matters: h4, h3, h2, h1)
  html = html.replace(/^####\s*(.*)$/gm, '<h4 style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-top: 0.75rem; margin-bottom: 0.25rem;">$1</h4>');
  html = html.replace(/^###\s*(.*)$/gm, '<h3 style="font-size: 1.05rem; font-weight: 600; color: var(--color-blue); margin-top: 1rem; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.25rem;">$1</h3>');
  html = html.replace(/^##\s*(.*)$/gm, '<h2 style="font-size: 1.15rem; font-weight: 600; color: var(--color-blue); margin-top: 1.25rem; margin-bottom: 0.5rem;">$1</h2>');
  html = html.replace(/^#\s*(.*)$/gm, '<h1 style="font-size: 1.3rem; font-weight: 700; color: var(--color-blue); margin-top: 1.5rem; margin-bottom: 0.75rem;">$1</h1>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 600;">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong style="color: var(--text-primary); font-weight: 600;">$1</strong>');

  // Italics (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, '<em style="color: var(--text-secondary); font-style: italic;">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em style="color: var(--text-secondary); font-style: italic;">$1</em>');

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code style="background-color: rgba(255,255,255,0.05); padding: 0.15rem 0.35rem; border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #f43f5e;">$1</code>');

  // Lists (- Item or * Item)
  html = html.replace(/^\s*[-*]\s*(.*)$/gm, '<li style="margin-left: 1rem; margin-bottom: 0.35rem; list-style-type: disc;">$1</li>');

  // Blockquotes formatting styling
  html = html.replace(/<blockquote>(.*?)<\/blockquote>/g, '<blockquote style="border-left: 3px solid var(--color-blue); background-color: rgba(59, 130, 246, 0.05); padding: 0.5rem 0.75rem; margin: 0.5rem 0; border-radius: 0 4px 4px 0; font-style: italic; color: var(--text-secondary);">$1</blockquote>');

  // Parse Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let parsedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
      if (!isSeparator) {
        tableRows.push(cells);
      }
    } else {
      if (inTable) {
        let tableHTML = '<table style="width:100%; border-collapse:collapse; margin: 0.75rem 0; font-size:0.8rem; text-align:left; background: rgba(255, 255, 255, 0.01); border-radius:6px; overflow:hidden; border: 1px solid var(--border-glass);">';
        tableRows.forEach((row, idx) => {
          const isHeader = idx === 0;
          tableHTML += `<tr style="${isHeader ? 'background: rgba(59, 130, 246, 0.1); border-bottom: 1px solid var(--border-glass); font-weight:600;' : 'border-bottom: 1px solid rgba(255,255,255,0.03);'}">`;
          row.forEach(cell => {
            const tag = isHeader ? 'th' : 'td';
            tableHTML += `<${tag} style="padding: 0.5rem 0.75rem; color: ${isHeader ? 'var(--text-primary)' : 'var(--text-secondary)'};">${cell}</${tag}>`;
          });
          tableHTML += '</tr>';
        });
        tableHTML += '</table>';
        parsedLines.push(tableHTML);
        tableRows = [];
        inTable = false;
      }
      parsedLines.push(lines[i]);
    }
  }
  
  if (inTable) {
    let tableHTML = '<table style="width:100%; border-collapse:collapse; margin: 0.75rem 0; font-size:0.8rem; text-align:left; background: rgba(255, 255, 255, 0.01); border-radius:6px; overflow:hidden; border: 1px solid var(--border-glass);">';
    tableRows.forEach((row, idx) => {
      const isHeader = idx === 0;
      tableHTML += `<tr style="${isHeader ? 'background: rgba(59, 130, 246, 0.1); border-bottom: 1px solid var(--border-glass); font-weight:600;' : 'border-bottom: 1px solid rgba(255,255,255,0.03);'}">`;
      row.forEach(cell => {
        const tag = isHeader ? 'th' : 'td';
        tableHTML += `<${tag} style="padding: 0.5rem 0.75rem; color: ${isHeader ? 'var(--text-primary)' : 'var(--text-secondary)'};">${cell}</${tag}>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</table>';
    parsedLines.push(tableHTML);
  }

  html = parsedLines.join('\n');

  // Convert newlines to line breaks
  html = html.replace(/\n/g, '<br />');
  html = html.replace(/(<\/tr>|<table.*?>|<\/table>|<blockquote>|<\/blockquote>|<\/li>)<br\s*\/?>/gi, '$1');
  html = html.replace(/<br\s*\/?>((?:<tr>|<tr.*?>))/gi, '$1');

  return html;
};

export default function AIChatBox({ activeSymbol = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const history = await aiService.getChatHistory();
      // History has items with properties: question, answer, createdAt, etc.
      // We can map this to messages array: [{ sender: 'user', text: item.question }, { sender: 'bot', text: item.answer }]
      const mapped = [];
      history.forEach(item => {
        mapped.push({ id: `q-${item.id}`, sender: 'user', text: item.question, time: item.createdAt });
        mapped.push({ id: `a-${item.id}`, sender: 'bot', text: item.answer, time: item.createdAt });
      });
      setMessages(mapped);
    } catch (error) {
      console.error('Failed fetching chat history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) setInput('');

    // Append user message immediately
    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: query, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await aiService.chat(query, activeSymbol);
      // response returns an object with answer and chatHistory object
      const botMsg = { id: `bot-${Date.now()}`, sender: 'bot', text: response.answer, time: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = { id: `err-${Date.now()}`, sender: 'bot', text: 'Error interacting with AI cognitive services. Please verify API configurations.', time: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all chat conversation history?')) return;
    try {
      await aiService.clearChatHistory();
      setMessages([]);
    } catch (error) {
      console.error(error);
    }
  };

  const suggestedPrompts = activeSymbol
    ? [
        `Why is ${activeSymbol} stock moving today?`,
        `Give me a technical signal breakout analysis for ${activeSymbol}.`,
        `What is the sentiment rating on ${activeSymbol}?`
      ]
    : [
        'Analyze my current portfolio diversification and risk.',
        'Which market sectors are showing bullish breakouts today?',
        'Give me a summary of the general stock market trend.'
      ];

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '500px',
      padding: '1.25rem',
      gap: '1rem',
      position: 'relative'
    }}>
      {/* Chat header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            padding: '0.4rem',
            borderRadius: '6px',
            color: 'var(--color-blue)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>AI Advisor Terminal</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {activeSymbol ? `Focused on ${activeSymbol} Context` : 'General Cognitive Advisory Interface'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="hover:text-red-400">
            <Trash2 size={16} />
            <span style={{ fontSize: '0.75rem' }}>Clear Console</span>
          </button>
        )}
      </div>

      {/* Suggestion tags if empty */}
      {messages.length === 0 && !loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: '1rem',
          textAlign: 'center',
          padding: '1.5rem'
        }}>
          <Sparkles size={36} color="var(--color-blue)" style={{ opacity: 0.7 }} />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Cognitive Advisor Ready</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto' }}>
              Ask questions regarding stock metrics, live alerts, technical breakdowns, portfolio health or market sentiment.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '380px' }}>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                style={{
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                className="btn-secondary"
              >
                <HelpCircle size={14} style={{ color: 'var(--color-blue)' }} />
                <span style={{ flex: 1 }}>{p}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages console area */}
      {messages.length > 0 && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          paddingRight: '0.25rem'
        }}>
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  flexDirection: isBot ? 'row' : 'row-reverse',
                  maxWidth: '85%'
                }}
              >
                {/* Sender Avatar */}
                <div style={{
                  padding: '0.4rem',
                  borderRadius: '6px',
                  backgroundColor: isBot ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: isBot ? 'var(--color-blue)' : 'var(--color-green)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message Bubble */}
                <div 
                   style={{
                     backgroundColor: isBot ? 'rgba(255, 255, 255, 0.02)' : 'rgba(59, 130, 246, 0.08)',
                     border: '1px solid',
                     borderColor: isBot ? 'var(--border-glass)' : 'rgba(59, 130, 246, 0.15)',
                     borderRadius: isBot ? '0 10px 10px 10px' : '10px 0 10px 10px',
                     padding: '0.75rem 1rem',
                     fontSize: '0.85rem',
                     lineHeight: 1.45,
                     color: 'var(--text-primary)',
                     whiteSpace: isBot ? 'normal' : 'pre-wrap'
                   }}
                   {...(isBot ? { dangerouslySetInnerHTML: { __html: parseMarkdownToHTML(msg.text) } } : { children: msg.text })}
                 />
              </div>
            );
          })}

          {/* Loading dot indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{
                padding: '0.4rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--color-blue)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Bot size={16} />
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                borderRadius: '0 10px 10px 10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span className="pulse-indicator" style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--color-blue)', borderRadius: '50%' }}></span>
                <span className="pulse-indicator" style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--color-blue)', borderRadius: '50%', animationDelay: '0.3s' }}></span>
                <span className="pulse-indicator" style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--color-blue)', borderRadius: '50%', animationDelay: '0.6s' }}></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      )}

      {/* Input controls block */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '0.75rem',
          marginTop: 'auto'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeSymbol ? `Ask about ${activeSymbol} (e.g. "Will it rebound?")` : "Ask a financial advisory question..."}
          style={{ flex: 1, fontSize: '0.85rem' }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 1rem',
            borderRadius: '8px',
            backgroundColor: input.trim() ? 'var(--color-blue)' : 'rgba(255, 255, 255, 0.03)',
            color: input.trim() ? 'white' : 'var(--text-muted)',
            cursor: input.trim() ? 'pointer' : 'default'
          }}
          disabled={loading || !input.trim()}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
