import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Copy, Check, User, Trash2 } from 'lucide-react';
import { aiApi } from '../../services/aiApi';
import { Button } from '../../components/common/Button';

export const AiTutorPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi Alex! I am your **UniQuest AI Conceptual Tutor**.\n\nI can explain complex university computer science concepts (like 3NF/BCNF normalization, deadlock avoidance, or Dijkstra's algorithm), write code examples, or give you exam practice questions. What are we conquering today?",
      suggestedFollowUps: [
        "Explain 3NF vs BCNF normalization with a simple analogy",
        "How does Banker's Algorithm detect unsafe states in OS?",
        "What is the time complexity of Dijkstra with a Priority Queue?"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('Database Management Systems');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiApi.askTutor({
        message: textToSend,
        subject,
        history: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: response.reply,
          suggestedFollowUps: response.suggestedFollowUps,
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "⚠️ I encountered an error communicating with the AI service. Please try asking again!",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto h-[calc(100vh-140px)] min-h-[550px]">
      {/* Header Bar */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-4 sm:p-5 shadow-brutal flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-pink text-white border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-brand-dark">AI Conceptual Tutor</h1>
              <span className="text-[10px] font-black uppercase bg-brand-green text-brand-dark px-2 py-0.5 rounded-full border border-brand-dark">
                Active
              </span>
            </div>
            <p className="text-xs font-semibold text-brand-dark/60">
              Powered by Google Gemini • Tailored for University CS Curricula
            </p>
          </div>
        </div>

        {/* Subject Context Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-brand-dark/70 hidden md:inline">Focus:</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-cream-100 font-bold text-xs border-2 border-brand-dark rounded-xl px-3 py-2 shadow-brutal-sm focus:outline-none cursor-pointer"
          >
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Machine Learning & AI">Machine Learning & AI</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
          </select>

          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-2 rounded-xl border border-brand-dark hover:bg-rose-50 text-brand-red shadow-brutal-sm cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 bg-white border-3 border-brand-dark rounded-3xl p-4 sm:p-6 shadow-brutal-lg overflow-y-auto flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl border-2 border-brand-dark flex items-center justify-center text-base shrink-0 shadow-brutal-sm ${
                msg.sender === 'user' ? 'bg-brand-blue text-white' : 'bg-brand-gold text-brand-dark'
              }`}
            >
              {msg.sender === 'user' ? '👤' : '🤖'}
            </div>

            {/* Message Bubble */}
            <div
              className={`p-4 rounded-2xl border-2 border-brand-dark text-xs sm:text-sm font-medium leading-relaxed shadow-brutal-sm relative group ${
                msg.sender === 'user'
                  ? 'bg-brand-blue text-white'
                  : 'bg-cream-50 text-brand-dark'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

              {msg.sender === 'ai' && (
                <button
                  onClick={() => handleCopy(msg.text, idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg border border-brand-dark bg-white text-brand-dark opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy message"
                >
                  {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Follow-up Suggestion Chips */}
              {msg.suggestedFollowUps?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-brand-dark/20 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-brand-dark/60">
                    Suggested Next Questions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSend(chip)}
                        className="text-left text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-brand-dark border border-brand-dark hover:bg-brand-gold transition-colors shadow-brutal-sm cursor-pointer"
                      >
                        💡 {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 self-start">
            <div className="w-9 h-9 rounded-xl border-2 border-brand-dark bg-brand-gold flex items-center justify-center text-base">
              🤖
            </div>
            <div className="p-4 bg-cream-100 border-2 border-brand-dark rounded-2xl text-xs font-bold text-brand-dark animate-pulse shadow-brutal-sm">
              AI Tutor is crafting explanation with code and analogies... 💭
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white border-3 border-brand-dark rounded-3xl p-3 shadow-brutal flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${subject} (e.g. "Explain 3NF with an example")...`}
          className="flex-1 bg-cream-50 text-brand-dark font-medium text-xs sm:text-sm border-2 border-brand-dark rounded-2xl px-4 py-3 shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
        <Button
          type="submit"
          variant="pink"
          size="md"
          disabled={loading || !input.trim()}
          icon={Send}
          className="font-black"
        >
          Ask Tutor
        </Button>
      </form>
    </div>
  );
};
