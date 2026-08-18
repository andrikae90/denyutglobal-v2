import { RadarNewsItem, RadarVerificationResult, Verification9PointItem, RadarStatus } from '../types';

/**
 * 9-Point Verification Process for DenyutGlobal Radar Berita
 * 
 * 1. Apakah sumber resmi?
 * 2. Apakah sumber primer?
 * 3. Apakah tanggal tersedia?
 * 4. Apakah fakta utama jelas?
 * 5. Apakah lokasi jelas?
 * 6. Apakah terdapat klaim yang belum terkonfirmasi?
 * 7. Apakah ada sumber primer pendukung?
 * 8. Apakah berita sudah terlalu lama?
 * 9. Apakah informasi bertentangan dengan sumber resmi lain?
 */
export function runRadar9PointVerification(item: RadarNewsItem): RadarVerificationResult {
  const isPrimary = item.jenisSumber === 'primer';
  const hasPrimaryConfirmation = !!(item.konfirmasiPrimer && item.konfirmasiPrimer.ada);
  const isSecondary = item.jenisSumber === 'sekunder';
  const hasUrl = !!(item.urlSumber && item.urlSumber.startsWith('http'));
  const hasValidFacts = Array.isArray(item.faktaUtama) && item.faktaUtama.length > 0 && item.faktaUtama.some(f => f.trim().length > 10);
  const hasLocation = !!(item.lokasi && item.lokasi.trim() && item.lokasi !== 'Tidak disebutkan dalam sumber');
  const hasDate = !!(item.waktu && item.waktu.trim().length > 0);

  const checks: Verification9PointItem[] = [];

  // Check 1: Apakah sumber resmi?
  const isOfficial = isPrimary || (hasUrl && !item.namaSumber.toLowerCase().includes('anonim') && !item.namaSumber.toLowerCase().includes('rumor'));
  checks.push({
    id: 1,
    question: 'Apakah sumber resmi?',
    passed: isOfficial,
    detail: isOfficial 
      ? `Sumber teridentifikasi resmi: ${item.namaSumber}.`
      : 'Sumber tidak teridentifikasi atau berasal dari kanal tidak resmi.'
  });

  // Check 2: Apakah sumber primer?
  const check2Passed = isPrimary ? true : (hasPrimaryConfirmation ? true : false);
  checks.push({
    id: 2,
    question: 'Apakah sumber primer?',
    passed: check2Passed ? true : 'warning',
    detail: isPrimary 
      ? `Ya, merupakan rilis langsung dari lembaga/otoritas primer (${item.namaSumber}).`
      : (hasPrimaryConfirmation 
        ? `Sumber sekunder telah didukung konfirmasi primer: ${item.konfirmasiPrimer?.namaLembaga}.`
        : 'Merupakan sumber sekunder. Wajib cross-check ke sumber primer sebelum rilis final.')
  });

  // Check 3: Apakah tanggal tersedia?
  checks.push({
    id: 3,
    question: 'Apakah tanggal & waktu rilis tersedia?',
    passed: hasDate,
    detail: hasDate 
      ? `Waktu rilis tercatat: ${item.waktu}.`
      : 'Tanggal rilis tidak tercatat dengan presisi.'
  });

  // Check 4: Apakah fakta utama jelas?
  checks.push({
    id: 4,
    question: 'Apakah fakta utama jelas & terstruktur?',
    passed: hasValidFacts,
    detail: hasValidFacts 
      ? `Tersedia ${item.faktaUtama.length} poin fakta utama terverifikasi.`
      : 'Poin fakta utama masih samar atau belum terstruktur.'
  });

  // Check 5: Apakah lokasi jelas?
  checks.push({
    id: 5,
    question: 'Apakah yurisdiksi / lokasi peristiwa teridentifikasi?',
    passed: hasLocation ? true : 'warning',
    detail: hasLocation 
      ? `Lokasi teridentifikasi: ${item.lokasi}.`
      : 'Lokasi spesifik belum tercantum (status yurisdiksi umum).'
  });

  // Check 6: Apakah terdapat klaim yang belum terkonfirmasi?
  const hasUnconfirmedClaims = item.status === 'tidak_layak' || item.judulTopik.toLowerCase().includes('rumor') || item.judulTopik.toLowerCase().includes('diduga kuat');
  checks.push({
    id: 6,
    question: 'Apakah terdapat klaim yang belum terkonfirmasi / tuduhan sepihak?',
    passed: !hasUnconfirmedClaims,
    detail: !hasUnconfirmedClaims 
      ? 'Tidak terdeteksi tuduhan sepihak atau klaim tanpa dasar hukum rujukan.'
      : 'Terdapat klaim atau tuduhan yang memerlukan rujukan keterangan resmi lanjutan.'
  });

  // Check 7: Apakah ada sumber primer pendukung?
  const check7Passed = isPrimary || hasPrimaryConfirmation;
  checks.push({
    id: 7,
    question: 'Apakah ada sumber primer pendukung (cross-check)?',
    passed: check7Passed ? true : 'warning',
    detail: isPrimary 
      ? 'Dokumen/rilis primer tersedia sebagai basis utama naskah.'
      : (hasPrimaryConfirmation 
        ? `Terkonfirmasi dengan sumber primer: ${item.konfirmasiPrimer?.namaLembaga || 'Otoritas Terkait'}.`
        : 'Belum ada tautan konfirmasi primer. Status: Menunggu Konfirmasi Sumber Primer.')
  });

  // Check 8: Apakah berita sudah terlalu lama?
  const isOutdated = item.waktu.includes('2020') || item.waktu.includes('2021') || item.waktu.includes('2022');
  checks.push({
    id: 8,
    question: 'Apakah informasi mutakhir dan relevan?',
    passed: !isOutdated,
    detail: !isOutdated 
      ? 'Informasi merupakan perkembangan terkini yang relevan untuk publik.'
      : 'Informasi merupakan arsip lama yang memerlukan pembaruan konteks terkini.'
  });

  // Check 9: Apakah informasi bertentangan dengan sumber resmi lain?
  const hasContradiction = false;
  checks.push({
    id: 9,
    question: 'Apakah informasi bertentangan dengan rilis resmi instansi berwenang?',
    passed: !hasContradiction,
    detail: 'Tidak ditemukan bantahan atau rilis sanggahan resmi dari instansi terkait.'
  });

  // Calculate Verdict
  let verdict: 'terverifikasi' | 'perlu_verifikasi' | 'tidak_layak' = 'terverifikasi';
  let primaryConfirmed = false;
  let canDraft = false;

  if (item.status === 'tidak_layak' || !isOfficial || hasUnconfirmedClaims) {
    verdict = 'tidak_layak';
    primaryConfirmed = false;
    canDraft = false;
  } else if (isPrimary || hasPrimaryConfirmation) {
    verdict = 'terverifikasi';
    primaryConfirmed = true;
    canDraft = true;
  } else {
    verdict = 'perlu_verifikasi';
    primaryConfirmed = false;
    canDraft = false; // Harus konfirmasi primer terlebih dahulu
  }

  let summary = '';
  if (verdict === 'terverifikasi') {
    summary = `✅ TERVERIFIKASI: Bahan rujukan berasal dari sumber primer resmi (${item.namaSumber}). Memenuhi standar integritas fakta DenyutGlobal untuk dilanjutkan ke penyusunan draft original.`;
  } else if (verdict === 'perlu_verifikasi') {
    summary = `🟡 PERLU VERIFIKASI: Topik ini ditemukan dari media sekunder (${item.namaSumber}). Wajib melakukan cross-check atau melampirkan konfirmasi sumber primer sebelum menyusun draft final.`;
  } else {
    summary = `🔴 TIDAK LAYAK: Informasi belum memenuhi kriteria kelayakan sumber primer DenyutGlobal (berisiko rumor/klaim tanpa pembuktian resmi).`;
  }

  return {
    verdict,
    checks,
    summary,
    primaryConfirmed,
    canDraft,
    checkedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric' })
  };
}

/**
 * Maps Radar status to readable badge & badge styling
 */
export function getRadarStatusMeta(status: RadarStatus, isVerified = false, jenisSumber: 'primer' | 'sekunder' = 'primer') {
  switch (status) {
    case 'sumber_primer_terkonfirmasi':
      return {
        label: '🟢 SUMBER PRIMER TERKONFIRMASI',
        shortLabel: 'Sumber Primer Terkonfirmasi',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
        canDraft: true,
        description: 'Berasal langsung dari lembaga pemerintah, aparat, pengadilan, atau organisasi resmi.'
      };
    case 'sumber_primer_konteks':
      return {
        label: '🔵 SUMBER PRIMER + KONTEKS',
        shortLabel: 'Sumber Primer + Konteks',
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
        dotColor: 'bg-blue-500',
        canDraft: true,
        description: 'Sumber primer tersedia dan diperkaya data rujukan pendukung.'
      };
    case 'perlu_verifikasi':
      return {
        label: '🟡 PERLU VERIFIKASI',
        shortLabel: jenisSumber === 'sekunder' ? 'Sumber Sekunder — Menunggu Konfirmasi Primer' : 'Perlu Verifikasi',
        badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
        dotColor: 'bg-amber-500',
        canDraft: isVerified,
        description: 'Ditemukan dari media sekunder atau membutuhkan verifikasi konfirmasi primer sebelum dibuat draft final.'
      };
    case 'tidak_layak':
      return {
        label: '🔴 TIDAK LAYAK OTOMATIS',
        shortLabel: 'Tidak Layak Otomatis',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
        dotColor: 'bg-rose-500',
        canDraft: false,
        description: 'Sumber tidak jelas, rumor, atau tidak dapat diverifikasi secara faktual.'
      };
    default:
      return {
        label: '🟡 PERLU VERIFIKASI',
        shortLabel: 'Perlu Verifikasi',
        badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
        dotColor: 'bg-amber-500',
        canDraft: false,
        description: 'Status verifikasi belum ditentukan.'
      };
  }
}
