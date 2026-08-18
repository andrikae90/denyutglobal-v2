import { RadarNewsItem, RadarCategoryKey, RadarStatus, RadarSourceType } from '../types';

export interface RadarCategoryDefinition {
  key: RadarCategoryKey;
  code: string;
  name: string;
  badgeColor: string;
  primaryAgencies: string[];
  topicsCovered: string[];
  rules: string;
}

export const RADAR_CATEGORIES_CONFIG: RadarCategoryDefinition[] = [
  {
    key: 'kriminal_keamanan',
    code: 'A',
    name: 'Kriminal & Keamanan',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    primaryAgencies: ['Polri', 'Tribrata News', 'Polda', 'Polres', 'Humas Kepolisian'],
    topicsCovered: ['Penangkapan', 'Penyelidikan', 'Pengungkapan Kasus', 'Kecelakaan', 'Keamanan', 'Operasi Kepolisian', 'Pernyataan Resmi'],
    rules: 'Jangan membuat tuduhan baru. Gunakan istilah "diduga", "menurut keterangan polisi", atau istilah hukum yang tepat jika proses hukum belum final.'
  },
  {
    key: 'hukum_pengadilan',
    code: 'B',
    name: 'Hukum & Pengadilan',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    primaryAgencies: ['Kejaksaan RI', 'KPK RI', 'Mahkamah Agung RI', 'Pengadilan Negeri / Tipikor', 'Mahkamah Konstitusi'],
    topicsCovered: ['Penyidikan', 'Penuntutan', 'Persidangan', 'Putusan Pengadilan', 'Tindak Pidana Korupsi', 'Perkara Pidana/Perdata'],
    rules: 'Patuhi asas praduga tak bersalah. Jangan menyebut seseorang sebagai pelaku/bersalah jika belum ada dasar hukum berkekuatan tetap.'
  },
  {
    key: 'bencana_kedaruratan',
    code: 'C',
    name: 'Bencana & Kedaruratan',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    primaryAgencies: ['BNPB', 'BPBD', 'Basarnas', 'BMKG', 'PVMBG / Badan Geologi', 'Magma Indonesia'],
    topicsCovered: ['Gempa Bumi', 'Tsunami', 'Erupsi Gunung Api', 'Banjir', 'Longsor', 'Cuaca Ekstrem', 'Operasi SAR', 'Evakuasi Warga'],
    rules: 'Utamakan data resmi terbaru dari pos pemantauan/otoritas berwenang. Angka korban dan radius bahaya harus persis rilis resmi.'
  },
  {
    key: 'kesehatan',
    code: 'D',
    name: 'Kesehatan',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    primaryAgencies: ['Kementerian Kesehatan RI', 'Faskes Pemerintah', 'BPOM RI', 'WHO Indonesia', 'Lembaga Kesehatan Resmi'],
    topicsCovered: ['Pemberitahuan Kesehatan Publik', 'Uji BPOM', 'Pengawasan Obat & Makanan', 'Imunisasi', 'Pencegahan Wabah'],
    rules: 'Dilarang membuat diagnosis atau klaim medis yang tidak didukung rujukan resmi Kemenkes/BPOM/WHO.'
  },
  {
    key: 'ekonomi_keuangan',
    code: 'E',
    name: 'Ekonomi & Keuangan',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    primaryAgencies: ['Badan Pusat Statistik (BPS)', 'Bank Indonesia (BI)', 'Otoritas Jasa Keuangan (OJK)', 'Kementerian Keuangan RI', 'Kementerian Perdagangan'],
    topicsCovered: ['Inflasi', 'Pertumbuhan Ekonomi', 'Nilai Tukar Rupiah', 'Suku Bunga Acuan', 'Perdagangan & Ekspor', 'Investasi', 'Perbankan & Fintech', 'Data Statistik'],
    rules: 'Pertahankan angka persis seperti sumber data resmi BPS/BI/Kemenkeu. Jangan membulatkan angka tanpa keterangan.'
  },
  {
    key: 'energi_sumberdaya',
    code: 'F',
    name: 'Energi & Sumber Daya',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    primaryAgencies: ['Kementerian ESDM RI', 'PT PLN (Persero)', 'PT Pertamina (Persero)', 'SKK Migas'],
    topicsCovered: ['Bahan Bakar Minyak (BBM)', 'Kelistrikan', 'Ketahanan Energi', 'Migas', 'Pertambangan', 'Transisi Energi Bersih'],
    rules: 'Gunakan data kuota, tarif resmi, dan keputusan menteri terkait.'
  },
  {
    key: 'pemerintah_kenegaraan',
    code: 'G',
    name: 'Pemerintah & Kenegaraan',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    primaryAgencies: ['Presiden RI / Istana Kepresidenan', 'Sekretariat Negara (Setneg)', 'Kementerian / Lembaga', 'Pemerintah Daerah (Pemprov/Pemkot)'],
    topicsCovered: ['Kebijakan Nasional', 'Peraturan Pemerintah / Perpres', 'Keputusan Resmi', 'Kunjungan Kenegaraan', 'Program Prioritas'],
    rules: 'Rujuk langsung dokumen resmi, salinan regulasi, atau transkrip siaran pers Setneg/Biro Pers Presiden.'
  },
  {
    key: 'lingkungan',
    code: 'H',
    name: 'Lingkungan',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    primaryAgencies: ['Kementerian Lingkungan Hidup & Kehutanan (KLHK)', 'BMKG Iklim', 'BNPB Mitigasi', 'BRIN Lingkungan'],
    topicsCovered: ['Perubahan Iklim', 'Kawasan Konservasi Hutan', 'Kualitas Udara / Polusi', 'Pengelolaan Sampah & Limbah', 'Rehabilitasi Ekosistem'],
    rules: 'Gunakan indikator terukur (ISPU, indeks tutupan, suhu rata-rata) sesuai data KLHK/BMKG.'
  },
  {
    key: 'teknologi_sains',
    code: 'I',
    name: 'Teknologi & Sains',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    primaryAgencies: ['Badan Riset dan Inovasi Nasional (BRIN)', 'Kemendiktisaintek / Universitas', 'Jurnal Ilmiah Terakreditasi', 'Lembaga Penelitian Resmi'],
    topicsCovered: ['Inovasi Riset', 'Kecerdasan Buatan & Digital', 'Keamanan Siber', 'Riset Antariksa & Kelautan', 'Publikasi Jurnal Ilmiah'],
    rules: 'Jangan mengubah hasil penelitian menjadi klaim yang lebih besar daripada temuan metodologis riset.'
  },
  {
    key: 'olahraga',
    code: 'J',
    name: 'Olahraga',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    primaryAgencies: ['Federasi Olahraga (PSSI, PBSI, dll)', 'Kemenpora RI', 'Komite Olimpiade Indonesia (NOC)', 'Akun Resmi Atlet / Klub / Penyelenggara'],
    topicsCovered: ['Hasil Pertandingan Resmi', 'Seleksi & Pemusatan Latihan', 'Kejuaraan Nasional / Internasional', 'Regulasi Kompetisi'],
    rules: 'Hasil pertandingan dan catatan skor harus diverifikasi dari sumber penyelenggara resmi sebelum diterbitkan.'
  },
  {
    key: 'artis_hiburan',
    code: 'K',
    name: 'Artis & Hiburan',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    primaryAgencies: ['Akun Resmi Terverifikasi Artis', 'Manajemen / Agensi', 'Rumah Produksi (PH)', 'Label Musik', 'Promotor / Penyelenggara Acara Resmi'],
    topicsCovered: ['Rilis Karya Baru', 'Pernyataan Resmi Manajemen', 'Penghargaan', 'Konferensi Pers Resmi'],
    rules: 'Media hiburan sekunder hanya boleh jadi RADAR TOPIK. Jika belum ada konfirmasi primer (artis/manajemen), status wajib PERLU VERIFIKASI.'
  },
  {
    key: 'dunia',
    code: 'L',
    name: 'Internasional & Global',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    primaryAgencies: ['PBB / UN Agencies', 'Kemlu RI', 'Kedutaan Besar / Diplomatik Resmi', 'Otoritas Internasional Terverifikasi'],
    topicsCovered: ['Hubungan Internasional', 'Perjanjian Bilateral/Multilateral', 'Diplomasi Perdamaian', 'Krisis Global'],
    rules: 'Sajikan fakta berimbang dengan rujukan silang dokumen diplomatik dan pernyataan resmi pihak terkait.'
  }
];

export const INITIAL_RADAR_ITEMS: RadarNewsItem[] = [
  // 1. KRIMINAL & KEAMANAN (A)
  {
    id: 'radar-krim-01',
    kategoriRadar: 'kriminal_keamanan',
    kategoriLabel: 'Kriminal & Keamanan',
    judulTopik: 'Humas Polri Rilis Hasil Operasi Penegakan Hukum Penyelundupan Barang Ilegal di Perbatasan',
    namaSumber: 'Divisi Humas Mabes Polri',
    jenisSumber: 'primer',
    lembagaKategori: 'Polri / Humas Mabes Polri',
    waktu: '17 Agu 2026 • 11:30 WIB',
    lokasi: 'Nunukan, Kalimantan Utara',
    faktaUtama: [
      'Satgas Khusus Operasi Perbatasan menggagalkan upaya penyelundupan barang komoditas ilegal tanpa dokumen pabean senilai Rp4,2 miliar di perairan Nunukan.',
      'Menurut keterangan resmi Karo Penmas Divhumas Polri, dua orang nakhoda kapal motor berinisial AR (38) dan HS (42) saat ini berstatus terperiksa dalam proses penyidikan.',
      'Penyidik menyita barang bukti berupa 1.200 karung pakaian bekas impor dan 15 ton bahan pangan beku tanpa izin karantina.',
      'Proses hukum berjalan sesuai ketentuan Undang-Undang Nomor 17 Tahun 2006 tentang Kepabeanan dengan tetap menjunjung asas praduga tak bersalah.'
    ],
    urlSumber: 'https://humas.polri.go.id/siaran-pers/operasi-penindakan-penyelundupan-perbatasan-nunukan-2026',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Rilis resmi Divisi Humas Polri dengan detail nomor laporan polisi dan identitas barang bukti yang terverifikasi.'
  },

  // 2. HUKUM & PENGADILAN (B)
  {
    id: 'radar-huk-01',
    kategoriRadar: 'hukum_pengadilan',
    kategoriLabel: 'Hukum & Pengadilan',
    judulTopik: 'KPK RI Tahan Tersangka Dugaan Korupsi Pengadaan Sistem Digitalisasi Daerah Senilai Rp18 Miliar',
    namaSumber: 'Komisi Pemberantasan Korupsi (KPK RI)',
    jenisSumber: 'primer',
    lembagaKategori: 'KPK RI',
    waktu: '17 Agu 2026 • 10:45 WIB',
    lokasi: 'Jakarta Selatan, DKI Jakarta',
    faktaUtama: [
      'KPK melakukan penahanan rutan selama 20 hari pertama terhadap mantan pejabat pembuat komitmen (PPK) berinisial WN terkait penyidikan pengadaan sistem layanan publik.',
      'Berdasarkan audit investigatif BPK, estimasi kerugian keuangan negara tercatat sebesar Rp18,6 miliar.',
      'Juru Bicara KPK menegaskan seluruh proses penanganan perkara mengacu pada bukti permulaan yang cukup dan tersangka didampingi penasihat hukum.',
      'Pasal yang disangkakan adalah Pasal 2 ayat (1) atau Pasal 3 UU Tipikor juncto Pasal 55 ayat (1) ke-1 KUHP.'
    ],
    urlSumber: 'https://kpk.go.id/id/berita/siaran-pers/penahanan-tersangka-dugaan-korupsi-digitalisasi-2026',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Konferensi pers resmi Juru Bicara KPK RI lengkap dengan rincian pasal dan audit kerugian BPK.'
  },

  // 3. BENCANA & KEDARURATAN (C)
  {
    id: 'radar-benc-01',
    kategoriRadar: 'bencana_kedaruratan',
    kategoriLabel: 'Bencana & Kedaruratan',
    judulTopik: 'Badan Geologi PVMBG Laporkan Aktivitas Erupsi Gunung Lewotobi Laki-laki Capai Kolom Abu 1.500 Meter',
    namaSumber: 'Pusat Vulkanologi dan Mitigasi Bencana Geologi (PVMBG)',
    jenisSumber: 'primer',
    lembagaKategori: 'Badan Geologi / PVMBG',
    waktu: '17 Agu 2026 • 09:15 WITA',
    lokasi: 'Flores Timur, Nusa Tenggara Timur',
    faktaUtama: [
      'Pos Pengamatan Gunung Api Lewotobi Laki-laki mencatat erupsi pada pukul 08.40 WITA dengan tinggi kolom abu vulkanik teramati sekitar 1.500 meter di atas puncak.',
      'Kolom abu teramati berwarna kelabu tebal dengan intensitas condong mengarah ke barat laut.',
      'Tingkat aktivitas Gunung Lewotobi Laki-laki berada pada Status Level III (Siaga).',
      'Badan Geologi merekomendasikan masyarakat dan wisatawan untuk tidak melakukan aktivitas dalam radius 3 km dari pusat erupsi serta sektoral 4 km ke arah barat daya-barat laut.'
    ],
    urlSumber: 'https://magma.esdm.go.id/v1/gunung-api/laporan/lewotobi-laki-laki-20260817',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Data resmi instrumen seismograf dan visual Pos Pengamatan PVMBG Magma Indonesia.'
  },

  // 4. BENCANA (BMKG REAL-TIME AUTOGEMPA)
  {
    id: 'radar-bmkg-gempa',
    kategoriRadar: 'bencana_kedaruratan',
    kategoriLabel: 'Bencana & Kedaruratan',
    judulTopik: 'BMKG Catat Gempa Tektonik Magnitudo 5,2 di Pesisir Barat Daya Kepulauan Mentawai',
    namaSumber: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
    jenisSumber: 'primer',
    lembagaKategori: 'BMKG Indonesia',
    waktu: '17 Agu 2026 • 08:20 WIB',
    lokasi: 'Kepulauan Mentawai, Sumatra Barat',
    faktaUtama: [
      'Pusat gempa berada di laut pada koordinat 2.14 LS dan 99.38 BT atau sekitar 65 km barat daya Tuapejat dengan kedalaman 18 km.',
      'Getaran gempa dirasakan pada skala intensitas III-IV MMI di wilayah Kepulauan Mentawai dan skala II MMI di pesisir Padang.',
      'Hasil pemodelan BMKG memastikan gempa bumi tektonik ini tidak berpotensi tsunami.',
      'BMKG mengimbau masyarakat tetap tenang dan memeriksa kondisi bangunan tempat tinggal sebelum kembali beraktivitas.'
    ],
    urlSumber: 'https://data.bmkg.go.id/DataMKG/TEKTONIK/autogempa.json',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Sensor InaTEWS BMKG terverifikasi otomatis dengan verifikasi seismolog bertugas.'
  },

  // 5. KESEHATAN (D)
  {
    id: 'radar-kes-01',
    kategoriRadar: 'kesehatan',
    kategoriLabel: 'Kesehatan',
    judulTopik: 'BPOM RI Terbitkan Hasil Pengawasan Nasional Uji Mutu 42 Produk Pangan Olahan Kemasan',
    namaSumber: 'Badan Pengawas Obat dan Makanan (BPOM RI)',
    jenisSumber: 'primer',
    lembagaKategori: 'BPOM RI',
    waktu: '17 Agu 2026 • 07:50 WIB',
    lokasi: 'Jakarta Pusat, DKI Jakarta',
    faktaUtama: [
      'BPOM menyelesaikan uji laboratorium acak terhadap 42 batch produk pangan olahan yang beredar di pasar ritel dan marketplace digital.',
      'Sebanyak 40 produk terbukti memenuhi seluruh parameter batas cemaran mikroba dan keamanan bahan tambahan pangan.',
      'Dua produk ditarik sementara dari peredaran karena ketidaksesuaian label kedaluwarsa dan tidak memiliki izin edar resmi MD.',
      'Masyarakat diimbau selalu melakukan prosedur CEK KLIK (Kemasan, Label, Izin Edar, Kedaluwarsa) sebelum mengonsumsi produk kemasan.'
    ],
    urlSumber: 'https://pom.go.id/berita/siaran-pers/hasil-pengawasan-mutu-pangan-olahan-agustus-2026',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Laporan pengujian laboratorium terakreditasi BPOM RI dengan nomor registrasi terbuka.'
  },

  // 6. EKONOMI & KEUANGAN (E)
  {
    id: 'radar-eko-01',
    kategoriRadar: 'ekonomi_keuangan',
    kategoriLabel: 'Ekonomi & Keuangan',
    judulTopik: 'Bank Indonesia Laporkan Posisi Cadangan Devisa Nasional Capai USD 149,9 Miliar',
    namaSumber: 'Departemen Komunikasi Bank Indonesia (BI)',
    jenisSumber: 'primer',
    lembagaKategori: 'Bank Indonesia',
    waktu: '17 Agu 2026 • 07:15 WIB',
    lokasi: 'Jakarta, Indonesia',
    faktaUtama: [
      'Posisi cadangan devisa Indonesia pada akhir periode tercatat sebesar USD 149,9 miliar, setara dengan pembiayaan 6,8 bulan impor.',
      'Bank Indonesia menilai posisi cadangan devisa tersebut berada di atas standar kecukupan internasional yaitu sekitar 3 bulan impor.',
      'Peningkatan cadangan devisa dipengaruhi oleh penerimaan pajak, devisa hasil ekspor (DHE), serta penarikan pinjaman luar negeri pemerintah.',
      'BI memandang cadangan devisa mampu mendukung ketahanan sektor eksternal serta menjaga stabilitas makroekonomi dan sistem keuangan.'
    ],
    urlSumber: 'https://bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2814026.aspx',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Statistik resmi Departemen Komunikasi Bank Indonesia.'
  },

  // 7. ENERGI & SUMBER DAYA (F)
  {
    id: 'radar-esdm-01',
    kategoriRadar: 'energi_sumberdaya',
    kategoriLabel: 'Energi & Sumber Daya',
    judulTopik: 'Kementerian ESDM Resmikan Pembangkit Listrik Tenaga Surya Terapung 100 MWp di Waduk Cirata Fase II',
    namaSumber: 'Kementerian Energi dan Sumber Daya Mineral (Kementerian ESDM)',
    jenisSumber: 'primer',
    lembagaKategori: 'Kementerian ESDM RI / PT PLN',
    waktu: '16 Agu 2026 • 15:40 WIB',
    lokasi: 'Purwakarta, Jawa Barat',
    faktaUtama: [
      'Kementerian ESDM bersama PT PLN (Persero) menyelesaikan interkoneksi jaringan PLTS Terapung Cirata Fase II berkapasitas 100 MWp ke sistem transmisi 150 kV Jawa-Bali.',
      'Pembangkit ini diproyeksikan mampu mereduksi emisi karbon hingga 125.000 ton CO2 per tahun.',
      'Tingkat Komponen Dalam Negeri (TKDN) pada proyek ekspansi ini tercatat mencapai 43,8 persen.',
      'Proyek ini merupakan bagian dari peta jalan percepatan bauran energi baru terbarukan (EBT) nasional menuju target 2030.'
    ],
    urlSumber: 'https://esdm.go.id/id/berita-unit/direktorat-jenderal-ebtke/peresmian-plts-terapung-cirata-fase-ii',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Siaran pers Biro Komunikasi Kementerian ESDM disertai dokumen teknis interkoneksi daya.'
  },

  // 8. PEMERINTAH & KENEGARAAN (G)
  {
    id: 'radar-pem-01',
    kategoriRadar: 'pemerintah_kenegaraan',
    kategoriLabel: 'Pemerintah & Kenegaraan',
    judulTopik: 'Sekretariat Negara Terbitkan Perpres Tata Kelola Satu Data Pangan dan Logistik Nasional',
    namaSumber: 'Kementerian Sekretariat Negara RI',
    jenisSumber: 'primer',
    lembagaKategori: 'Sekretariat Negara (Setneg RI)',
    waktu: '16 Agu 2026 • 14:10 WIB',
    lokasi: 'Jakarta Pusat, DKI Jakarta',
    faktaUtama: [
      'Pemerintah menerbitkan Peraturan Presiden mengenai integrasi interoperabilitas basis data komoditas pangan pokok antar kementerian/lembaga dan pemerintah daerah.',
      'Perpres menetapkan Badan Pangan Nasional (Bapanas) dan BPS sebagai walidata statistik sektoral terpadu.',
      'Sistem ditargetkan menghubungkan 514 kabupaten/kota untuk memantau neraca stok beras, jagung, gula, dan minyak goreng secara harian.',
      'Salinan naskah regulasi resmi dapat diakses publik melalui Jaringan Dokumentasi dan Informasi Hukum (JDIH) Setneg.'
    ],
    urlSumber: 'https://setneg.go.id/baca/index/perpres_tata_kelola_satu_data_pangan_nasional_2026',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Publikasi resmi naskah regulasi lembaran negara JDIH Sekretariat Negara RI.'
  },

  // 9. LINGKUNGAN (H)
  {
    id: 'radar-ling-01',
    kategoriRadar: 'lingkungan',
    kategoriLabel: 'Lingkungan',
    judulTopik: 'KLHK Laporkan Penurunan Titik Panas Karhutla Sebesar 68 Persen pada Periode Musim Kemarau 2026',
    namaSumber: 'Kementerian Lingkungan Hidup dan Kehutanan (KLHK)',
    jenisSumber: 'primer',
    lembagaKategori: 'KLHK / SiPongi',
    waktu: '16 Agu 2026 • 11:20 WIB',
    lokasi: 'Pekanbaru, Riau',
    faktaUtama: [
      'Sistem Pemantauan Karhutla SiPongi KLHK mencatat 214 titik panas (hotspot) berkepercayaan tinggi pada periode Juli-Agustus 2026, menurun 68 persen dibanding periode yang sama tahun sebelumnya (670 titik).',
      'Operasi Modifikasi Cuaca (OMC) bersama BMKG dan TNI AU berhasil menyemai 45 ton garam (NaCl) di atas wilayah gambut Riau, Jambi, dan Sumatra Selatan.',
      'Manggala Agni bersama satgas terpadu tetap melakukan patroli mandiri di 48 desa rawan kebakaran.',
      'KLHK mengimbau korporasi perkebunan mematuhi larangan pembukaan lahan tanpa bakar (zero burning).'
    ],
    urlSumber: 'https://sipongi.menlhk.go.id/laporan/monitoring-hotspot-nasional-agustus-2026',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Data satelit Terra/Aqua dan rilis resmi Ditjen Pengendalian Perubahan Iklim KLHK.'
  },

  // 10. TEKNOLOGI & SAINS (I)
  {
    id: 'radar-tek-01',
    kategoriRadar: 'teknologi_sains',
    kategoriLabel: 'Teknologi & Sains',
    judulTopik: 'BRIN Sukses Uji Klinis Fase I Kandidat Vaksin Tuberkulosis Berbasis Rekombinan Protein',
    namaSumber: 'Badan Riset dan Inovasi Nasional (BRIN)',
    jenisSumber: 'primer',
    lembagaKategori: 'BRIN Riset Hayati',
    waktu: '15 Agu 2026 • 16:30 WIB',
    lokasi: 'Cibinong, Jawa Barat',
    faktaUtama: [
      'Pusat Riset Vaksin dan Obat BRIN bersama konsorsium universitas mengumumkan hasil uji klinis fase 1 kandidat vaksin TB rekombinan pada 60 relawan sehat.',
      'Hasil uji menunjukkan profil keamanan yang baik tanpa efek samping berat (adverse events) dan menginduksi respons imun seluler T spesifik.',
      'Tim peneliti bersiap mengajukan persetujuan uji klinis fase 2 kepada BPOM pada kuartal IV 2026.',
      'Hasil studi pendahuluan telah dipublikasikan secara peer-reviewed di jurnal ilmiah biomedis terakreditasi.'
    ],
    urlSumber: 'https://brin.go.id/news/118294/uji-klinis-fase-1-vaksin-tb-rekombinan-brin',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Rilis hasil riset resmi BRIN lengkap dengan DOI publikasi ilmiah.'
  },

  // 11. OLAHRAGA (J)
  {
    id: 'radar-or-01',
    kategoriRadar: 'olahraga',
    kategoriLabel: 'Olahraga',
    judulTopik: 'PBSI Rilis Skuad Resmi 18 Atlet Bulu Tangkis Indonesia untuk Kejuaraan Dunia BWF 2026',
    namaSumber: 'Persatuan Bulutangkis Seluruh Indonesia (PBSI)',
    jenisSumber: 'primer',
    lembagaKategori: 'PP PBSI',
    waktu: '15 Agu 2026 • 13:00 WIB',
    lokasi: 'Cipayung, Jakarta Timur',
    faktaUtama: [
      'PP PBSI mengumumkan daftar definitif 18 atlet yang akan mewakili Indonesia di Kejuaraan Dunia BWF di Paris.',
      'Komposisi tim terdiri atas 3 tunggal putra, 2 tunggal putri, 3 ganda putra, 2 ganda putri, dan 3 ganda campuran.',
      'Seluruh atlet telah menjalani tes fisik dan pemusatan latihan intensif di Pelatnas Cipayung.',
      'Target resmi federasi adalah membawa pulang minimal satu medali emas dari sektor ganda putra atau tunggal putra.'
    ],
    urlSumber: 'https://pbsi.id/berita-resmi/rilis-skuad-tim-indonesia-kejuaraan-dunia-bwf-2026',
    status: 'sumber_primer_terkonfirmasi',
    keteranganStatus: 'Surat Keputusan (SK) resmi PP PBSI dan verifikasi BWF Bidding Entry.'
  },

  // 12. ARTIS & HIBURAN (K) - SECONDARY MEDIA EXAMPLE (MENUNGGU KONFIRMASI)
  {
    id: 'radar-art-01',
    kategoriRadar: 'artis_hiburan',
    kategoriLabel: 'Artis & Hiburan',
    judulTopik: 'Pemberitaan Jadwal Konser Tur Dunia Grup Musik Internasional di Stadion GBK Jakarta',
    namaSumber: 'Media Sekunder (Portal Hiburan)',
    jenisSumber: 'sekunder',
    lembagaKategori: 'Media Sekunder / Kabar Media',
    waktu: '17 Agu 2026 • 12:00 WIB',
    lokasi: 'Jakarta Pusat, DKI Jakarta',
    faktaUtama: [
      'Beredar laporan media sekunder mengenai rencana penambahan hari konser tur dunia di Stadion Utama GBK pada November 2026.',
      'Pihak promotor resmi dan manajemen artis belum merilis pernyataan tertulis maupun pembukaan penjualan tiket di situs resmi.',
      'Sesuai Pedoman Radar DenyutGlobal: Informasi dari media hiburan sekunder hanya berfungsi sebagai radar topik dan WAJIB menunggu rilis resmi pihak promotor/manajemen sebelum dapat disusun menjadi naskah final.'
    ],
    urlSumber: 'https://example.com/media-hiburan-konser-gbk',
    status: 'perlu_verifikasi',
    keteranganStatus: 'SUMBER SEKUNDER — Menunggu konfirmasi resmi dari promotor berwenang atau akun terverifikasi artis.',
    konfirmasiPrimer: {
      ada: false
    }
  },

  // 13. MEDIA SEKUNDER CROSS-CHECK (KOMPAS/DETIK TOPIC DETECTED)
  {
    id: 'radar-sec-crosscheck',
    kategoriRadar: 'ekonomi_keuangan',
    kategoriLabel: 'Ekonomi & Keuangan',
    judulTopik: 'Laporan Tren Penjualan Kendaraan Listrik Domestik Naik 45 Persen pada Semester I',
    namaSumber: 'Media Sekunder (Warta Otomotif)',
    jenisSumber: 'sekunder',
    lembagaKategori: 'Media Sekunder (Cross-Check)',
    waktu: '16 Agu 2026 • 18:00 WIB',
    lokasi: 'Jakarta, Indonesia',
    faktaUtama: [
      'Media sekunder melaporkan data asosiasi industri terkait pertumbuhan volume penjualan kendaraan listrik berbasis baterai (BEV).',
      'Data sedang dicocokkan dengan rilis resmi Gaikindo dan Kementerian Perindustrian RI untuk memastikan angka statistik akurat.',
      'Status: Radar mendeteksi topik. Memerlukan konfirmasi sumber primer Gaikindo sebelum draft original diproses.'
    ],
    urlSumber: 'https://example.com/berita-penjualan-ev-semester-1',
    status: 'perlu_verifikasi',
    keteranganStatus: 'SUMBER SEKUNDER — Gunakan tombol Verifikasi untuk menyandingkan dengan data primer Kemenperin/Gaikindo.',
    konfirmasiPrimer: {
      ada: false
    }
  }
];
