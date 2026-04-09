# DiHStrik
**DiHStrik - Diagnosis Home Listrik - Berbasis Sistem Pakar**<br>
**Sistem Pakar Identifikasi Masalah Kelistrikan Rumah Tangga** <br>
---
## Sistem Pakar - C6
**152023034 | Firman Fawnia Fauzan**<br>
**152023037 | Yosafat Napitupulu**<br>
**152023064 | Fauzil Adhim Innaka Kunta R**<br>
**152023071 | Chandra Kirana Irawan**<br>
**152023072 | Muhammad Hasby As-shiddiqy**<br>

---

## Struktur Proyek

```
DiHStrik/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChatBot.js       ← Komponen utama chatbot
│   │   └── ChatBot.css      ← Styling komponen
│   ├── data/
│   │   └── knowledgeBase.js ← Knowledge base sistem pakar
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

---

## Cara Setup di VSCode

### Prasyarat
Pastikan sudah terinstall:
- **Node.js** versi 16 ke atas → https://nodejs.org dan ambil yang LTS (Long Term Support), cek node -v & npm -v di terminal untuk melihat apakah sudah terinstall
- **VSCode** → https://code.visualstudio.com
- Extension VSCode yang disarankan: **ES7+ React/Redux/React-Native snippets**, **Prettier**

---

### Langkah 1 — Buka folder di VSCode
1. Buka VSCode
2. File → Open Folder → pilih folder `DiHStrik`

### Langkah 2 — Buka Terminal di VSCode
- Tekan **Ctrl + ` ** (backtick) atau menu Terminal → New Terminal
- Pergi root folder (saat ini, artinya langsung ke tahap selanjutnya saja)

### Langkah 3 — Install dependencies
```bash
npm install
```
Tunggu hingga selesai (sekitar 1–3 menit).

### Langkah 4 — Jalankan development server 
```bash
npm start
```
Browser akan otomatis terbuka di **http://localhost:3000**

---

## Cara Mengedit Knowledge Base

Semua data masalah, pertanyaan, dan solusi ada di:
```
src/data/knowledgeBase.js
```

### Menambah masalah baru di menu utama:
```js
// Di INITIAL_OPTIONS, tambahkan entry baru:
{ id: "grounding", label: "🌍 Masalah grounding/pembumian" },
```

## Build untuk Production

```bash
npm run build
```
Hasil build ada di folder `/build` — siap di-deploy ke server atau hosting.

---

## Teknologi yang Digunakan
- **React 18** — UI framework
- **Create React App** — build toolchain
- **CSS Variables** — theming dan dark mode ready
- **Vanilla CSS** — tanpa library UI tambahan (ringan dan portable)
