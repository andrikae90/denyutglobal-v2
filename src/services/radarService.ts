import { RadarNewsItem, RadarCategoryKey, RadarStatus, NewsItem } from '../types';
import { INITIAL_RADAR_ITEMS, RADAR_CATEGORIES_CONFIG } from '../data/radarPrimarySources';
import { runRadar9PointVerification } from '../utils/radarVerification';

class RadarService {
  private customRadarItems: RadarNewsItem[] = [];

  constructor() {
    this.loadPersistedRadarItems();
  }

  private loadPersistedRadarItems() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('denyutglobal_radar_items_v2');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.customRadarItems = parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Could not load stored radar items:', e);
    }
  }

  private persistRadarItems() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('denyutglobal_radar_items_v2', JSON.stringify(this.customRadarItems));
      }
    } catch (e) {
      console.warn('Could not persist radar items:', e);
    }
  }

  /**
   * Fetches all Radar items: Curated Primary Sources + Live BMKG + Wire Feeds transformed to Radar Topics
   */
  public async getRadarItems(wireFeeds: NewsItem[] = []): Promise<RadarNewsItem[]> {
    const combined: RadarNewsItem[] = [...this.customRadarItems, ...INITIAL_RADAR_ITEMS];

    // Try fetching live BMKG AutoGempa primary API if available
    try {
      const bmkgRes = await fetch('https://data.bmkg.go.id/DataMKG/TEKTONIK/autogempa.json', { cache: 'no-store' });
      if (bmkgRes.ok) {
        const bmkgData = await bmkgRes.json();
        const gempa = bmkgData?.Infogempa?.gempa;
        if (gempa && gempa.Magnitude) {
          const bmkgItem: RadarNewsItem = {
            id: `bmkg-live-${gempa.DateTime || gempa.Jam}`,
            kategoriRadar: 'bencana_kedaruratan',
            kategoriLabel: 'Bencana & Kedaruratan',
            judulTopik: `BMKG: Gempa Tektonik Magnitudo ${gempa.Magnitude} Terjadi di Wilayah ${gempa.Wilayah}`,
            namaSumber: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
            jenisSumber: 'primer',
            lembagaKategori: 'BMKG Indonesia (InaTEWS)',
            waktu: `${gempa.Tanggal || 'Hari ini'} • ${gempa.Jam || ''}`,
            lokasi: gempa.Wilayah || 'Wilayah Indonesia',
            faktaUtama: [
              `Parameter magnitudo gempa bumi: M ${gempa.Magnitude}.`,
              `Kedalaman pusat gempa tercatat ${gempa.Kedalaman} pada koordinat ${gempa.Coordinates} (${gempa.Lintang}, ${gempa.Bujur}).`,
              `Pusat gempa berjarak ${gempa.Wilayah}.`,
              `Status potensi tsunami: ${gempa.Potensi || 'Tidak berpotensi tsunami'}.`,
              `Tingkat intensitas guncangan dirasakan: ${gempa.Dirasakan || 'Dalam evaluasi sensor BMKG'}.`
            ],
            urlSumber: 'https://data.bmkg.go.id/DataMKG/TEKTONIK/autogempa.json',
            status: 'sumber_primer_terkonfirmasi',
            keteranganStatus: 'Rilis real-time sensor seismograf InaTEWS BMKG Pusat.'
          };

          // Check if already in list
          const existingIdx = combined.findIndex(i => i.id === bmkgItem.id || i.id === 'radar-bmkg-gempa');
          if (existingIdx >= 0) {
            combined[existingIdx] = bmkgItem;
          } else {
            combined.unshift(bmkgItem);
          }
        }
      }
    } catch (bmkgErr) {
      // Offline or CORS fallback to deterministic BMKG primary item
    }

    // Convert Wire Feeds (Antara, BBC, DW) to Radar Secondary Cross-Check items
    if (Array.isArray(wireFeeds) && wireFeeds.length > 0) {
      wireFeeds.forEach(feed => {
        const wireId = `radar-wire-${feed.id}`;
        if (!combined.some(i => i.id === wireId)) {
          // Map to appropriate category
          const categoryKey = this.mapFeedToRadarCategory(feed);
          const config = RADAR_CATEGORIES_CONFIG.find(c => c.key === categoryKey) || RADAR_CATEGORIES_CONFIG[11];
          
          const radarWireItem: RadarNewsItem = {
            id: wireId,
            kategoriRadar: categoryKey,
            kategoriLabel: config.name,
            judulTopik: feed.judul || feed.title || 'Topik Terdeteksi Radar',
            namaSumber: feed.namaSumber || 'Media Sekunder (Feed Kawat)',
            jenisSumber: 'sekunder',
            lembagaKategori: `${feed.namaSumber || 'Media Sekunder'} (Radar Topik)`,
            waktu: `${feed.tanggal || 'Terkini'} • ${feed.waktu || ''}`,
            lokasi: feed.negaraLokasi || feed.location || 'Tidak disebutkan dalam sumber',
            faktaUtama: Array.isArray(feed.facts) && feed.facts.length > 0
              ? feed.facts
              : [
                  feed.ringkasan || 'Topik terdeteksi dari pemantauan kawat berita sekunder.',
                  'Status: Merupakan bahan radar sekunder. Wajib melakukan verifikasi dan konfirmasi sumber primer sebelum dijadikan naskah final.'
                ],
            urlSumber: feed.urlSumber || '',
            status: 'perlu_verifikasi',
            keteranganStatus: 'SUMBER SEKUNDER — Gunakan sebagai radar topik dan lakukan verifikasi konfirmasi primer.'
          };

          combined.push(radarWireItem);
        }
      });
    }

    // Run verification on each item if not yet verified
    return combined.map(item => {
      if (!item.verificationResult) {
        item.verificationResult = runRadar9PointVerification(item);
        item.isVerified = item.verificationResult.verdict === 'terverifikasi';
      }
      return item;
    });
  }

  /**
   * Adds or updates a custom Radar topic (e.g. newly discovered primary press release)
   */
  public addRadarItem(item: RadarNewsItem): RadarNewsItem {
    const verification = runRadar9PointVerification(item);
    const enriched: RadarNewsItem = {
      ...item,
      verificationResult: verification,
      isVerified: verification.verdict === 'terverifikasi'
    };

    const existingIndex = this.customRadarItems.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      this.customRadarItems[existingIndex] = enriched;
    } else {
      this.customRadarItems.unshift(enriched);
    }
    this.persistRadarItems();
    return enriched;
  }

  public addCustomRadarItem(item: RadarNewsItem): RadarNewsItem {
    return this.addRadarItem(item);
  }

  /**
   * Attaches primary source confirmation to a secondary radar topic
   */
  public attachPrimaryConfirmation(radarId: string, confirmation: {
    namaLembaga: string;
    urlKonfirmasi: string;
    dokumenResmi?: string;
  }): RadarNewsItem | null {
    // Find item
    const item = INITIAL_RADAR_ITEMS.find(i => i.id === radarId) || this.customRadarItems.find(i => i.id === radarId);
    if (!item) return null;

    const updated: RadarNewsItem = {
      ...item,
      status: 'sumber_primer_konteks',
      konfirmasiPrimer: {
        ada: true,
        namaLembaga: confirmation.namaLembaga,
        urlKonfirmasi: confirmation.urlKonfirmasi,
        dokumenResmi: confirmation.dokumenResmi
      },
      keteranganStatus: `SUMBER PRIMER + KONTEKS — Telah dikonfirmasi dengan rilis primer ${confirmation.namaLembaga}.`
    };

    updated.verificationResult = runRadar9PointVerification(updated);
    updated.isVerified = true;

    this.addRadarItem(updated);
    return updated;
  }

  public confirmPrimarySource(radarId: string, confirmation: {
    namaLembaga: string;
    urlKonfirmasi: string;
    dokumenResmi?: string;
  }): RadarNewsItem | null {
    return this.attachPrimaryConfirmation(radarId, confirmation);
  }

  /**
   * Map generic news items to specific Indonesian Radar Categories
   */
  private mapFeedToRadarCategory(item: NewsItem): RadarCategoryKey {
    const text = `${item.judul || ''} ${item.ringkasan || ''} ${(item.isiLengkap || []).join(' ')}`.toLowerCase();

    if (text.includes('polisi') || text.includes('polri') || text.includes('polda') || text.includes('polres') || text.includes('penangkapan') || text.includes('tersangka') || text.includes('satgas') || text.includes('penyelundupan')) {
      return 'kriminal_keamanan';
    }
    if (text.includes('kpk') || text.includes('kejaksaan') || text.includes('mahkamah') || text.includes('pengadilan') || text.includes('korupsi') || text.includes('sidang') || text.includes('vonis') || text.includes('hakim')) {
      return 'hukum_pengadilan';
    }
    if (text.includes('gempa') || text.includes('erupsi') || text.includes('gunung api') || text.includes('bnpb') || text.includes('bmkg') || text.includes('banjir') || text.includes('longsor') || text.includes('basarnas') || text.includes('tsunami')) {
      return 'bencana_kedaruratan';
    }
    if (text.includes('kemenkes') || text.includes('bpom') || text.includes('vaksin') || text.includes('obat') || text.includes('kesehatan') || text.includes('wabah') || text.includes('who') || text.includes('rumah sakit')) {
      return 'kesehatan';
    }
    if (text.includes('bi ') || text.includes('bank indonesia') || text.includes('bps') || text.includes('ojk') || text.includes('kemenkeu') || text.includes('inflasi') || text.includes('rupiah') || text.includes('cadangan devisa') || text.includes('suku bunga') || text.includes('apbn') || text.includes('ihsg')) {
      return 'ekonomi_keuangan';
    }
    if (text.includes('esdm') || text.includes('pln') || text.includes('pertamina') || text.includes('bbm') || text.includes('listrik') || text.includes('migas') || text.includes('tambang') || text.includes('ebt') || text.includes('solar')) {
      return 'energi_sumberdaya';
    }
    if (text.includes('presiden') || text.includes('istana') || text.includes('setneg') || text.includes('perpres') || text.includes('menteri') || text.includes('pemda') || text.includes('pemprov') || text.includes('kebijakan')) {
      return 'pemerintah_kenegaraan';
    }
    if (text.includes('klhk') || text.includes('hutan') || text.includes('karhutla') || text.includes('iklim') || text.includes('polusi') || text.includes('ispu') || text.includes('konservasi') || text.includes('sampah')) {
      return 'lingkungan';
    }
    if (text.includes('brin') || text.includes('riset') || text.includes('sains') || text.includes('teknologi') || text.includes('ai') || text.includes('kecerdasan buatan') || text.includes('semikonduktor') || text.includes('astronomi')) {
      return 'teknologi_sains';
    }
    if (text.includes('pssi') || text.includes('pbsi') || text.includes('kemenpora') || text.includes('olahraga') || text.includes('timnas') || text.includes('liga') || text.includes('kejuaraan') || text.includes('medali')) {
      return 'olahraga';
    }
    if (text.includes('artis') || text.includes('konser') || text.includes('film') || text.includes('musik') || text.includes('aktor') || text.includes('aktris') || text.includes('penyanyi') || text.includes('album')) {
      return 'artis_hiburan';
    }

    return 'dunia';
  }
}

export const radarService = new RadarService();
