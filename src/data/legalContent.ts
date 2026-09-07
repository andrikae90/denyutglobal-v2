export type LegalDocId = 
  | 'tentang-kami'
  | 'kontak'
  | 'privacy-policy'
  | 'ketentuan-layanan'
  | 'disclaimer'
  | 'pedoman-redaksi'
  | 'pedoman-media-siber'
  | 'kebijakan-koreksi';

export interface LegalSection {
  number?: number;
  heading: string;
  subheading?: string;
  paragraphs: string[];
  bulletPoints?: string[];
  callout?: {
    type: 'info' | 'warning' | 'tip';
    title?: string;
    text: string;
  };
}

export interface LegalDocument {
  id: LegalDocId;
  path: string;
  aliases: string[];
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  categoryBadge: string;
  tagline?: string;
  lastUpdated: string;
  summary: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  'tentang-kami': {
    id: 'tentang-kami',
    path: '/tentang-kami',
    aliases: ['/tentang', '/about', '/about-us'],
    title: 'Tentang DenyutGlobal',
    metaTitle: 'Tentang DenyutGlobal — Menangkap Denyut Dunia, Setiap Hari',
    metaDescription: 'Kenali DenyutGlobal, portal informasi dan berita digital berbahasa Indonesia yang menyajikan perkembangan Indonesia dan dunia secara ringkas, berimbang, dan berpedoman pada kode etik jurnalistik.',
    canonicalUrl: 'https://denyutglobal.my.id/tentang-kami',
    categoryBadge: 'Profil & Integritas Redaksi',
    tagline: '“Menangkap Denyut Dunia, Setiap Hari.”',
    lastUpdated: '6 September 2026',
    summary: 'DenyutGlobal adalah portal berita digital berbahasa Indonesia yang menyajikan perkembangan terkini dari Indonesia dan berbagai penjuru dunia secara ringkas, jelas, terverifikasi, dan berimbang.',
    sections: [
      {
        number: 1,
        heading: 'Siapa Kami',
        paragraphs: [
          'DenyutGlobal adalah media berita online independen berbahasa Indonesia yang didedikasikan untuk menghadirkan ringkasan berita dunia, dinamika kawasan Asia-Pasifik, peristiwa nasional Indonesia, ekonomi global, perkembangan kecerdasan buatan, sains, serta isu lingkungan hidup.',
          'Kami menyadari derasnya arus informasi saat ini kerap membebani pembaca dengan sensasionalisme dan berita simpang siur. DenyutGlobal hadir sebagai penyaring yang kredibel, merangkum fakta terverifikasi dan menguraikan konteks penting di balik peristiwa besar dunia.'
        ]
      },
      {
        number: 2,
        heading: 'Visi dan Misi Redaksi',
        paragraphs: [
          'Visi kami adalah menjadi rujukan utama masyarakat Indonesia dalam memahami dinamika peristiwa global secara cepat, akurat, bermartabat, dan berwawasan luas.',
          'Misi DenyutGlobal meliputi:'
        ],
        bulletPoints: [
          'Menyajikan liputan peristiwa internasional dan domestik yang berpijak pada fakta terverifikasi.',
          'Memberikan konteks analisis "Mengapa Ini Penting" (Why It Matters) agar publik memahami implikasi riil dari suatu peristiwa.',
          'Menjunjung tinggi transparansi sumber, independensi editorial, dan standar etika pers.',
          'Memanfaatkan teknologi komputasi secara etis dengan pengawasan manusia (Human-in-the-loop) yang ketat.'
        ]
      },
      {
        number: 3,
        heading: 'Empat Prinsip Utama Kami',
        paragraphs: [
          'Dalam setiap artikel yang dipublikasikan, tim redaksi DenyutGlobal berpegang teguh pada empat pilar integritas:'
        ],
        bulletPoints: [
          'Akurat: Memeriksa fakta utama (nama, waktu, lokasi, angka, dan pernyataan resmi) dari sumber primer dan kantor berita kredibel.',
          'Transparan: Mencantumkan atribusi sumber rujukan dan konteks data secara terang tanpa menyembunyikan fakta esensial.',
          'Orisinalitas Editorial: Menyusun sudut pandang dan narasi mandiri berbasis telaah redaksi, menolak plagiarisme dan salin-tempel tanpa verifikasi.',
          'Berimbang & Proporsional: Menghadirkan beragam perspektif yang relevan dan menghormati asas praduga tak bersalah.'
        ]
      },
      {
        number: 4,
        heading: 'Status & Transparansi Operasional',
        paragraphs: [
          'DenyutGlobal saat ini dikembangkan dan dikelola secara mandiri oleh tim redaksi dan pengembang teknologi informasi di Indonesia. Seluruh operasional editorial dijalankan dengan kepatuhan penuh terhadap Undang-Undang Republik Indonesia Nomor 40 Tahun 1999 tentang Pers serta Pedoman Pemberitaan Media Siber.'
        ],
        callout: {
          type: 'info',
          title: 'Komitmen Keterbukaan',
          text: 'Kami menyajikan informasi operasional dan struktur apa adanya secara jujur tanpa rekayasa. Setiap ralat, sanggahan, atau hak jawab diproses secara terbuka dan akuntabel.'
        }
      }
    ]
  },
  kontak: {
    id: 'kontak',
    path: '/kontak',
    aliases: ['/contact', '/contact-us', '/hubungi-kami'],
    title: 'Kontak & Alamat Redaksi',
    metaTitle: 'Kontak & Alamat Redaksi — DenyutGlobal',
    metaDescription: 'Hubungi redaksi DenyutGlobal untuk informasi, saran peliputan, hak jawab, klarifikasi, pertanyaan umum, dan kerja sama portal berita digital.',
    canonicalUrl: 'https://denyutglobal.my.id/kontak',
    categoryBadge: 'Layanan Pembaca & Redaksi',
    tagline: 'Kami Mendengarkan Suara dan Masukan Pembaca',
    lastUpdated: '6 September 2026',
    summary: 'Saluran resmi untuk menghubungi redaksi DenyutGlobal terkait pertanyaan umum, kerja sama, klarifikasi fakta, maupun pengaduan pembaca.',
    sections: [
      {
        number: 1,
        heading: 'Saluran Komunikasi Resmi',
        paragraphs: [
          'Pembaca, narasumber, mitra, maupun publik dapat berkomunikasi langsung dengan manajemen dan redaksi DenyutGlobal melalui kontak resmi berikut:'
        ],
        bulletPoints: [
          'Email Redaksi & Pemberitaan: redaksi@denyutglobal.my.id',
          'Email Layanan Pembaca & Umum: halo@denyutglobal.my.id',
          'Email Kerja Sama & Sponsorship: partnership@denyutglobal.my.id',
          'Lokasi Operasional: DenyutGlobal Media Labs, Jakarta / DI Yogyakarta, Indonesia'
        ]
      },
      {
        number: 2,
        heading: 'Layanan Pengaduan, Hak Jawab, dan Ralat',
        paragraphs: [
          'Sesuai amanat Undang-Undang Pers No. 40 Tahun 1999 dan Pedoman Pemberitaan Media Siber Dewan Pers, setiap pihak yang merasa dirugikan oleh pemberitaan berhak mengajukan Hak Jawab atau Hak Koreksi.',
          'Permohonan Hak Jawab atau laporan koreksi dapat dikirimkan melalui email redaksi@denyutglobal.my.id dengan mencantumkan subjek "[HAK JAWAB / KOREKSI] - Judul Berita Terkait" disertai bukti atau dokumen pendukung.'
        ],
        callout: {
          type: 'tip',
          title: 'Waktu Respon Redaksi',
          text: 'Tim redaksi kami meninjau setiap email masuk setiap hari kerja (Senin–Jumat pukul 09.00–18.00 WIB). Laporan terkait akurasi faktual dan hak jawab diprioritaskan untuk ditindaklanjuti dalam waktu maksimal 24 jam.'
        }
      },
      {
        number: 3,
        heading: 'Etika Pengiriman Pesan',
        paragraphs: [
          'Kami menyambut baik kritik yang membangun, ralat informasi, maupun tawaran kerja sama. Kami tidak melayani pesan yang mengandung ancaman, ujaran kebencian, pelecehan, pesan spam, atau promosi ilegal.'
        ]
      }
    ]
  },
  'privacy-policy': {
    id: 'privacy-policy',
    path: '/privacy-policy',
    aliases: ['/privasi', '/kebijakan-privasi', '/privacy'],
    title: 'Kebijakan Privasi (Privacy Policy)',
    metaTitle: 'Kebijakan Privasi (Privacy Policy) — DenyutGlobal',
    metaDescription: 'Kebijakan Privasi DenyutGlobal menjelaskan pengelolaan data pengunjung, penggunaan cookie, kepatuhan Google AdSense, dan komitmen keamanan data pengguna.',
    canonicalUrl: 'https://denyutglobal.my.id/privacy-policy',
    categoryBadge: 'Kepatuhan Hukum & Keamanan Data',
    tagline: 'Perlindungan Hak dan Privasi Anda Adalah Prioritas Kami',
    lastUpdated: '6 September 2026',
    summary: 'Dokumen ini menjelaskan bagaimana DenyutGlobal mengumpulkan, menggunakan, mengelola, dan melindungi data pribadi pembaca saat mengakses situs denyutglobal.my.id.',
    sections: [
      {
        number: 1,
        heading: 'Prinsip Privasi Umum',
        paragraphs: [
          'DenyutGlobal menghormati privasi setiap pengunjung. Kami berkomitmen untuk mematuhi ketentuan perundang-undangan perlindungan data pribadi di Indonesia (UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi) serta praktik privasi global terbaik.',
          'Kebijakan ini berlaku untuk seluruh laman dan subdomain yang dikelola langsung di bawah domain denyutglobal.my.id.'
        ]
      },
      {
        number: 2,
        heading: 'Informasi yang Kami Kumpulkan',
        paragraphs: [
          'Kami hanya mengumpulkan informasi yang diperlukan untuk menyajikan dan meningkatkan kualitas layanan berita kami:',
          'A. Informasi yang Diberikan Secara Sukarela: Alamat email yang Anda masukkan saat mendaftar Newsletter atau Daily Brief, serta nama dan pesan yang Anda kirimkan melalui formulir kontak/koreksi.',
          'B. Informasi Teknis Otomatis: Alamat IP, jenis peramban (browser), penyedia layanan internet (ISP), waktu kunjungan, sistem operasi, serta laman rujukan/keluar melalui berkas log standar.'
        ]
      },
      {
        number: 3,
        heading: 'Penggunaan Cookie dan Web Beacon',
        paragraphs: [
          'Seperti portal digital pada umumnya, DenyutGlobal menggunakan "cookies" untuk mencatat preferensi pengunjung, mengoptimalkan kecepatan memuat halaman, serta menganalisis tren akses secara anonim.',
          'Anda dapat menonaktifkan cookie melalui pengaturan peramban masing-masing sewaktu-waktu. Penonaktifan cookie tidak menghalangi Anda untuk membaca artikel berita di portal ini.'
        ]
      },
      {
        number: 4,
        heading: 'Iklan dan Cookie Google AdSense',
        paragraphs: [
          'DenyutGlobal bermitra dengan Google sebagai vendor pihak ketiga untuk menayangkan iklan di situs kami:',
          'Google menggunakan cookie (termasuk Cookie DoubleClick / DART) untuk menayangkan iklan kepada pembaca berdasarkan kunjungan mereka ke situs ini maupun situs lain di internet.',
          'Pengunjung dapat memilih untuk tidak menggunakan cookie DART untuk iklan berbasis minat dengan mengunjungi Kebijakan Privasi Jaringan Iklan dan Konten Google di URL: https://policies.google.com/technologies/ads'
        ],
        callout: {
          type: 'info',
          title: 'Kepatuhan Kebijakan Iklan Google',
          text: 'Kami menegakkan kebijakan konten yang ketat guna memastikan penayangan iklan pihak ketiga tidak mengorbankan kenyamanan membaca dan integritas editorial berita.'
        }
      },
      {
        number: 5,
        heading: 'Layanan Analitik (Google Analytics)',
        paragraphs: [
          'Kami memanfaatkan Google Analytics untuk memahami pola pembacaan agregat. Data ini bersifat anonim dan tidak mengidentifikasi individu secara personal. Kami menerapkan pemblokiran pelacakan analitik pada rute internal operasional redaksi.'
        ]
      },
      {
        number: 6,
        heading: 'Keamanan Data dan Hak Pengguna',
        paragraphs: [
          'Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi pengguna (seperti alamat email langganan) kepada pihak ketiga mana pun untuk tujuan pemasaran komersial.',
          'Setiap pelanggan newsletter memiliki hak penuh untuk berhenti berlangganan (unsubscribe) kapan saja melalui tautan berhenti berlangganan yang tersedia di setiap email, atau melalui tombol di footer situs.'
        ]
      }
    ]
  },
  'ketentuan-layanan': {
    id: 'ketentuan-layanan',
    path: '/ketentuan-layanan',
    aliases: ['/terms', '/syarat-ketentuan', '/ketentuan-penggunaan', '/terms-of-service'],
    title: 'Ketentuan Layanan & Penggunaan',
    metaTitle: 'Ketentuan Layanan & Penggunaan — DenyutGlobal',
    metaDescription: 'Ketentuan layanan dan penggunaan situs web DenyutGlobal, termasuk hak cipta konten, batasan penggunaan materi berita, dan aturan interaksi pengguna.',
    canonicalUrl: 'https://denyutglobal.my.id/ketentuan-layanan',
    categoryBadge: 'Ketentuan Hukum & Hak Cipta',
    tagline: 'Syarat dan Perjanjian Akses Pengunjung Portal Berita',
    lastUpdated: '6 September 2026',
    summary: 'Syarat dan ketentuan yang mengikat setiap individu yang mengakses, membaca, atau menggunakan layanan informasi di DenyutGlobal.',
    sections: [
      {
        number: 1,
        heading: 'Penerimaan Ketentuan',
        paragraphs: [
          'Dengan mengakses dan menggunakan situs denyutglobal.my.id, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat dengan Ketentuan Layanan ini beserta Kebijakan Privasi kami.',
          'Apabila Anda tidak menyetujui sebagian atau seluruh ketentuan ini, Anda dipersilakan untuk tidak melanjutkan penggunaan situs kami.'
        ]
      },
      {
        number: 2,
        heading: 'Hak Kekayaan Intelektual',
        paragraphs: [
          'Seluruh konten yang dipublikasikan di DenyutGlobal—termasuk naskah artikel, struktur ringkasan, ilustrasi tematik SVG, logo, tipografi, dan tata letak—dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia.',
          'Pengunjung diperbolehkan mengutip sebagian artikel untuk keperluan edukasi, referensi, atau ulasan non-komersial, dengan syarat mencantumkan kredit yang jelas: "DenyutGlobal" beserta tautan aktif menuju artikel asli.'
        ],
        bulletPoints: [
          'Dilarang melakukan scraping otomatis atau penggandaan konten massal tanpa izin tertulis dari manajemen DenyutGlobal.',
          'Dilarang memublikasikan ulang seluruh artikel kata demi kata ke platform komersial lain.',
          'Aset foto atau ilustrasi pihak ketiga tetap merupakan hak cipta milik fotografer atau pemegang lisensi aslinya sesuai atribusi yang tertera.'
        ]
      },
      {
        number: 3,
        heading: 'Penggunaan yang Diizinkan',
        paragraphs: [
          'Pengunjung dilarang menggunakan situs ini untuk tindakan yang melanggar hukum, menyebarkan virus/perangkat lunak perusak, melakukan serangan siber (DDoS), atau mengganggu kelancaran server dan jaringan portal.'
        ]
      },
      {
        number: 4,
        heading: 'Tautan Pihak Ketiga',
        paragraphs: [
          'Artikel DenyutGlobal dapat memuat tautan menuju situs eksternal milik pemerintah, lembaga riset, atau kantor berita lain sebagai sumber rujukan. Kami tidak bertanggung jawab atas isi, kebijakan privasi, atau ketersediaan situs-situs eksternal tersebut.'
        ]
      },
      {
        number: 5,
        heading: 'Perubahan Ketentuan',
        paragraphs: [
          'DenyutGlobal berhak memperbarui atau mengubah Ketentuan Layanan ini sewaktu-waktu sesuai dengan perkembangan layanan dan regulasi hukum. Perubahan akan berlaku efektif segera setelah diumumkan di laman ini.'
        ]
      }
    ]
  },
  disclaimer: {
    id: 'disclaimer',
    path: '/disclaimer',
    aliases: ['/penafian'],
    title: 'Disclaimer & Batasan Tanggung Jawab',
    metaTitle: 'Disclaimer & Batasan Tanggung Jawab — DenyutGlobal',
    metaDescription: 'Disclaimer resmi DenyutGlobal mengenai akurasi data, batasan tanggung jawab rujukan, penggunaan asistensi AI berverifikasi, dan konten pihak ketiga.',
    canonicalUrl: 'https://denyutglobal.my.id/disclaimer',
    categoryBadge: 'Pemberitahuan Hukum & Penafian',
    tagline: 'Batasan Tanggung Jawab Informasi dan Rujukan Berita',
    lastUpdated: '6 September 2026',
    summary: 'Pemberitahuan hukum terkait sifat informasi jurnalistik, batasan garansi, dan tanggung jawab pembaca dalam memanfaatkan data dari DenyutGlobal.',
    sections: [
      {
        number: 1,
        heading: 'Sifat Informasi Jurnalistik',
        paragraphs: [
          'Seluruh informasi dan berita yang disajikan di DenyutGlobal diterbitkan untuk tujuan informasi umum dan edukasi publik semata.',
          'Meskipun tim redaksi kami mengerahkan upaya terbaik untuk memastikan kebenaran, validitas, dan kebaruan fakta, DenyutGlobal tidak memberikan jaminan mutlak tanpa syarat bahwa seluruh informasi bebas dari kekeliruan ketik atau keterlambatan data dari sumber primer.'
        ]
      },
      {
        number: 2,
        heading: 'Bukan Nasihat Finansial, Medis, atau Hukum',
        paragraphs: [
          'Artikel mengenai topik ekonomi, pasar modal, energi, kesehatan, atau hukum disajikan dalam konteks pelaporan berita.',
          'Konten tersebut BUKAN merupakan saran investasi profesional, nasihat keuangan, konsultasi medis, ataupun opini hukum yang mengikat. Setiap keputusan finansial atau tindakan pribadi yang diambil pembaca berdasarkan informasi di situs ini merupakan tanggung jawab penuh masing-masing individu.'
        ],
        callout: {
          type: 'warning',
          title: 'Konsultasi Profesional',
          text: 'Kami sangat menyarankan pembaca berkonsultasi dengan penasihat keuangan, dokter, atau pakar hukum bersertifikasi sebelum mengambil keputusan signifikan.'
        }
      },
      {
        number: 3,
        heading: 'Transparansi Penggunaan Asistensi AI',
        paragraphs: [
          'DenyutGlobal memanfaatkan teknologi kecerdasan buatan (Artificial Intelligence) modern sebagai alat bantu percepatan drafting, sintesis ringkasan multibahasa, dan pembuatan ilustrasi visual tematik.',
          'Namun demikian, redaksi menegaskan prinsip "Human-in-the-Loop": setiap artikel yang diterbitkan wajib melalui verifikasi, pengeditan, dan persetujuan akhir oleh editor manusia profesional. Kami tidak menayangkan artikel otomatis tanpa pengawasan redaksional.'
        ]
      },
      {
        number: 4,
        heading: 'Batasan Kerugian',
        paragraphs: [
          'Dalam batas yang diizinkan oleh hukum yang berlaku di Indonesia, DenyutGlobal beserta awak redaksi tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan informasi di portal ini.'
        ]
      }
    ]
  },
  'pedoman-redaksi': {
    id: 'pedoman-redaksi',
    path: '/pedoman-redaksi',
    aliases: ['/pedoman', '/standar-redaksi', '/editorial-policy'],
    title: 'Pedoman Redaksi DenyutGlobal',
    metaTitle: 'Pedoman Redaksi & Standar Jurnalistik — DenyutGlobal',
    metaDescription: '13 Butir Standar Pedoman Redaksi DenyutGlobal dalam menyusun, memeriksa, memverifikasi independensi, dan menyajikan berita dunia dan nasional.',
    canonicalUrl: 'https://denyutglobal.my.id/pedoman-redaksi',
    categoryBadge: 'Standar & Etika Jurnalistik',
    tagline: '13 Butir Standar Pemeriksaan dan Mutu Pemberitaan',
    lastUpdated: '6 September 2026',
    summary: 'Pedoman kerja komprehensif bagi seluruh jurnalis dan editor DenyutGlobal dalam meliput, menulis, memvalidasi sumber, dan memublikasikan berita.',
    sections: [
      {
        number: 1,
        heading: 'Prinsip Redaksi & Independensi',
        paragraphs: [
          'DenyutGlobal berkomitmen menyajikan berita yang jelas, akurat, berimbang, dan mudah dipahami masyarakat luas.',
          'Redaksi kami beroperasi secara independen, bebas dari tekanan politik, kepentingan kelompok, maupun intervensi pemilik modal yang bertentangan dengan kebenaran publik.'
        ]
      },
      {
        number: 2,
        heading: 'Akurasi dan Verifikasi Ketat',
        paragraphs: [
          'Fakta utama—mencakup nama tokoh, jabatan, instansi, tanggal peristiwa, lokasi geografis, angka statistik, dan kutipan langsung—wajib diverifikasi ke sumber resmi yang dapat dipertanggungjawabkan sebelum tayang.',
          'Jika suatu klaim belum dapat diverifikasi secara independen, redaksi wajib mencantumkan status "belum dapat dikonfirmasi" atau "menurut klaim sepihak" secara eksplisit.'
        ]
      },
      {
        number: 3,
        heading: 'Penggunaan Kecerdasan Buatan (AI) yang Bertanggung Jawab',
        paragraphs: [
          'Teknologi AI hanya difungsikan sebagai alat bantu teknis (analisis data besar, ekstraksi fakta, dan penyusunan draf awal).',
          'Tanggung jawab kebenaran artikel berada 100% di tangan editor manusia. AI dilarang mengarang fakta (halusinasi data) atau menulis opini subjektif yang mengatasnamakan redaksi.'
        ]
      },
      {
        number: 4,
        heading: 'Keberimbangan dan Asas Praduga Tak Bersalah',
        paragraphs: [
          'Dalam berita yang memuat konflik, sengketa, atau dugaan pelanggaran hukum, redaksi wajib mengupayakan konfirmasi dari semua pihak yang bersangkutan (cover both sides).',
          'Identitas korban kejahatan asusila, anak di bawah umur yang berhadapan dengan hukum, dan saksi rentan wajib dirahasiakan sesuai kode etik jurnalistik.'
        ]
      },
      {
        number: 5,
        heading: 'Penulisan Judul yang Jujur (Bebas Clickbait)',
        paragraphs: [
          'Judul berita DenyutGlobal harus mencerminkan substansi isi berita secara akurat.',
          'Kami menolak penggunaan judul yang memutarbalikkan fakta, membesar-besarkan konteks secara keliru, atau memanfaatkan umpan klik (clickbait) murahan yang memperdaya pembaca.'
        ]
      },
      {
        number: 6,
        heading: 'Konteks dan "Mengapa Ini Penting"',
        paragraphs: [
          'Setiap berita mendalam wajib dilengkapi dengan konteks latar belakang dan uraian relevansi agar pembaca memahami implikasi peristiwa tersebut terhadap perekonomian, geopolitik, atau kehidupan sehari-hari.'
        ]
      },
      {
        number: 7,
        heading: 'Pemberian Sumber Rujukan (Atribusi)',
        paragraphs: [
          'Kami selalu menyebutkan asal-usul data dan kantor berita rujukan (seperti Reuters, AP, AFP, Antara, BMKG, NASA, dll.) sebagai bentuk transparansi dan penghormatan atas kerja jurnalistik.'
        ]
      },
      {
        number: 8,
        heading: 'Pemisahan Berita dan Iklan (Advertorial)',
        paragraphs: [
          'Setiap konten bersponsor, kemitraan berbayar, atau advertorial wajib dilabeli dengan tanda yang jelas ("Advertorial" atau "Sponsor") agar pembaca dapat membedakannya dengan produk jurnalistik murni.'
        ]
      },
      {
        number: 9,
        heading: 'Kepatuhan pada UU Pers dan Kode Etik',
        paragraphs: [
          'Pedoman redaksi ini tunduk dan patuh pada Kode Etik Jurnalistik (KEJ) yang disahkan oleh Dewan Pers serta Undang-Undang Republik Indonesia Nomor 40 Tahun 1999 tentang Pers.'
        ]
      }
    ]
  },
  'pedoman-media-siber': {
    id: 'pedoman-media-siber',
    path: '/pedoman-media-siber',
    aliases: ['/pedoman-pemberitaan-media-siber', '/media-siber', '/pedoman-siber'],
    title: 'Pedoman Pemberitaan Media Siber',
    metaTitle: 'Pedoman Pemberitaan Media Siber — DenyutGlobal',
    metaDescription: 'Pedoman Pemberitaan Media Siber DenyutGlobal yang merujuk pada standar resmi Dewan Pers untuk verifikasi, ralat, hak jawab, dan etika siber.',
    canonicalUrl: 'https://denyutglobal.my.id/pedoman-media-siber',
    categoryBadge: 'Standar Resmi Dewan Pers Indonesia',
    tagline: 'Kepatuhan terhadap Peraturan Dewan Pers No. 1/Peraturan-DP/III/2012',
    lastUpdated: '6 September 2026',
    summary: 'Pemberlakuan standar operasional baku pemberitaan media siber berdasarkan Pedoman Pemberitaan Media Siber yang ditetapkan oleh Dewan Pers Republik Indonesia.',
    sections: [
      {
        number: 1,
        heading: 'Dasar Pemberlakuan & Atribusi Resmi',
        paragraphs: [
          'Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi oleh Pancasila, Undang-Undang Dasar 1945, serta Deklarasi Universal Hak Asasi Manusia PBB.',
          'Sebagai media siber yang beroperasi di Indonesia, DenyutGlobal mengadopsi dan menerapkan secara penuh Pedoman Pemberitaan Media Siber yang ditandatangani oleh Dewan Pers bersama komunitas pers nasional di Jakarta pada tanggal 3 Februari 2012 (Peraturan Dewan Pers Nomor: 1/Peraturan-DP/III/2012).'
        ],
        callout: {
          type: 'info',
          title: 'Atribusi Dokumen Dewan Pers',
          text: 'Poin-poin di bawah ini disusun mengacu langsung pada naskah resmi Pedoman Pemberitaan Media Siber Dewan Pers Indonesia guna memastikan transparansi operasional ruang siber kami.'
        }
      },
      {
        number: 2,
        heading: 'Ruang Lingkup Media Siber',
        paragraphs: [
          'Media Siber adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pokok Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers.',
          'Pedoman ini berlaku untuk seluruh produk jurnalistik yang diterbitkan di portal DenyutGlobal, termasuk teks berita, infografis data, transkrip, dan materi audio-visual.'
        ]
      },
      {
        number: 3,
        heading: 'Verifikasi dan Keberimbangan Berita',
        paragraphs: [
          'A. Pada prinsipnya setiap berita harus melalui proses verifikasi terlebih dahulu sebelum dipublikasikan.',
          'B. Berita yang berpotensi merugikan pihak lain memerlukan verifikasi pada berita yang sama atau pada kesempatan pertama guna memenuhi prinsip proporsionalitas dan keberimbangan.',
          'C. Dalam hal verifikasi mendesak dan kepentingan publik yang luar biasa belum memungkinkan konfirmasi seketika, berita dapat disiarkan dengan syarat ketat:',
          '1) Mengandung kepentingan publik yang sangat mendesak.',
          '2) Sumber berita pertama adalah sumber yang jelas disebutkan identitasnya, kredibel, dan kompeten.',
          '3) Subjek berita yang harus dikonfirmasi belum dapat dihubungi atau belum bersedia memberikan tanggapan.',
          '4) Redaksi mencantumkan penjelasan eksplisit bahwa upaya konfirmasi masih terus dilakukan.',
          '5) Setelah konfirmasi diperoleh, keterangan tersebut dimuat pada pembaruan berita berikutnya dengan menautkan berita pertama.'
        ]
      },
      {
        number: 4,
        heading: 'Isi Buatan Pengguna (User Generated Content)',
        paragraphs: [
          'DenyutGlobal membatasi interaksi pembaca dan mewajibkan kepatuhan terhadap aturan bila menyediakan ruang interaktif:',
          'A. Media siber wajib mencantumkan syarat dan ketentuan mengenai isi buatan pengguna yang tidak bertentangan dengan hukum dan etika pers.',
          'B. Media siber mewajibkan pengguna melakukan registrasi identitas yang sah sebelum mengirimkan komentar atau tanggapan.',
          'C. Media siber wajib menyediakan mekanisme pengaduan isi buatan pengguna yang dinilai melanggar hukum.',
          'D. Media siber wajib menyunting, menghapus, dan melakukan tindakan koreksi terhadap isi buatan pengguna yang dilaporkan dan melanggar hukum selambat-lambatnya 2 x 24 jam setelah pengaduan diterima.'
        ]
      },
      {
        number: 5,
        heading: 'Ralat, Koreksi, dan Hak Jawab',
        paragraphs: [
          'A. Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers.',
          'B. Ralat, koreksi, dan/atau hak jawab wajib ditautkan pada berita yang bersangkutan.',
          'C. Pada setiap berita yang diralat, dikoreksi, atau diberi hak jawab, redaksi wajib mencantumkan waktu pemuatan ralat/koreksi/hak jawab tersebut secara jelas dan transparan.'
        ]
      },
      {
        number: 6,
        heading: 'Pencabutan Berita',
        paragraphs: [
          'A. Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak, pengalaman traumatik korban, atau pertimbangan khusus lain yang ditetapkan Dewan Pers.',
          'B. Pencabutan berita wajib disertai dengan penjelasan alasan pencabutan dan diumumkan secara terbuka kepada publik.'
        ]
      },
      {
        number: 7,
        heading: 'Praktik Tautan (Hyperlink)',
        paragraphs: [
          'A. Media siber yang memuat tautan ke situs lain wajib memastikan tautan tersebut tidak mengarah ke konten yang memuat materi pornografi, perjudian, ujaran kebencian berunsur SARA, atau konten ilegal lainnya.',
          'B. Pemuatan tautan tidak serta merta mencerminkan dukungan redaksi terhadap seluruh pandangan pada situs eksternal tersebut.'
        ]
      },
      {
        number: 8,
        heading: 'Penyelesaian Sengketa Pemberitaan',
        paragraphs: [
          'Penilaian akhir atas sengketa pelaksanaan etika jurnalistik dan kepatuhan terhadap Pedoman Pemberitaan Media Siber ini diselesaikan melalui mekanisme resmi Dewan Pers Republik Indonesia.'
        ]
      }
    ]
  },
  'kebijakan-koreksi': {
    id: 'kebijakan-koreksi',
    path: '/kebijakan-koreksi',
    aliases: ['/koreksi', '/ralat', '/hak-jawab', '/laporkan-koreksi'],
    title: 'Kebijakan Koreksi, Ralat & Hak Jawab',
    metaTitle: 'Kebijakan Koreksi, Ralat & Hak Jawab — DenyutGlobal',
    metaDescription: 'Prosedur dan kebijakan koreksi fakta, ralat editorial, dan fasilitasi hak jawab pembaca secara transparan di portal berita DenyutGlobal.',
    canonicalUrl: 'https://denyutglobal.my.id/kebijakan-koreksi',
    categoryBadge: 'Transparansi & Akurasi Redaksi',
    tagline: 'Komitmen Memperbaiki Kesalahan Secara Cepat dan Terbuka',
    lastUpdated: '6 September 2026',
    summary: 'Standar operasional penanganan kekeliruan data, ralat nama/angka, pembaruan informasi berlanjut, dan pemenuhan Hak Jawab publik.',
    sections: [
      {
        number: 1,
        heading: 'Komitmen terhadap Akurasi & Transparansi',
        paragraphs: [
          'DenyutGlobal bertekad menyajikan fakta dengan tingkat ketelitian setinggi mungkin. Namun, dalam dinamika pelaporan berita yang bergerak cepat, kekeliruan informasi dapat terjadi.',
          'Ketika terjadi kesalahan faktual, kami tidak menutup-nutupinya. Redaksi kami berkomitmen untuk segera memperbaikinya secara transparan, jelas, dan bertanggung jawab.'
        ]
      },
      {
        number: 2,
        heading: 'Tiga Kategori Perubahan Artikel',
        paragraphs: [
          'DenyutGlobal membedakan secara tegas tiga jenis perubahan pada artikel yang telah terbit:'
        ],
        bulletPoints: [
          'Koreksi (Correction): Perbaikan terhadap informasi penting atau data faktual yang terbukti keliru setelah penerbitan (misal: nama tokoh, data statistik korban, kutipan, atau lokasi). Koreksi selalu ditandai dengan kotak catatan ralat di artikel.',
          'Pembaruan (Update): Penambahan perkembangan informasi terbaru pada peristiwa yang masih berlangsung (developing story). Artikel ditandai dengan keterangan waktu update terkini.',
          'Perbaikan Redaksional (Clarification/Fix): Perbaikan teknis penulisan, saltik (typo), ejaan bahasa Indonesia, atau format tampilan yang tidak mengubah arti substansial dari berita.'
        ]
      },
      {
        number: 3,
        heading: 'Penempatan Catatan Koreksi',
        paragraphs: [
          'Setiap artikel yang mengalami koreksi faktual akan memuat catatan koreksi (Correction Note) yang ditempatkan di bagian bawah atau atas artikel.',
          'Catatan tersebut menjelaskan: bagian mana yang sebelumnya keliru, apa perbaikan yang dilakukan, serta tanggal dan jam ralat tersebut disematkan.'
        ]
      },
      {
        number: 4,
        heading: 'Cara Mengajukan Koreksi atau Hak Jawab',
        paragraphs: [
          'Jika Anda menemukan data yang tidak tepat atau merasa menjadi subjek berita yang dirugikan, Anda dapat mengajukan laporan melalui:'
        ],
        bulletPoints: [
          'Email Redaksi: redaksi@denyutglobal.my.id',
          'Subjek: [PERMOHONAN KOREKSI / HAK JAWAB] - Judul Artikel',
          'Sertakan URL artikel yang bersangkutan, bukti data yang sahih, serta kontak pelapor yang dapat dihubungi.'
        ],
        callout: {
          type: 'tip',
          title: 'Kecepatan Tindak Lanjut',
          text: 'Laporan koreksi fakta darurat ditinjau oleh Editor Senior dalam waktu 1–4 jam sejak laporan diverifikasi keabsahannya.'
        }
      }
    ]
  }
};

/**
 * Normalizes a URL path for lookup against legal document routes.
 */
export function normalizeLegalPath(rawPath: string): string {
  if (!rawPath) return '';
  const clean = rawPath.split('?')[0].split('#')[0].trim().toLowerCase();
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
}

/**
 * Checks if a given path corresponds to one of the 8 canonical legal documents or their aliases.
 */
export function getLegalDocumentByPath(rawPath: string): LegalDocument | null {
  const clean = normalizeLegalPath(rawPath);
  if (!clean) return null;

  for (const doc of Object.values(LEGAL_DOCUMENTS)) {
    if (doc.path === clean) return doc;
    if (doc.aliases && doc.aliases.includes(clean)) return doc;
  }
  return null;
}

/**
 * Checks if a path is a known legal route.
 */
export function isLegalPath(rawPath: string): boolean {
  return getLegalDocumentByPath(rawPath) !== null;
}

/**
 * Resolves 301 permanent redirect destination for legacy aliases.
 * Returns null if the path is already the canonical path or not a legal route.
 */
export function getLegalRedirectDestination(rawPath: string): string | null {
  const clean = normalizeLegalPath(rawPath);
  if (!clean) return null;

  for (const doc of Object.values(LEGAL_DOCUMENTS)) {
    if (doc.aliases && doc.aliases.includes(clean) && clean !== doc.path) {
      return doc.path;
    }
  }
  return null;
}
