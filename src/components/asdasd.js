// import React, { useState, useEffect, useRef } from "react";
// import { SYMPTOMS, calculateBayesianDiagnosis } from "../data/knowledgeBase";
// import "./ChatBot.css";

// /* ─── Helpers ─── */
// function getTime() {
//   return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
// }

// function buildBotMessage(text, isSymptomSelector = false, results = null) {
//   return {
//     id: Date.now() + Math.random(),
//     from: "bot",
//     text,
//     isSymptomSelector,
//     results,
//     time: getTime(),
//   };
// }

// function buildUserMessage(text) {
//   return {
//     id: Date.now() + Math.random(),
//     from: "user",
//     text,
//     time: getTime(),
//   };
// }

// /* ─── Sub-components ─── */
// function BotAvatar() {
//   return (
//     <div className="bot-avatar">
//       <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" fill="var(--amber-500)" stroke="var(--amber-700)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>
//     </div>
//   );
// }

// function TypingIndicator() {
//   return (
//     <div className="msg-row bot">
//       <BotAvatar />
//       <div className="typing-bubble">
//         <span /><span /><span />
//       </div>
//     </div>
//   );
// }

// /* ─── Main ChatBot ─── */
// export default function ChatBot() {
//   const [messages, setMessages] = useState([
//     buildBotMessage("Halo! Saya DiHStrik 👋\n\nSistem saya sekarang dilengkapi algoritma Naive Bayes untuk mendiagnosis masalah berdasarkan multigejala.\n\nSilakan centang semua gejala yang sedang Anda alami di bawah ini:", true)
//   ]);
//   const [isTyping, setIsTyping] = useState(false);
//   const [selectedSymptoms, setSelectedSymptoms] = useState([]);
//   const [isSelectorDisabled, setIsSelectorDisabled] = useState(false);
  
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isTyping]);

//   const handleToggleSymptom = (id) => {
//     setSelectedSymptoms(prev => 
//       prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
//     );
//   };

//   const handleAnalyze = () => {
//     if (selectedSymptoms.length === 0) return;
    
//     setIsSelectorDisabled(true); // Kunci checkbox untuk sesi ini
    
//     // 1. Ambil teks asli dari setiap ID gejala yang dipilih
//     const selectedSymptomTexts = selectedSymptoms.map(id => {
//       const symptomObj = SYMPTOMS.find(s => s.id === id);
//       return symptomObj ? `• ${symptomObj.text}` : "";
//     }).join("\n"); // Gabungkan dengan enter (newline)

//     // 2. Masukkan list gejala tersebut ke dalam bubble chat User
//     const userMsgText = `Tolong analisis ${selectedSymptoms.length} gejala berikut:\n${selectedSymptomTexts}`;
//     const userMsg = buildUserMessage(userMsgText);
    
//     setMessages(prev => [...prev, userMsg]);
//     setIsTyping(true);

//     // Proses Kalkulasi Teorema Bayes
//     setTimeout(() => {
//       setIsTyping(false);
//       const diagnosisResults = calculateBayesianDiagnosis(selectedSymptoms);
      
//       // Ambil top 3 hasil tertinggi yang probabilitasnya > 0
//       const topResults = diagnosisResults.slice(0, 3).filter(r => parseFloat(r.percentage) > 0);
      
//       let replyText = "Berdasarkan analisis probabilitas Naive Bayes dari gejala yang Anda pilih, berikut adalah kemungkinan penyebab utama:\n";
      
//       setMessages(prev => [
//         ...prev,
//         buildBotMessage(replyText, false, topResults),
//         buildBotMessage("Apakah Anda ingin melakukan diagnosis ulang dengan gejala lain?", true) 
//       ]);
      
//       // Reset pilihan untuk diagnosis berikutnya
//       setSelectedSymptoms([]);
//       setIsSelectorDisabled(false);
//     }, 1500);
//   };

//   return (
//     <div className="chatbot-shell">
//       {/* Header */}
//       <header className="chat-header">
//         <div className="header-icon">
//           <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" fill="#fff" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
//         </div>
//         <div className="header-info">
//           <span className="header-name">DiHStrik (Bayesian)</span>
//           <span className="header-status"><span className="status-dot" />Diagnosis Home Listrik - Berbasis Sistem Pakar</span>
//         </div>
//       </header>

//       {/* Messages */}
//       <div className="chat-messages">
//         <div className="date-divider">Sesi Analisis Dimulai</div>

//         {messages.map((msg) => {
//           const isBot = msg.from === "bot";
//           const lines = msg.text.split("\n").filter(Boolean);

//           return (
//             <div key={msg.id} className={`msg-row ${msg.from}`}>
//               {isBot && <BotAvatar />}
//               <div className="msg-col">
//                 {isBot && <span className="sender-label">DiHStrik Expert</span>}
//                 <div className={`bubble ${msg.from}`}>
//                   {lines.map((line, i) => <p key={i} style={{ marginBottom: "6px" }}>{line}</p>)}
                  
//                   {/* Render Hasil Analisis Bayesian */}
//                   {msg.results && (
//                     <div style={{marginTop: '10px'}}>
//                       {msg.results.map((res, idx) => (
//                         <div key={res.id} className={`diagnosis-card diagnosis-${idx === 0 ? 'danger' : 'warning'}`}>
//                           <div className="diag-header">
//                             <span className="severity-badge badge-danger">#{idx + 1}</span>
//                             <span className="diag-title">{res.name}</span>
//                           </div>
//                           <div className="diag-explanation">
//                             Probabilitas: <strong>{res.percentage}%</strong>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {/* Render Form Gejala (Checkbox) */}
//                   {msg.isSymptomSelector && (
//                     <div className="options-wrap" style={{marginTop: '12px'}}>
//                       {SYMPTOMS.map(s => (
//                         <label key={s.id} style={{
//                           display: 'flex', gap: '8px', alignItems: 'flex-start',
//                           padding: '8px', background: 'var(--amber-50)', 
//                           border: '1px solid var(--amber-200)', borderRadius: '8px',
//                           cursor: isSelectorDisabled ? 'not-allowed' : 'pointer',
//                           opacity: isSelectorDisabled ? 0.6 : 1
//                         }}>
//                           <input 
//                             type="checkbox" 
//                             checked={selectedSymptoms.includes(s.id)}
//                             onChange={() => handleToggleSymptom(s.id)}
//                             disabled={isSelectorDisabled}
//                             style={{marginTop: '4px'}}
//                           />
//                           <span style={{fontSize: '13px', lineHeight: '1.4', color: 'var(--slate-700)'}}>{s.text}</span>
//                         </label>
//                       ))}
//                       <button 
//                         className="opt-btn" 
//                         style={{marginTop: '10px', background: 'var(--amber-500)', color: 'white', textAlign: 'center', borderColor: 'var(--amber-600)'}}
//                         onClick={handleAnalyze}
//                         disabled={selectedSymptoms.length === 0 || isSelectorDisabled}
//                       >
//                         Analisis Gejala Terpilih
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 <span className="msg-time">{msg.time}</span>
//               </div>
//             </div>
//           );
//         })}
//         {isTyping && <TypingIndicator />}
//         <div ref={messagesEndRef} />
//       </div>
//     </div>
//   );
// }