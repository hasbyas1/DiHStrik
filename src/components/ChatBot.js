import React, { useState, useEffect, useRef } from "react";
import { SYMPTOMS, calculateBayesianDiagnosis } from "../data/knowledgeBase";
import "./ChatBot.css";

/* ─── Helpers ─── */
function getTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function buildBotMessage(text, isSymptomSelector = false, results = null) {
  return {
    id: Date.now() + Math.random(),
    from: "bot",
    text,
    isSymptomSelector,
    results,
    finalSelection: null, // Tempat menyimpan snapshot pilihan gejala
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

/* ─── Sub-components ─── */
function BotAvatar() {
  return (
    <div className="bot-avatar">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" fill="var(--amber-500)" stroke="var(--amber-700)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
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

/* ─── Main ChatBot ─── */
export default function ChatBot() {
  // --- Kumpulan State ---
  const [messages, setMessages] = useState([
    buildBotMessage("Halo! Saya DiHStrik 👋\n\nSaya akan membantu mengidentifikasi masalah kelistrikan di rumah Anda \nSilahkan centang semua gejala yang sedang Anda alami di bawah ini:", true)
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [disabledMsgIds, setDisabledMsgIds] = useState(new Set()); // Untuk mengunci pesan lama
  
  const [isDarkMode, setIsDarkMode] = useState(false); // State baru untuk Dark Mode

  const messagesEndRef = useRef(null);

  // --- Kumpulan useEffect ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // --- Kumpulan Fungsi (Handler) ---
  const handleToggleSymptom = (id) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleAnalyze = (msgId) => {
    if (selectedSymptoms.length === 0) return;
    
    // Kunci pesan ini agar tidak bisa dicheck lagi
    setDisabledMsgIds(prev => new Set(prev).add(msgId));

    // Snapshot pilihan saat ini ke dalam objek pesan tersebut
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, finalSelection: [...selectedSymptoms] } : m
    ));
    
    // Ambil teks gejala untuk ditampilkan di chat user
    const selectedSymptomTexts = selectedSymptoms.map(id => {
      const symptomObj = SYMPTOMS.find(s => s.id === id);
      return symptomObj ? `• ${symptomObj.text}` : "";
    }).join("\n");

    const userMsgText = `Tolong analisis ${selectedSymptoms.length} gejala berikut:\n${selectedSymptomTexts}`;
    setMessages(prev => [...prev, buildUserMessage(userMsgText)]);
    
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const diagnosisResults = calculateBayesianDiagnosis(selectedSymptoms);
      const topResults = diagnosisResults.slice(0, 3).filter(r => parseFloat(r.percentage) > 0);
      
      let replyText = "Berdasarkan analisis probabilitas Naive Bayes, berikut adalah kemungkinan penyebab utama:";
      
      setMessages(prev => [
        ...prev,
        buildBotMessage(replyText, false, topResults),
        buildBotMessage("Apakah Anda ingin melakukan diagnosis ulang?", true) 
      ]);
      
      // 4. RESET state global agar selector baru mulai dari nol
      setSelectedSymptoms([]);
    }, 1500);
  };

  // --- Render UI (Return) ---
  return (
    <div className="chatbot-shell">
      <header className="chat-header">
        <div className="header-icon">
          <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" fill="#fff" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="header-info">
          <span className="header-name">DiHStrik</span>
          <span className="header-status"><span className="status-dot" />Diagnosis Home Listrik - Sistem Pakar Probabilistik</span>
        </div>

        {/* --- TOMBOL TOGGLE DARK MODE --- */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            marginLeft: 'auto', 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none', 
            borderRadius: '50%', 
            width: '36px', height: '36px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: '0.2s',
            fontSize: '18px'
          }}
          title="Ganti Tema"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        {/* --- AKHIR TOMBOL --- */}
      </header>

      <div className="chat-messages">
        <div className="date-divider">Sesi Analisis Dimulai</div>

        {messages.map((msg) => {
          const isBot = msg.from === "bot";
          const isLocked = disabledMsgIds.has(msg.id);
          // Gunakan finalSelection jika sudah dikunci, jika belum gunakan state global
          const currentViewSelection = isLocked ? (msg.finalSelection || []) : selectedSymptoms;

          return (
            <div key={msg.id} className={`msg-row ${msg.from}`}>
              {isBot && <BotAvatar />}
              <div className="msg-col">
                {isBot && <span className="sender-label">Sistem Pakar</span>}
                <div className={`bubble ${msg.from}`}>
                  {msg.text.split("\n").filter(Boolean).map((line, i) => <p key={i} style={{ marginBottom: "6px" }}>{line}</p>)}
                  
                  {msg.results && (
                    <div style={{marginTop: '10px'}}>
                      {msg.results.map((res, idx) => (
                        <div key={res.id} className={`diagnosis-card diagnosis-${idx === 0 ? 'danger' : 'warning'}`}>
                          <div className="diag-header">
                            <span className="severity-badge badge-danger">#{idx + 1}</span>
                            <span className="diag-title">{res.name}</span>
                          </div>
                          <div className="diag-explanation">Probabilitas: <strong>{res.percentage}%</strong></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.isSymptomSelector && (
                    <div className="options-wrap" style={{marginTop: '12px'}}>
                      {SYMPTOMS.map(s => (
                        <label key={s.id} className={`symptom-label ${isLocked ? 'locked' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={currentViewSelection.includes(s.id)}
                            onChange={() => !isLocked && handleToggleSymptom(s.id)}
                            disabled={isLocked}
                          />
                          <span>{s.text}</span>
                        </label>
                      ))}
                      {!isLocked && (
                        <button 
                          className="opt-btn" 
                          style={{marginTop: '10px', background: 'var(--amber-500)', color: 'white', textAlign: 'center'}}
                          onClick={() => handleAnalyze(msg.id)}
                          disabled={selectedSymptoms.length === 0}
                        >
                          Analisis Gejala Terpilih
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          );
        })}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}