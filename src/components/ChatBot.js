import React, { useState, useEffect, useRef } from "react";
import { INITIAL_OPTIONS, KNOWLEDGE_TREE } from "../data/knowledgeBase";
import "./ChatBot.css";

/* ─── Helpers ─── */
function getTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function buildBotMessage(text, options = [], diagnosis = null) {
  return {
    id: Date.now() + Math.random(),
    from: "bot",
    text,
    options,
    diagnosis,
    time: getTime(),
  };
}

function buildUserMessage(text) {
  return {
    id: Date.now() + Math.random(),
    from: "user",
    text,
    time: getTime(),
  };
}

const WELCOME_MSG = buildBotMessage(
  "Halo! Saya DiHStrik 👋\n\nSaya akan membantu mengidentifikasi masalah kelistrikan di rumah Anda dan memberikan panduan penanganannya.\n\nApa masalah yang sedang Anda hadapi?",
  INITIAL_OPTIONS
);

/* ─── Sub-components ─── */

function BotAvatar() {
  return (
    <div className="bot-avatar">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"
          fill="var(--amber-500)"
          stroke="var(--amber-700)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    danger: { label: "⚠ Berbahaya", cls: "badge-danger" },
    warning: { label: "⚡ Perhatian", cls: "badge-warning" },
    info: { label: "ℹ Info", cls: "badge-info" },
  };
  const s = map[severity] || map.info;
  return <span className={`severity-badge ${s.cls}`}>{s.label}</span>;
}

function DiagnosisCard({ diagnosis }) {
  return (
    <div className={`diagnosis-card diagnosis-${diagnosis.severity}`}>
      <div className="diag-header">
        <SeverityBadge severity={diagnosis.severity} />
        <span className="diag-title">{diagnosis.title}</span>
      </div>
      <p className="diag-explanation">{diagnosis.explanation}</p>
      <div className="diag-steps-label">Langkah Penanganan:</div>
      <ol className="diag-steps">
        {diagnosis.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {diagnosis.warning && (
        <div className="diag-warning">
          <span>⚠ {diagnosis.warning}</span>
        </div>
      )}
    </div>
  );
}

function OptionButton({ label, onClick, disabled }) {
  return (
    <button className="opt-btn" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="msg-row bot">
      <BotAvatar />
      <div className="typing-bubble">
        <span /><span /><span />
      </div>
    </div>
  );
}

function Message({ msg, onOptionClick, optionsDisabled }) {
  const isBot = msg.from === "bot";
  const lines = msg.text.split("\n").filter(Boolean);

  return (
    <div className={`msg-row ${msg.from}`}>
      {isBot && <BotAvatar />}
      <div className="msg-col">
        {isBot && <span className="sender-label">DiHStrik · Sistem Pakar</span>}
        <div className={`bubble ${msg.from}`}>
          {lines.map((line, i) => (
            <p key={i} style={{ marginBottom: i < lines.length - 1 ? "6px" : 0 }}>{line}</p>
          ))}
          {msg.diagnosis && <DiagnosisCard diagnosis={msg.diagnosis} />}
          {msg.options && msg.options.length > 0 && (
            <div className="options-wrap">
              {msg.options.map((opt) => (
                <OptionButton
                  key={opt.id}
                  label={opt.label}
                  onClick={() => onOptionClick(opt)}
                  disabled={optionsDisabled}
                />
              ))}
            </div>
          )}
        </div>
        <span className="msg-time">{msg.time}</span>
      </div>
    </div>
  );
}

/* ─── Main ChatBot ─── */

export default function ChatBot() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [disabledMsgIds, setDisabledMsgIds] = useState(new Set());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function disableOptions(msgId) {
    setDisabledMsgIds((prev) => new Set([...prev, msgId]));
  }

  function handleOptionClick(msg, opt) {
    if (disabledMsgIds.has(msg.id)) return;
    disableOptions(msg.id);

    const userMsg = buildUserMessage(opt.label);
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      setIsTyping(false);
      const node = KNOWLEDGE_TREE[opt.id];

      if (!node) {
        setMessages((prev) => [
          ...prev,
          buildBotMessage(
            "Maaf, saya belum memiliki data untuk masalah ini. Silakan hubungi teknisi listrik bersertifikat untuk pemeriksaan langsung.",
            [{ id: "restart", label: "🔄 Mulai dari awal" }]
          ),
        ]);
        return;
      }

      if (node.diagnosis) {
        setMessages((prev) => [
          ...prev,
          buildBotMessage(
            `Berdasarkan gejala yang Anda sampaikan, berikut adalah hasil identifikasi:`,
            [
              { id: "restart", label: "🔄 Diagnosa masalah lain" },
              { id: "hubungi", label: "📞 Cara hubungi teknisi" },
            ],
            node
          ),
        ]);
      } else {
        const followOpts = node.options || [];
        setMessages((prev) => [
          ...prev,
          buildBotMessage(node.question, followOpts),
        ]);
      }
    }, 1200 + Math.random() * 600);
  }

  function handleAllOptionClick(msg, opt) {
    if (opt.id === "restart") {
      disableOptions(msg.id);
      const userMsg = buildUserMessage("Mulai diagnosa baru");
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          buildBotMessage(
            "Baik! Mari kita identifikasi masalah berikutnya. Apa yang sedang Anda alami?",
            INITIAL_OPTIONS
          ),
        ]);
      }, 900);
      return;
    }
    if (opt.id === "hubungi") {
      disableOptions(msg.id);
      const userMsg = buildUserMessage("Cara hubungi teknisi");
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          buildBotMessage(
            "Untuk masalah kelistrikan, Anda bisa menghubungi:\n\n• PLN 123 (layanan 24 jam)\n• PLN Mobile — laporkan gangguan via app\n• Teknisi listrik bersertifikat BNSP\n• Kontak AKLI (Asosiasi Kontraktor Listrik Indonesia) di area Anda\n\nSelalu minta teknisi menunjukkan sertifikat kompetensi sebelum bekerja.",
            [{ id: "restart", label: "🔄 Diagnosa masalah lain" }]
          ),
        ]);
      }, 900);
      return;
    }
    handleOptionClick(msg, opt);
  }

  function sendTextMessage() {
    const text = inputVal.trim();
    if (!text || isTyping) return;
    setInputVal("");
    const userMsg = buildUserMessage(text);
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = text.toLowerCase();
      let matched = null;

      // Simple keyword matching untuk input teks bebas
      if (lower.includes("mcb") || lower.includes("sekring") || lower.includes("trip") || lower.includes("turun"))
        matched = "mcb_trip";
      else if (lower.includes("lampu") || lower.includes("kedip") || lower.includes("redup"))
        matched = "lampu_kedip";
      else if (lower.includes("stop kontak") || lower.includes("colokan") || lower.includes("soket"))
        matched = "stop_kontak";
      else if (lower.includes("tagihan") || lower.includes("mahal") || lower.includes("boros"))
        matched = "tagihan_naik";
      else if (lower.includes("hangus") || lower.includes("bau") || lower.includes("bakar"))
        matched = "bau_hangus";
      else if (lower.includes("mati") || lower.includes("padam") || lower.includes("gelap"))
        matched = "listrik_mati";

      if (matched) {
        const node = KNOWLEDGE_TREE[matched];
        setMessages((prev) => [
          ...prev,
          buildBotMessage(node.question, node.options),
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          buildBotMessage(
            "Saya menangkap pertanyaan Anda! Untuk diagnosa yang lebih akurat, silakan pilih gejala yang paling sesuai:",
            INITIAL_OPTIONS
          ),
        ]);
      }
    }, 1100 + Math.random() * 500);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  }

  return (
    <div className="chatbot-shell">
      {/* Header */}
      <header className="chat-header">
        <div className="header-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"
              fill="#fff"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="header-info">
          <span className="header-name">DiHStrik</span>
          <span className="header-status">
            <span className="status-dot" />
            Diagnois Home Listrik - Berbasis Sistem Pakar
          </span>
        </div>
        <div className="header-badge">BETA</div>
      </header>

      {/* Messages */}
      <div className="chat-messages" role="log" aria-live="polite" aria-label="Percakapan chatbot">
        <div className="date-divider">Sesi dimulai · {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>

        {messages.map((msg) => (
          <Message
            key={msg.id}
            msg={msg}
            onOptionClick={(opt) => handleAllOptionClick(msg, opt)}
            optionsDisabled={disabledMsgIds.has(msg.id)}
          />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          placeholder="Ketik gejala atau pertanyaan..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          aria-label="Pesan"
        />
        <button
          className="send-btn"
          onClick={sendTextMessage}
          disabled={!inputVal.trim() || isTyping}
          aria-label="Kirim pesan"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
