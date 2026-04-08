// ============================================================
// KNOWLEDGE BASE - Sistem Pakar Kelistrikan Rumah Tangga
// Tambahkan atau edit masalah, gejala, dan solusi di sini
// ============================================================

export const INITIAL_OPTIONS = [
  { id: "mcb_trip", label: "⚡ MCB / sekring sering trip" },
  { id: "lampu_kedip", label: "💡 Lampu berkedip atau redup" },
  { id: "stop_kontak", label: "🔌 Stop kontak tidak berfungsi" },
  { id: "tagihan_naik", label: "📈 Tagihan listrik naik drastis" },
  { id: "bau_hangus", label: "🔥 Bau hangus dari instalasi" },
  { id: "listrik_mati", label: "🌑 Listrik tiba-tiba mati total" },
];

// Tree keputusan: setiap node bisa punya options (lanjut) atau diagnosis (akhir)
export const KNOWLEDGE_TREE = {
  mcb_trip: {
    question: "MCB sering trip bisa berbahaya jika dibiarkan. Kapan MCB biasanya turun?",
    options: [
      { id: "mcb_banyak_beban", label: "Saat banyak perangkat menyala sekaligus" },
      { id: "mcb_cuaca_hujan", label: "Saat cuaca hujan atau lembab" },
      { id: "mcb_satu_titik", label: "Hanya satu MCB tertentu yang trip" },
      { id: "mcb_random", label: "Terjadi secara acak tanpa sebab jelas" },
    ],
  },
  mcb_banyak_beban: {
    diagnosis: true,
    severity: "warning",
    title: "Kelebihan Beban (Overload)",
    explanation:
      "MCB trip karena total daya perangkat melebihi kapasitas. Ini mekanisme proteksi normal.",
    steps: [
      "Catat daya (watt) semua perangkat yang menyala bersamaan",
      "Bandingkan total daya dengan kapasitas MCB (misal: 4A = 900W, 6A = 1300W)",
      "Pindahkan beberapa perangkat besar ke waktu penggunaan berbeda",
      "Pertimbangkan upgrade daya PLN jika kebutuhan memang bertambah",
    ],
    warning: null,
  },
  mcb_cuaca_hujan: {
    diagnosis: true,
    severity: "danger",
    title: "Kebocoran Arus Akibat Kelembaban",
    explanation:
      "Air atau kelembaban masuk ke instalasi menyebabkan arus bocor ke tanah, memicu MCB ELCB/GFCI trip.",
    steps: [
      "Periksa stop kontak outdoor apakah ada bekas air atau karat",
      "Cek kabel yang melewati area lembab (dapur, kamar mandi, atap)",
      "Pastikan semua stop kontak di area basah menggunakan cover penutup",
      "Hubungi teknisi listrik untuk tes kebocoran arus (earth leakage test)",
    ],
    warning: "Jangan nyalakan listrik di area yang terkena air sebelum dicek teknisi.",
  },
  mcb_satu_titik: {
    diagnosis: true,
    severity: "warning",
    title: "Korsleting di Satu Jalur",
    explanation:
      "Satu MCB yang terus trip menunjukkan ada korsleting atau beban berlebih di jalur/grup instalasi tertentu.",
    steps: [
      "Cabut semua perangkat dari stop kontak di jalur MCB tersebut",
      "Coba naikan MCB kembali — jika langsung trip lagi, ada korsleting di kabel",
      "Jika tidak langsung trip, pasang perangkat satu per satu untuk temukan pelakunya",
      "Hubungi teknisi untuk inspeksi kabel di dalam dinding jika perlu",
    ],
    warning: null,
  },
  mcb_random: {
    diagnosis: true,
    severity: "danger",
    title: "Potensi Koneksi Longgar atau MCB Rusak",
    explanation:
      "Trip acak tanpa pemicu jelas bisa jadi tanda MCB sudah aus, kabel longgar di panel, atau arus bocor intermittent.",
    steps: [
      "Perhatikan apakah ada bunyi dengungan atau bau dari panel listrik",
      "Jangan perbaiki panel listrik sendiri — ini area berbahaya",
      "Segera hubungi teknisi listrik bersertifikat untuk pemeriksaan panel",
      "MCB yang sudah trip lebih dari 50 kali disarankan diganti",
    ],
    warning: "Kondisi ini berpotensi menyebabkan kebakaran. Segera konsultasi teknisi.",
  },

  lampu_kedip: {
    question: "Kapan lampu berkedip atau terasa redup terjadi?",
    options: [
      { id: "lampu_ac_nyala", label: "Saat AC atau kulkas menyala" },
      { id: "lampu_terus_menerus", label: "Sepanjang waktu, tidak berhenti" },
      { id: "lampu_malam", label: "Lebih parah saat malam hari" },
      { id: "lampu_satu_ruang", label: "Hanya di satu ruangan tertentu" },
    ],
  },
  lampu_ac_nyala: {
    diagnosis: true,
    severity: "info",
    title: "Voltage Drop Saat Beban Besar Menyala",
    explanation:
      "AC dan kulkas menarik arus besar saat kompresor start, menyebabkan tegangan sesaat turun.",
    steps: [
      "Ini umumnya normal jika kedipan hanya sesaat (< 1 detik)",
      "Pasang stabilizer/AVR pada AC untuk mengurangi dampak",
      "Jika kedipan berlangsung lebih dari 2 detik, kabel instalasi mungkin terlalu kecil",
      "Konsultasikan penambahan jalur listrik khusus untuk AC ke teknisi",
    ],
    warning: null,
  },
  lampu_terus_menerus: {
    diagnosis: true,
    severity: "danger",
    title: "Tegangan PLN Tidak Stabil atau Kabel Longgar",
    explanation:
      "Kedipan konstan bisa dari tegangan PLN yang buruk di area Anda, atau koneksi kabel yang longgar.",
    steps: [
      "Ukur tegangan dengan multimeter di stop kontak (normal: 210–230V)",
      "Laporkan ke PLN (hubungi 123) jika tegangan di bawah 200V",
      "Periksa apakah saklar lampu terasa longgar atau panas saat disentuh",
      "Minta teknisi cek koneksi di kotak panel dan titik percabangan kabel",
    ],
    warning: "Kabel longgar adalah penyebab utama kebakaran listrik rumah tangga.",
  },
  lampu_malam: {
    diagnosis: true,
    severity: "warning",
    title: "Beban Puncak Jaringan PLN",
    explanation:
      "Malam hari adalah jam puncak pemakaian listrik. Tegangan PLN di area padat bisa turun 5–15%.",
    steps: [
      "Catat tegangan pagi vs malam menggunakan multimeter atau smart plug",
      "Jika selisih > 20V, laporkan ke PLN untuk pemeriksaan jaringan",
      "Gunakan lampu LED yang lebih tahan terhadap fluktuasi tegangan",
      "Pasang UPS/stabilizer untuk perangkat sensitif seperti komputer",
    ],
    warning: null,
  },
  lampu_satu_ruang: {
    diagnosis: true,
    severity: "warning",
    title: "Masalah Lokal di Jalur Ruangan Tersebut",
    explanation:
      "Jika hanya satu ruangan yang bermasalah, penyebab ada di instalasi lokal ruangan itu.",
    steps: [
      "Periksa fitting lampu — mungkin sudah longgar atau korosi",
      "Ganti lampu dengan yang baru untuk eliminasi kemungkinan lampu rusak",
      "Periksa saklar — bisa jadi kontak dalam saklar sudah aus",
      "Jika tetap kedip setelah ganti lampu dan saklar, minta teknisi cek kabel ruangan",
    ],
    warning: null,
  },

  stop_kontak: {
    question: "Apa kondisi stop kontak yang tidak berfungsi tersebut?",
    options: [
      { id: "sk_percikan", label: "Ada percikan api saat mencolok" },
      { id: "sk_panas", label: "Stop kontak terasa hangat atau panas" },
      { id: "sk_beberapa", label: "Beberapa stop kontak mati sekaligus" },
      { id: "sk_satu", label: "Hanya satu stop kontak yang mati" },
    ],
  },
  sk_percikan: {
    diagnosis: true,
    severity: "danger",
    title: "Percikan Api — Bahaya Kebakaran",
    explanation:
      "Percikan kecil sesaat mungkin normal, tapi percikan besar atau berulang menandakan koneksi buruk atau kelebihan beban.",
    steps: [
      "STOP menggunakan stop kontak tersebut segera",
      "Cabut semua perangkat dari stop kontak itu",
      "Matikan MCB yang melayani stop kontak tersebut",
      "Jangan gunakan kembali sebelum diperiksa dan diperbaiki teknisi bersertifikat",
    ],
    warning: "BERBAHAYA. Percikan api berulang dapat memicu kebakaran. Hentikan penggunaan sekarang.",
  },
  sk_panas: {
    diagnosis: true,
    severity: "danger",
    title: "Overheating — Potensi Kebakaran",
    explanation:
      "Stop kontak panas menandakan koneksi longgar yang menimbulkan panas berlebih (resistansi tinggi) atau beban melebihi rating stop kontak.",
    steps: [
      "Segera cabut semua perangkat dari stop kontak tersebut",
      "Jangan gunakan stop kontak itu sampai diperbaiki",
      "Periksa apakah perangkat yang dicolok total dayanya melebihi 2200W",
      "Hubungi teknisi untuk penggantian stop kontak dan cek kabel di balik dinding",
    ],
    warning: "Stop kontak panas adalah tanda serius. Segera hubungi teknisi.",
  },
  sk_beberapa: {
    diagnosis: true,
    severity: "warning",
    title: "Satu MCB Mati atau Kabel Putus di Jalur",
    explanation:
      "Beberapa stop kontak mati sekaligus berarti satu jalur (grup) instalasi bermasalah, biasanya MCB trip atau kabel putus.",
    steps: [
      "Periksa panel MCB — cari MCB yang posisinya berbeda dari yang lain (OFF/tengah)",
      "Jika ada MCB yang trip, coba naikan kembali",
      "Jika langsung trip lagi, ada korsleting di jalur tersebut",
      "Hubungi teknisi untuk tracing jalur kabel jika MCB tidak mau naik",
    ],
    warning: null,
  },
  sk_satu: {
    diagnosis: true,
    severity: "info",
    title: "Stop Kontak Rusak atau Koneksi Longgar",
    explanation:
      "Satu stop kontak yang mati umumnya akibat terminal dalam yang aus, koneksi longgar, atau terlindung oleh GFCI yang trip.",
    steps: [
      "Cari stop kontak GFCI (ada tombol TEST/RESET) di kamar mandi atau dapur — mungkin perlu di-reset",
      "Coba colok perangkat lain untuk pastikan bukan masalah dari perangkat",
      "Jika beli rumah baru, periksa apakah ada stop kontak lain yang punya tombol RESET",
      "Penggantian stop kontak cukup murah — minta teknisi ganti jika memang rusak",
    ],
    warning: null,
  },

  tagihan_naik: {
    question: "Seberapa besar kenaikan tagihan dan apa yang berubah akhir-akhir ini?",
    options: [
      { id: "tagihan_perangkat_baru", label: "Baru pasang perangkat baru (AC, water heater, dll)" },
      { id: "tagihan_bocor", label: "Curiga ada kebocoran arus di instalasi" },
      { id: "tagihan_tiba2", label: "Naik drastis tanpa perubahan apapun" },
      { id: "tagihan_audit", label: "Ingin audit perangkat paling boros" },
    ],
  },
  tagihan_perangkat_baru: {
    diagnosis: true,
    severity: "info",
    title: "Konsumsi Daya Perangkat Baru",
    explanation:
      "Perangkat seperti AC, water heater, dan mesin cuci berkontribusi besar pada tagihan listrik.",
    steps: [
      "AC 1 PK (900W) dipakai 8 jam/hari = ~216 kWh/bulan (sekitar Rp 250.000–350.000)",
      "Water heater 1500W dipakai 30 menit/hari = ~22 kWh/bulan",
      "Matikan perangkat standby — TV, set-top box, charger idle bisa 'nyedot' 50–100W",
      "Gunakan smart plug dengan power monitor untuk cek konsumsi real-time tiap perangkat",
    ],
    warning: null,
  },
  tagihan_bocor: {
    diagnosis: true,
    severity: "warning",
    title: "Tes Kebocoran Arus Listrik",
    explanation:
      "Kebocoran arus ke tanah menyebabkan meteran tetap jalan meski semua perangkat dimatikan.",
    steps: [
      "Matikan semua perangkat dan saklar di rumah",
      "Lihat meteran PLN — jika angka tetap bergerak, ada kebocoran arus",
      "Cabut satu per satu MCB per jalur untuk isolasi jalur yang bocor",
      "Panggil teknisi untuk tes isolasi kabel (insulation resistance test)",
    ],
    warning: null,
  },
  tagihan_tiba2: {
    diagnosis: true,
    severity: "warning",
    title: "Kemungkinan Pencurian Listrik atau Error Meteran",
    explanation:
      "Kenaikan drastis tanpa perubahan pola pemakaian bisa jadi error baca meteran, meteran rusak, atau pemakaian tidak sah.",
    steps: [
      "Bandingkan angka di meteran PLN dengan tagihan yang diterima",
      "Foto meteran setiap awal bulan sebagai bukti",
      "Lapor ke PLN (hubungi 123) jika ada selisih lebih dari 10%",
      "Minta PLN lakukan pengecekan meteran dan instalasi",
    ],
    warning: null,
  },
  tagihan_audit: {
    diagnosis: true,
    severity: "info",
    title: "Audit Konsumsi Energi Rumah",
    explanation:
      "Mengetahui perangkat terboros membantu memprioritaskan penghematan yang paling efektif.",
    steps: [
      "AC: konsumen terbesar, setpoint 24–26°C hemat 10% per 1°C dinaikkan",
      "Water heater: gunakan timer, matikan jika tidak dipakai seharian",
      "Kulkas: jaga segel karet, jangan terlalu penuh, jauhkan dari sumber panas",
      "Lampu: ganti semua ke LED, konsumsi 7–10x lebih hemat dari lampu pijar",
      "Gunakan aplikasi monitoring (smart meter/PLN Mobile) untuk pantau real-time",
    ],
    warning: null,
  },

  bau_hangus: {
    question: "⚠️ Bau hangus adalah tanda serius. Di mana lokasi bau terasa paling kuat?",
    options: [
      { id: "bau_panel", label: "Dari area panel listrik / MCB box" },
      { id: "bau_stop_kontak", label: "Dari salah satu stop kontak" },
      { id: "bau_kabel", label: "Dari area dinding atau plafon" },
      { id: "bau_perangkat", label: "Dari perangkat elektronik tertentu" },
    ],
  },
  bau_panel: {
    diagnosis: true,
    severity: "danger",
    title: "DARURAT — Panel Listrik Terbakar",
    explanation:
      "Bau hangus dari panel adalah kondisi darurat. Ini bisa berarti ada busur listrik (arc fault) atau komponen yang terbakar di dalam panel.",
    steps: [
      "MATIKAN MCB UTAMA SEGERA dari luar rumah jika memungkinkan",
      "Jangan buka panel jika tercium bau sangat kuat atau ada asap",
      "Hubungi teknisi listrik darurat atau PLN (123) SEKARANG",
      "Siapkan APAR (pemadam api) dan jauhkan orang dari area panel",
    ],
    warning: "DARURAT. Matikan listrik utama dan hubungi teknisi atau PLN 123 sekarang.",
  },
  bau_stop_kontak: {
    diagnosis: true,
    severity: "danger",
    title: "Stop Kontak Terbakar",
    explanation:
      "Plastik atau kabel di dalam stop kontak mulai terbakar akibat panas berlebih atau korsleting.",
    steps: [
      "CABUT semua perangkat dari stop kontak tersebut SEGERA",
      "Matikan MCB yang melayani area tersebut",
      "Jangan gunakan stop kontak itu sampai diganti teknisi",
      "Periksa apakah ada bekas gosong atau warna hitam di sekitar stop kontak",
    ],
    warning: "Hentikan penggunaan stop kontak tersebut. Hubungi teknisi hari ini.",
  },
  bau_kabel: {
    diagnosis: true,
    severity: "danger",
    title: "Kabel di Dinding Terbakar",
    explanation:
      "Bau dari dinding atau plafon menandakan kabel terlindung (di dalam konduit/tembok) mengalami panas berlebih atau korsleting tersembunyi.",
    steps: [
      "Matikan MCB jalur yang melewati area tersebut",
      "Jangan nyalakan kembali sebelum teknisi melakukan inspeksi",
      "Perhatikan apakah ada bintik gelap, cat mengelupas, atau dinding terasa hangat",
      "Hubungi teknisi untuk thermal imaging atau pengecekan instalasi dalam dinding",
    ],
    warning: "Kabel terbakar dalam dinding sangat berbahaya. Matikan listrik area tersebut.",
  },
  bau_perangkat: {
    diagnosis: true,
    severity: "warning",
    title: "Komponen Elektronik Rusak",
    explanation:
      "Bau hangus dari perangkat biasanya dari kapasitor, resistor, atau motor yang terbakar di dalam perangkat itu sendiri.",
    steps: [
      "Segera cabut perangkat dari stop kontak",
      "Jangan nyalakan kembali perangkat tersebut",
      "Bawa ke service center untuk pemeriksaan komponen",
      "Jika perangkat sudah tua (> 10 tahun), pertimbangkan penggantian",
    ],
    warning: null,
  },

  listrik_mati: {
    question: "Listrik mati total? Mari kita cari tahu penyebabnya:",
    options: [
      { id: "mati_tetangga", label: "Tetangga sekitar juga mati listriknya" },
      { id: "mati_sendiri", label: "Hanya rumah saya yang mati" },
      { id: "mati_sebagian", label: "Sebagian ruangan saja yang mati" },
      { id: "mati_setelah_hujan", label: "Terjadi setelah hujan lebat" },
    ],
  },
  mati_tetangga: {
    diagnosis: true,
    severity: "info",
    title: "Gangguan Jaringan PLN",
    explanation:
      "Jika tetangga juga mengalami hal sama, ini gangguan dari jaringan distribusi PLN, bukan masalah instalasi rumah Anda.",
    steps: [
      "Laporkan ke PLN melalui aplikasi PLN Mobile atau hubungi 123",
      "Cek status gangguan di Twitter @pln_123 atau PLN Mobile",
      "Sambil menunggu, matikan perangkat sensitif (komputer, kulkas) lewat saklar",
      "Nyalakan kembali satu per satu setelah listrik pulih untuk hindari lonjakan arus",
    ],
    warning: null,
  },
  mati_sendiri: {
    diagnosis: true,
    severity: "warning",
    title: "MCB Utama Trip atau Token Habis",
    explanation:
      "Jika hanya rumah Anda, kemungkinan MCB utama trip, token/pulsa listrik habis, atau ada pemutusan dari PLN.",
    steps: [
      "Periksa meteran PLN — cek apakah ada notif 'PERIKSA' atau token habis",
      "Beli token listrik via PLN Mobile, Tokopedia, atau minimarket",
      "Periksa MCB utama di panel — mungkin posisinya di tengah (trip)",
      "Jika MCB langsung trip lagi saat dinaikkan, hubungi PLN 123",
    ],
    warning: null,
  },
  mati_sebagian: {
    diagnosis: true,
    severity: "warning",
    title: "MCB Grup Tertentu Trip",
    explanation:
      "Listrik mati sebagian menandakan satu atau beberapa MCB cabang di panel yang trip.",
    steps: [
      "Buka panel MCB — cari MCB yang posisinya berbeda (tengah atau OFF)",
      "Naikan MCB yang trip tersebut",
      "Jika langsung trip kembali, ada korsleting di jalur itu — jangan paksa",
      "Cabut semua perangkat di area yang mati, lalu coba naikan MCB lagi",
    ],
    warning: null,
  },
  mati_setelah_hujan: {
    diagnosis: true,
    severity: "danger",
    title: "Air Masuk ke Instalasi",
    explanation:
      "Hujan lebat bisa membawa air masuk ke jalur kabel, stop kontak outdoor, atau atap, memicu ELCB trip atau korsleting.",
    steps: [
      "JANGAN nyalakan listrik jika ada area rumah yang masih tergenang air",
      "Pastikan semua area basah sudah kering sebelum nyalakan MCB",
      "Periksa stop kontak di luar ruangan — pastikan tidak ada air di dalamnya",
      "Hubungi teknisi untuk tes isolasi kabel sebelum instalasi digunakan kembali",
    ],
    warning: "Bahaya: listrik dan air sangat berbahaya. Pastikan semua kering sebelum dinyalakan.",
  },
};
