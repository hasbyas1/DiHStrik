# DiHStrik
**Diagnosis Home Listrik - Berbasis Sistem Pakar**<br>
**Sistem Pakar Identifikasi Masalah Kelistrikan Rumah Tangga**

---

## Sistem Pakar - C6
**152023034 | Firman Fawnia Fauzan**<br>
**152023037 | Yosafat Napitupulu**<br>
**152023064 | Fauzil Adhim Innaka Kunta R**<br>
**152023071 | Chandra Kirana Irawan**<br>
**152023072 | Muhammad Hasby As-shiddiqy**<br>

---

## Fitur Aplikasi

### Dua Mode Diagnosis
- **💬 Ceritakan masalah Anda** — ketik keluhan dalam kalimat bebas, NLP Service mendeteksi gejala secara otomatis
- **☑️ Pilih gejala sendiri** — centang gejala dari daftar yang tersedia (21 gejala, paginasi 5 per halaman)

### UX & Navigasi
- **Tombol "Ganti cara diagnosis"** — muncul di atas bubble aktif, bisa kembali ke pilihan mode kapan saja
- **Paginasi gejala** — navigasi `‹ 1/5 ›` agar tidak overwhelming, tinggi bubble konsisten antar halaman
- **Tombol "Ke chat terkini"** — muncul otomatis saat scroll ke atas, kembali ke pesan terbaru dengan satu klik
- **Animasi input breathing** — kolom teks bernapas (border + background) saat kosong di mode NLP, berhenti saat mulai mengetik

### Output Diagnosis
- Hasil diagnosis menggunakan **Naive Bayes Probabilistik**
- Hasil **#1** ditampilkan lengkap: severity badge, nama, confidence %, penjelasan, dan langkah penanganan
- Hasil **#2 dan #3** ditampilkan sebagai ringkasan "Kemungkinan lain"
- Format output **konsisten** antara mode manual dan NLP

### Tampilan
- **Dark / Light mode** toggle di pojok kanan header
- Fully responsive, mendukung layar kecil (≤500px)

---

## Struktur Proyek

```
DiHStrik/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChatBot.js          ← Komponen utama chatbot + semua logika UI
│   │   └── ChatBot.css         ← Styling komponen + animasi + dark mode
│   ├── data/
│   │   └── knowledgeBase.js    ← Knowledge base: hipotesis, gejala, fungsi Bayes
│   ├── App.js
│   ├── App.css                 ← CSS variables global + dark theme overrides
│   └── index.js
├── nlp_service/                ← Backend NLP (FastAPI / Python)
│   ├── app/
│   │   ├── main.py             ← Entry point FastAPI
│   │   ├── models.py           ← Pydantic request/response models
│   │   ├── services/
│   │   │   ├── symptom_extractor.py   ← Ekstraksi gejala dari teks bebas
│   │   │   └── diagnosis_service.py   ← Lookup detail diagnosis
│   │   └── data/
│   │       ├── symptoms.json   ← Data gejala + keywords NLP
│   │       └── diagnoses.json  ← Data diagnosis + penjelasan + solusi
│   ├── requirements.txt
│   └── README.md
├── package.json
└── README.md
```

---

## Cara Setup di VSCode

### Prasyarat
Pastikan sudah terinstall:
- **Node.js** versi 16 ke atas → https://nodejs.org (ambil LTS), cek dengan `node -v` dan `npm -v`
- **Python** versi 3.10 ke atas → https://python.org
- **VSCode** → https://code.visualstudio.com
- Extension VSCode yang disarankan: **ES7+ React/Redux/React-Native snippets**, **Prettier**, **Python**

---

### Menjalankan NLP Service (FastAPI)

Buka terminal **baru** (jangan tutup terminal React), lalu:

**Langkah 1 — Install dependencies Python** *(hanya perlu dilakukan sekali)*
```bash
pip install -r requirements.txt
```

**Langkah 2 — Jalankan NLP Service**
```bash
cd nlp_service
uvicorn app.main:app
```

NLP Service akan berjalan di **http://127.0.0.1:8000**

Dokumentasi API interaktif tersedia di: **http://127.0.0.1:8000/docs**

> **Catatan:** Fitur "Ceritakan masalah Anda" membutuhkan NLP Service aktif. Jika service tidak berjalan, aplikasi otomatis menawarkan fallback ke mode pilih gejala manual.

---

### Menjalankan Frontend (React)

**Langkah 1 — Buka folder di VSCode**
1. Buka VSCode
2. File → Open Folder → pilih folder `DiHStrik`

**Langkah 2 — Buka Terminal di VSCode**
- Tekan **`Ctrl + \``** (backtick) atau menu Terminal → New Terminal

**Langkah 3 — Install dependencies** *(hanya perlu dilakukan sekali)*
```bash
npm install
```

**Langkah 4 — Jalankan frontend**
```bash
npm start
```
Browser akan otomatis terbuka di **http://localhost:3000**

---

## Cara Mengedit Knowledge Base

Semua data hipotesis dan gejala ada di:
```
src/data/knowledgeBase.js
```

### Menambah hipotesis baru:
```js
// Di array HYPOTHESES:
{ id: "H8", name: "Kekurangan Daya Listrik", prior: 0.35 },
```

### Menambah gejala baru:
```js
// Di array SYMPTOMS (probs diisi sesuai urutan hipotesis H1–H8):
// Nilai: "ST"=0.9 | "T"=0.7 | "S"=0.5 | "R"=0.3 | "-"=0.1
{ id: "S22", text: "Stabilizer sering berbunyi", probs: ["ST", "R", "-", "T", "S", "R", "R", "T"] },
```

### Menambah detail diagnosis untuk NLP:
Tambahkan entry baru di `nlp_service/app/data/diagnoses.json`:
```json
"H8": {
  "name": "Kekurangan Daya Listrik",
  "severity": "medium",
  "explanation": "Daya listrik yang tersedia tidak mencukupi kebutuhan perangkat.",
  "solutions": [
    "Kurangi penggunaan perangkat berdaya tinggi secara bersamaan.",
    "Pertimbangkan upgrade daya listrik ke PLN."
  ]
}
```

---

## Build untuk Production

```bash
npm run build
```
Hasil build ada di folder `/build` — siap di-deploy ke server atau hosting.

---

## Teknologi yang Digunakan

### Frontend
- **React 18** — UI framework
- **Create React App** — build toolchain
- **CSS Variables** — theming dan dark/light mode
- **Vanilla CSS** — tanpa library UI tambahan (ringan dan portable)
- **Plus Jakarta Sans + Space Grotesk** — tipografi

### Backend (NLP Service)
- **FastAPI** — web framework Python
- **Uvicorn** — ASGI server
- **Python 3.10+** — runtime

### Algoritma
- **Naive Bayes** — kalkulasi probabilitas diagnosis
- **Keyword Matching** — ekstraksi gejala dari teks bebas (NLP)
