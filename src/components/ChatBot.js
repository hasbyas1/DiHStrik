import React, { useState, useEffect, useRef } from "react";
import { SYMPTOMS, calculateBayesianDiagnosis } from "../data/knowledgeBase";
import "./ChatBot.css";

const NLP_URL = "http://127.0.0.1:8000";
const SYMPTOMS_PER_PAGE = 4;

const SYMPTOM_DESCRIPTIONS = {
  "S01": "Terjadi saat saklar utama di meteran (MCB) anjlok/jepret secara tiba-tiba, memutus seluruh aliran listrik rumah.",
  "S02": "Permukaan colokan atau saklar terasa panas tak wajar saat disentuh, mengindikasikan kabel di dalamnya kelebihan beban atau kendor.",
  "S03": "Ada aroma tajam seperti plastik atau karet yang terbakar dari sekitar colokan atau alat elektronik yang sedang menyala.",
  "S04": "Cahaya lampu menjadi tidak stabil, kadang terang kadang meredup sendiri seperti kekurangan daya.",
  "S05": "Terasa getaran atau sengatan setrum kecil/ringan saat tangan Anda menyentuh bodi logam dari alat elektronik (seperti kulkas atau CPU PC).",
  "S06": "Terdengar suara berdesis seperti 'sssttt' halus secara terus-menerus di dekat saklar atau kotak meteran listrik.",
  "S07": "Bentuk colokan melengkung atau ada noda hitam pekat bekas terbakar di sekitarnya karena panas berlebih.",
  "S08": "Lapisan karet pelindung luar kabel sudah robek, pecah, atau terkelupas sehingga kawat tembaga di dalamnya terlihat.",
  "S09": "Biaya token atau tagihan listrik bulanan tiba-tiba naik sangat drastis padahal intensitas pemakaian alat elektronik Anda biasa saja.",
  "S10": "Alat elektronik yang tadinya normal tiba-tiba mati total dan tidak bisa dinyalakan lagi saat dicolokkan ke stop kontak.",
  "S11": "Keluar kilatan cahaya atau percikan api kecil sesaat ketika Anda memasukkan atau mencabut colokan perangkat listrik.",
  "S12": "Ada warna kecoklatan atau noda gosong di area sekitar lubang colokan pada dinding.",
  "S13": "Ada bunyi dengungan konstan 'ngiing' atau suara letupan berulang dari arah meteran atau stop kontak.",
  "S14": "Saat Anda mencoba menaikkan kembali tuas saklar MCB yang turun, tuas tersebut langsung otomatis jatuh lagi.",
  "S15": "Listrik di rumah mati/anjlok hanya pada saat Anda menyalakan alat tertentu saja (misalnya saat baru menyalakan AC atau pompa air).",
  "S16": "Bagian permukaan tembok di sekitar stop kontak atau saklar terasa hangat atau sedikit bergetar bila ditempelkan tangan.",
  "S17": "Lampu tiba-tiba mati-nyala dengan sendirinya padahal tidak ada perubahan cuaca atau alat berat yang sedang dinyalakan.",
  "S18": "Ada bercak karat, bekas rembesan air, atau kelembapan embun di sekitar kotak sekring atau meteran listrik.",
  "S19": "Kabel tampak terputus, cacat, atau rusak dengan bentuk terkoyak yang identik dengan bekas gigitan hewan pengerat.",
  "S20": "Terdapat sensasi aliran listrik ringan yang mengagetkan saat Anda menyentuh keran air dari logam di kamar mandi atau tempat cuci piring.",
  "S21": "Meteran tetap berputar cepat atau indikator pemakaian daya tetap tinggi meskipun semua alat elektronik sudah dipastikan dalam keadaan mati/dicabut."
};


/* ─── Helpers ─── */
function getTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function buildBotMessage(text, extras = {}) {
  return {
    id: Date.now() + Math.random(),
    from: "bot",
    text,
    time: getTime(),
    ...extras,
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

/* ─── NLP API calls ─── */
async function callAnalyze(text) {
  const res = await fetch(`${NLP_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("analyze failed");
  return res.json();
}

async function callDiagnosis(diagnosis_id, confidence) {
  const res = await fetch(`${NLP_URL}/diagnosis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ diagnosis_id, confidence }),
  });
  if (!res.ok) throw new Error("diagnosis failed");
  return res.json();
}

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

function TypingIndicator() {
  return (
    <div className="msg-row bot">
      <BotAvatar />
      <div className="typing-bubble">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    high: { cls: "badge-danger", label: "⚠️ Bahaya Tinggi" },
    medium: { cls: "badge-warning", label: "⚡ Perhatian" },
    low: { cls: "badge-info", label: "ℹ️ Ringan" },
  };
  const s = map[severity] || map.medium;
  return <span className={`severity-badge ${s.cls}`}>{s.label}</span>;
}

/* Enriched card — used for NLP top diagnosis (has explanation + solutions) */
function EnrichedDiagnosisCard({ result }) {
  const sevClass =
    result.severity === "high"
      ? "diagnosis-danger"
      : result.severity === "medium"
        ? "diagnosis-warning"
        : "diagnosis-info";

  return (
    <div className={`diagnosis-card ${sevClass}`} style={{ marginTop: 12 }}>
      <div className="diag-header">
        <SeverityBadge severity={result.severity} />
        <span className="diag-title">{result.name}</span>
        <span className="diag-confidence">{Number(result.confidence).toFixed(2)}%</span>
      </div>

      <div className="diag-explanation">{result.explanation}</div>

      {result.solutions?.length > 0 && (
        <>
          <div className="diag-steps-label">Langkah Penanganan</div>
          <ol className="diag-steps">
            {result.solutions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </>
      )}

      {result.severity === "high" && (
        <p className="diag-warning">
          ⚠️ Segera hubungi teknisi listrik untuk penanganan lebih lanjut.
        </p>
      )}
    </div>
  );
}

/* Simple card — used for manual mode top 3 and NLP "other" results */
function SimpleResultCard({ res, rank, onHoverActive, onHoverInactive }) {
  const sevClass =
    rank === 1 ? "diagnosis-danger" : rank === 2 ? "diagnosis-warning" : "diagnosis-info";
  const badgeCls =
    rank === 1 ? "badge-danger" : rank === 2 ? "badge-warning" : "badge-info";

  const handleMouseEnter = (e) => {
    if (!res.explanation) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onHoverActive({
      explanation: res.explanation,
      solutions: res.solutions,
      rect: rect
    });
  };

  return (
    <div
      className={`diagnosis-card simple-card ${sevClass}`}
      style={{ marginTop: 8 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onHoverInactive}
    >
      <div className="diag-header">
        <span className={`severity-badge ${badgeCls}`}>#{rank}</span>
        <span className="diag-title">{res.name}</span>

        {/* Visual cue for hover */}
        {res.explanation && (
          <span className="hover-cue" title="Arahkan kursor untuk melihat detail">
            ℹ️ Detail
          </span>
        )}
      </div>
      <div className="diag-explanation">
        Probabilitas: <strong>{res.percentage || res.confidence}%</strong>
      </div>
    </div>
  );
}

/* ─── Main ChatBot ─── */
export default function ChatBot() {
  const [messages, setMessages] = useState([
    buildBotMessage(
      "Halo! Saya DiHStrik 👋\n\nSaya siap membantu mengidentifikasi masalah kelistrikan di rumah Anda.\nPilih cara diagnosis yang Anda inginkan:",
      { isModeSelect: true }
    ),
  ]);

  const [mode, setMode] = useState(null); // null | 'nlp' | 'manual'
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [disabledMsgIds, setDisabledMsgIds] = useState(new Set());
  const [nlpInput, setNlpInput] = useState("");
  const [isNlpLoading, setIsNlpLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [symptomPage, setSymptomPage] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isInputHighlighted, setIsInputHighlighted] = useState(false);

  const [hoveredData, setHoveredData] = useState(null);
  const [lastHoveredData, setLastHoveredData] = useState(null);
  const shellRef = useRef(null);

  const handleHoverActive = (data) => {
    if (shellRef.current) {
      const shellRect = shellRef.current.getBoundingClientRect();
      const y = data.rect.top - shellRect.top + data.rect.height / 2;
      const updated = {
        explanation: data.explanation,
        solutions: data.solutions,
        y: y
      };
      setHoveredData(updated);
      setLastHoveredData(updated);
    }
  };

  const handleHoverInactive = () => {
    setHoveredData(null);
  };

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const autoScroll = useRef(true);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (autoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    autoScroll.current = true;
  }, [messages, isTyping]);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDarkMode);
  }, [isDarkMode]);

  /* ─── Lock a set of message IDs ─── */
  const lockMsgs = (ids) => {
    setDisabledMsgIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  /* ─── Mode Selection ─── */
  const handleSelectMode = (selectedMode) => {
    // Lock all existing mode-select messages
    lockMsgs(messages.filter((m) => m.isModeSelect).map((m) => m.id));
    setMode(selectedMode);

    if (selectedMode === "nlp") {
      setIsInputHighlighted(true);
      setMessages((prev) => [
        ...prev,
        buildUserMessage("💬 Ceritakan masalah Anda"),
        buildBotMessage(
          "Baik! Ketik keluhan listrik Anda di bawah.\n\nContoh: \"Stop kontak saya panas dan ada bau hangus\"",
          { isNlpEntry: true }
        ),
      ]);
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      autoScroll.current = false;
      setSymptomPage(0);
      setMessages((prev) => [
        ...prev,
        buildUserMessage("☑️ Pilih gejala sendiri"),
        buildBotMessage(
          "Baik! Silakan centang semua gejala yang sedang Anda alami:",
          { isSymptomSelector: true, finalSelection: null }
        ),
      ]);
      setTimeout(() => {
        chatMessagesRef.current?.scrollBy({ top: 120, behavior: "smooth" });
      }, 50);
    }
  };

  /* ─── Go Back ─── */
  const handleGoBack = (msgId) => {
    lockMsgs([msgId]); // lock pesan ini, jadi hanya bisa sekali klik dan tidak bisa diklik lagi
    setMode(null);
    setSelectedSymptoms([]);
    setSymptomPage(0);
    setIsInputHighlighted(false);
    setMessages((prev) => [
      ...prev,
      buildBotMessage(
        "Tentu! Pilih kembali cara diagnosis yang Anda inginkan:",
        { isModeSelect: true }
      ),
    ]);
  };

  /* ─── Manual Checkbox ─── */
  const handleToggleSymptom = (id) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAnalyze = (msgId) => {
    if (selectedSymptoms.length === 0) return;

    lockMsgs([msgId]);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, finalSelection: [...selectedSymptoms] } : m
      )
    );

    const selectedTexts = selectedSymptoms
      .map((id) => {
        const s = SYMPTOMS.find((sym) => sym.id === id);
        return s ? `• ${s.text}` : "";
      })
      .join("\n");

    setMessages((prev) => [
      ...prev,
      buildUserMessage(
        `Tolong analisis ${selectedSymptoms.length} gejala berikut:\n${selectedTexts}`
      ),
    ]);

    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      const diagnosisResults = calculateBayesianDiagnosis(selectedSymptoms);
      const rawTop = diagnosisResults
        .slice(0, 3)
        .filter((r) => parseFloat(r.percentage) > 0);

      const topResults = await Promise.all(
        rawTop.map(async (r) => {
          try {
            const det = await callDiagnosis(r.id, Number(r.percentage));
            return { ...r, ...det };
          } catch {
            return r;
          }
        })
      );

      autoScroll.current = false;
      setMessages((prev) => [
        ...prev,
        buildBotMessage(
          "Berdasarkan analisis probabilitas Naive Bayes, berikut kemungkinan penyebabnya:",
          { results: topResults }
        ),
        buildBotMessage(
          "Apakah Anda ingin melakukan diagnosis ulang?",
          { isModeSelect: true }
        ),
      ]);
      setTimeout(() => {
        chatMessagesRef.current?.scrollBy({ top: 150, behavior: "smooth" });
      }, 50);
      setSelectedSymptoms([]);
    }, 1500);
  };

  /* ─── NLP Send ─── */
  const handleNlpSend = async () => {
    const text = nlpInput.trim();
    if (!text || isNlpLoading) return;

    setNlpInput("");
    setIsInputHighlighted(false);
    setMessages((prev) => [...prev, buildUserMessage(text)]);
    setIsNlpLoading(true);
    setIsTyping(true);

    try {
      // Step 1 — NLP extraction
      const analysis = await callAnalyze(text);
      const detectedSymptoms = analysis.symptoms || [];

      if (detectedSymptoms.length === 0) {
        setIsTyping(false);
        setIsNlpLoading(false);
        autoScroll.current = false;
        setMessages((prev) => [
          ...prev,
          buildBotMessage(
            "Maaf, saya tidak dapat mendeteksi gejala dari kalimat tersebut.\n\nCoba gunakan kata kunci seperti: panas, bau hangus, berkedip, percikan api, nyetrum, dsb.\n\nAtau gunakan mode pilih gejala manual:",
            { isModeSelect: true }
          ),
        ]);
        return;
      }

      // Step 2 — Bayesian diagnosis
      const symptomIds = detectedSymptoms.map((s) => s.id);
      const bayesResults = calculateBayesianDiagnosis(symptomIds);
      const topDiagnosis = bayesResults[0];

      // Step 3 — Diagnosis enrichment
      const detail = await callDiagnosis(
        topDiagnosis.id,
        Number(topDiagnosis.percentage)
      );

      setIsTyping(false);
      setIsNlpLoading(false);

      const enrichedTop = {
        ...detail,
        confidence: detail.confidence ?? Number(topDiagnosis.percentage),
      };

      const otherResults = await Promise.all(
        bayesResults
          .slice(1, 3)
          .filter((r) => parseFloat(r.percentage) > 0)
          .map(async (r) => {
            try {
              const det = await callDiagnosis(r.id, Number(r.percentage));
              return { ...r, ...det };
            } catch {
              return r;
            }
          })
      );

      // Step 4 — Render
      autoScroll.current = false;
      setMessages((prev) => [
        ...prev,
        buildBotMessage(
          `NLP mendeteksi ${detectedSymptoms.length} gejala dari kalimat Anda:`,
          { detectedSymptoms }
        ),
        buildBotMessage(
          "Berdasarkan analisis probabilitas Naive Bayes, berikut hasil diagnosisnya:",
          { nlpEnriched: enrichedTop, otherResults }
        ),
        buildBotMessage(
          "Apakah Anda ingin melakukan diagnosis ulang?",
          { isModeSelect: true }
        ),
      ]);
      setTimeout(() => {
        chatMessagesRef.current?.scrollBy({ top: 150, behavior: "smooth" });
      }, 50);
    } catch {
      setIsTyping(false);
      setIsNlpLoading(false);
      autoScroll.current = false;
      setMessages((prev) => [
        ...prev,
        buildBotMessage(
          "⚠️ Tidak dapat terhubung ke NLP Service.\n\nPastikan service berjalan:\n  cd nlp_service\n  uvicorn app.main:app --reload\n\nAnda tetap bisa menggunakan mode pilih gejala manual:",
          { isModeSelect: true, isError: true }
        ),
      ]);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNlpSend();
    }
  };

  const handleChatScroll = () => {
    handleHoverInactive();
    const el = chatMessagesRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 100);
  };

  /* ─── Render ─── */
  return (
    <div className="chatbot-shell" ref={shellRef}>
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
            Diagnosis Home Listrik - Sistem Pakar Probabilistik
          </span>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="theme-toggle-btn"
          title="Ganti Tema"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </header>

      {/* Messages */}
      <div className="chat-messages" ref={chatMessagesRef} onScroll={handleChatScroll}>
        <div className="date-divider">Sesi Analisis Dimulai</div>

        {messages.map((msg) => {
          const isBot = msg.from === "bot";
          const isLocked = disabledMsgIds.has(msg.id);
          const currentViewSelection = isLocked
            ? msg.finalSelection || []
            : selectedSymptoms;
          const totalPages = Math.ceil(SYMPTOMS.length / SYMPTOMS_PER_PAGE);
          const pageSymptoms = SYMPTOMS.slice(
            symptomPage * SYMPTOMS_PER_PAGE,
            (symptomPage + 1) * SYMPTOMS_PER_PAGE
          );

          return (
            <div key={msg.id} className={`msg-row ${msg.from}`}>
              {isBot && <BotAvatar />}
              <div className="msg-col">
                {isBot && <span className="sender-label">Sistem Pakar</span>}
                <div
                  className={`bubble ${msg.from}${msg.isError ? " bubble-error" : ""}`}
                >

                  {/* Back button — di atas konten untuk mode aktif */}
                  {(msg.isSymptomSelector || msg.isNlpEntry) && (
                    <button className="back-mode-btn" onClick={() => handleGoBack(msg.id)} disabled={isLocked}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Ganti cara diagnosis
                    </button>
                  )}
                  
                  {/* Plain text lines */}
                  {msg.text
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <p key={i} style={{ marginBottom: "6px" }}>
                        {line}
                      </p>
                    ))}

                  {/* Detected symptom tags (NLP) */}
                  {msg.detectedSymptoms?.length > 0 && (
                    <div className="detected-symptoms-wrap">
                      {msg.detectedSymptoms.map((s) => (
                        <span key={s.id} className="detected-tag">
                          <span className="detected-check">✓</span>
                          {s.text}
                          <span className="detected-score">
                            {Math.round(s.score * 100)}%
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Enriched top diagnosis (NLP path) */}
                  {msg.nlpEnriched && (
                    <EnrichedDiagnosisCard result={msg.nlpEnriched} />
                  )}

                  {/* Other (simple) results */}
                  {msg.otherResults?.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <div className="other-results-label">
                        Kemungkinan lain:
                      </div>
                      {msg.otherResults.map((res, idx) => (
                        <SimpleResultCard
                          key={res.id}
                          res={res}
                          rank={idx + 2}
                          onHoverActive={handleHoverActive}
                          onHoverInactive={handleHoverInactive}
                        />
                      ))}
                    </div>
                  )}

                  {/* Manual mode results — sama seperti NLP: enriched untuk #1, simple untuk sisanya */}
                  {msg.results?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <EnrichedDiagnosisCard
                        result={{
                          ...msg.results[0],
                          confidence: msg.results[0].confidence ?? msg.results[0].percentage
                        }}
                      />
                      {msg.results.length > 1 && (
                        <div style={{ marginTop: 4 }}>
                          <div className="other-results-label">Kemungkinan lain:</div>
                          {msg.results.slice(1).map((res, idx) => (
                            <SimpleResultCard
                              key={res.id}
                              res={res}
                              rank={idx + 2}
                              onHoverActive={handleHoverActive}
                              onHoverInactive={handleHoverInactive}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode selection buttons */}
                  {msg.isModeSelect && !isLocked && (
                    <div className="mode-select-wrap">
                      <button
                        className="mode-btn mode-btn-nlp"
                        onClick={() => handleSelectMode("nlp")}
                      >
                        <span className="mode-btn-icon">💬</span>
                        <span className="mode-btn-text">
                          <strong>Ceritakan masalah Anda</strong>
                          <small>Ketik dalam kalimat bebas</small>
                        </span>
                      </button>
                      <button
                        className="mode-btn mode-btn-manual"
                        onClick={() => handleSelectMode("manual")}
                      >
                        <span className="mode-btn-icon">☑️</span>
                        <span className="mode-btn-text">
                          <strong>Pilih gejala sendiri</strong>
                          <small>Centang dari daftar gejala</small>
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Manual symptom selector */}
                  {msg.isSymptomSelector && (
                    <div className="options-wrap" style={{ marginTop: "12px" }}>

                      {/* Pagination controls */}
                      <div className="symptom-pagination">
                        <button
                          className="page-arrow-btn"
                          onClick={() => setSymptomPage(p => Math.max(0, p - 1))}
                          disabled={symptomPage === 0 || isLocked}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <span className="page-indicator">
                          {symptomPage + 1} / {totalPages}
                        </span>
                        <button
                          className="page-arrow-btn"
                          onClick={() => setSymptomPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={symptomPage === totalPages - 1 || isLocked}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>

                      <div className="symptom-items-wrap">
                        {pageSymptoms.map((s) => (
                          <label
                            key={s.id}
                            className={`symptom-label ${isLocked ? "locked" : ""}`}
                            onMouseEnter={(e) => {
                              const desc = SYMPTOM_DESCRIPTIONS[s.id];
                              if (desc) {
                                handleHoverActive({
                                  explanation: desc,
                                  rect: e.currentTarget.getBoundingClientRect()
                                });
                              }
                            }}
                            onMouseLeave={handleHoverInactive}
                          >
                            <input
                              type="checkbox"
                              checked={currentViewSelection.includes(s.id)}
                              onChange={() => !isLocked && handleToggleSymptom(s.id)}
                              disabled={isLocked}
                            />
                            <span>{s.text}</span>
                          </label>
                        ))}
                        {Array.from({ length: SYMPTOMS_PER_PAGE - pageSymptoms.length }).map((_, i) => (
                          <div key={`ph-${i}`} className="symptom-label symptom-placeholder" aria-hidden="true" />
                        ))}
                      </div>

                      {!isLocked && (
                        <button
                          className="opt-btn"
                          style={{
                            marginTop: "10px",
                            background: "var(--amber-500)",
                            color: "white",
                            textAlign: "center",
                          }}
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

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          className="scroll-to-bottom-btn"
          style={{ bottom: mode === "nlp" ? "74px" : "16px" }}
          onClick={() => {
            autoScroll.current = false;
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* NLP Input Bar — only visible in NLP mode */}
      {mode === "nlp" && (
        <div className="chat-input-area">
          <input
            ref={inputRef}
            className={`chat-input${isInputHighlighted && !nlpInput ? " input-blink" : ""}`}
            type="text"
            placeholder="Ceritakan masalah listrik Anda..."
            value={nlpInput}
            onChange={(e) => setNlpInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={isNlpLoading}
          />
          <button
            className="send-btn"
            onClick={handleNlpSend}
            disabled={!nlpInput.trim() || isNlpLoading}
            title="Kirim"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      )}

      {/* Global Hover Tooltip (displayed on top of everything, escaping container clipping) */}
      <div
        className={`simple-hover-content${hoveredData ? " active" : ""}`}
        style={{
          top: lastHoveredData ? `${lastHoveredData.y}px` : "0px",
        }}
      >
        <div className="hover-exp">{lastHoveredData?.explanation}</div>
        {lastHoveredData?.solutions?.length > 0 && (
          <div className="hover-sol">
            <strong>Solusi:</strong>
            <ul>
              {lastHoveredData.solutions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}