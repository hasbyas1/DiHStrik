// ============================================================
// knowledgeBase.js (Update Bayesian)
// ============================================================

const PROB_MAP = { "ST": 0.9, "T": 0.7, "S": 0.5, "R": 0.3, "-": 0.1 };

export const HYPOTHESES = [
  { id: "H1", name: "Kelebihan Beban Listrik", prior: 0.50 },
  { id: "H2", name: "Korsleting", prior: 0.10 },
  { id: "H3", name: "Kebocoran Arus Listrik ke Tanah", prior: 0.05 },
  { id: "H4", name: "Sambungan Longgar / Buruk", prior: 0.15 },
  { id: "H5", name: "Isolasi Kabel Rusak / Menua", prior: 0.10 },
  { id: "H6", name: "Perangkat Elektronik Rusak atau Cacat", prior: 0.05 },
  { id: "H7", name: "Busur Listrik", prior: 0.05 },
];

export const SYMPTOMS = [
  { id: "S01", text: "Meteran listrik turun mendadak", probs: ["ST", "-", "S", "S", "R", "S", "ST"] },
  { id: "S02", text: "Stop kontak/saklar panas", probs: ["ST", "ST", "T", "ST", "S", "ST", "T"] },
  { id: "S03", text: "Peralatan listrik tercium bau hangus", probs: ["-", "ST", "R", "ST", "R", "ST", "ST"] },
  { id: "S04", text: "Lampu berkedip atau redup", probs: ["R", "R", "R", "ST", "ST", "ST", "R"] },
  { id: "S05", text: "Tersetrum ringan saat menyentuh casing", probs: ["T", "ST", "ST", "ST", "T", "T", "T"] },
  { id: "S06", text: "Suara mendesis pada komponen listrik", probs: ["R", "R", "T", "ST", "ST", "ST", "T"] },
  { id: "S07", text: "Stop kontak/steker meleleh atau menghitam", probs: ["T", "ST", "-", "ST", "T", "ST", "T"] },
  { id: "S08", text: "Kabel rusak atau terkelupas", probs: ["ST", "ST", "T", "ST", "T", "T", "ST"] },
  { id: "S09", text: "Tagihan listrik melonjak misterius", probs: ["-", "-", "ST", "ST", "-", "ST", "-"] },
  { id: "S10", text: "Alat elektronik rusak mendadak", probs: ["ST", "T", "T", "ST", "T", "ST", "T"] },
  { id: "S11", text: "Percikan api saat colok/cabut perangkat", probs: ["T", "ST", "R", "ST", "-", "R", "ST"] },
  { id: "S12", text: "Bekas bakar/perubahan warna di stop kontak", probs: ["ST", "ST", "R", "ST", "T", "ST", "ST"] },
  { id: "S13", text: "Suara berdengung atau meletup", probs: ["-", "-", "ST", "T", "-", "ST", "S"] },
  { id: "S14", text: "Meteran listrik langsung turun lagi setelah direset", probs: ["ST", "ST", "T", "R", "-", "T", "T"] },
  { id: "S15", text: "Meteran listrik turun akibat perangkat tertentu", probs: ["ST", "T", "-", "-", "-", "ST", "-"] },
  { id: "S16", text: "Saklar/dinding terasa hangat atau bergetar", probs: ["ST", "R", "ST", "ST", "R", "ST", "ST"] },
  { id: "S17", text: "Lampu berkedip acak tanpa sebab", probs: ["R", "R", "ST", "ST", "-", "T", "-"] },
  { id: "S18", text: "Korosi/lembap pada panel listrik", probs: ["-", "-", "ST", "ST", "ST", "T", "R"] },
  { id: "S19", text: "Kabel rusak digigit tikus", probs: ["R", "ST", "ST", "-", "ST", "ST", "ST"] },
  { id: "S20", text: "Keran air logam terasa nyetrum", probs: ["-", "-", "ST", "-", "-", "-", "-"] },
  { id: "S21", text: "Listrik tersedot walau alat mati", probs: ["-", "-", "ST", "-", "-", "ST", "-"] },
];

// Fungsi untuk menghitung Teorema Bayes
export function calculateBayesianDiagnosis(selectedSymptomIds) {
  if (selectedSymptomIds.length === 0) return null;

  const results = [];
  let totalProbabilitySum = 0;

  // Filter objek gejala berdasarkan ID yang dipilih user
  const activeSymptoms = SYMPTOMS.filter(s => selectedSymptomIds.includes(s.id));

  // Hitung probabilitas mentah (P(H) * P(S1|H) * P(S2|H) ...)
  HYPOTHESES.forEach((hypo, index) => {
    let unnormalizedProb = hypo.prior; 

    activeSymptoms.forEach(symptom => {
      const probLabel = symptom.probs[index]; 
      const probValue = PROB_MAP[probLabel];
      unnormalizedProb *= probValue; 
    });

    results.push({
      id: hypo.id,
      name: hypo.name,
      rawProb: unnormalizedProb
    });

    totalProbabilitySum += unnormalizedProb;
  });

  // Normalisasi agar persentase total = 100%
  const normalizedResults = results.map(res => ({
    ...res,
    percentage: ((res.rawProb / totalProbabilitySum) * 100).toFixed(2)
  }));

  // Urutkan dari persentase tertinggi ke terendah
  return normalizedResults.sort((a, b) => b.percentage - a.percentage);
}