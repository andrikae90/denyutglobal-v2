import React, { useState, useEffect, useCallback } from 'react';
import { 
  NewsItem, 
  CategoryId, 
  ArticleStatus, 
  ArticleSource, 
  FactCheckResult, 
  FactCheckClaim, 
  CorrectionType,
  RadarNewsItem,
  RadarCategoryKey,
  RadarStatus,
  ArticleRevisionResult
} from '../types';
import { CATEGORIES } from '../data/categories';
import { slugify } from '../utils/slug';
import { buildCompleteDraftFromReference, buildDraftFromRadarItem, validateDraftForReview } from '../utils/referenceAutoDraft';
import { generateThematicSvgIllustration } from '../utils/aiIllustrationGenerator';
import { radarService } from '../services/radarService';
import { RadarBeritaView } from './RadarBeritaView';
import { RadarVerificationModal } from './RadarVerificationModal';
import { AddPrimaryTopicModal } from './AddPrimaryTopicModal';
import { ArticleRevisionPanel } from './ArticleRevisionPanel';
import { 
  X, 
  Sparkles, 
  Save, 
  Send, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  FileText, 
  ListFilter, 
  Radio, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Info,
  PenTool,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  HelpCircle,
  SearchCheck,
  AlertCircle,
  Lock,
  Loader2,
  Undo2,
  Check,
  MessageSquareQuote,
  Flame,
  BadgeAlert,
  Image as ImageIcon,
  Palette,
  Copy,
  CheckCheck,
  Camera,
  Upload,
  Link2
} from 'lucide-react';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsItem[];
  onSaveArticle: (article: NewsItem) => void;
  onDeleteArticle?: (id: string) => void;
  referenceFeeds: NewsItem[];
  onSelectArticlePreview?: (article: NewsItem) => void;
  onLogout?: () => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSaveArticle,
  onDeleteArticle,
  referenceFeeds,
  onSelectArticlePreview,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'wire' | 'factcheck'>('form');
  const [listFilter, setListFilter] = useState<'all' | 'draft' | 'review' | 'approved' | 'published'>('all');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<CategoryId, 'semua'>>('dunia');
  const [location, setLocation] = useState('');
  const [author, setAuthor] = useState('Redaksi DenyutGlobal');
  const [facts, setFacts] = useState('');
  const [roughNotes, setRoughNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [captionGambar, setCaptionGambar] = useState('');
  const [imageType, setImageType] = useState<'ai_illustration' | 'photo' | 'none' | string>('none');
  const [imageCredit, setImageCredit] = useState<string>('');
  const [isGeneratingIllustration, setIsGeneratingIllustration] = useState(false);
  const [illustrationMessage, setIllustrationMessage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isConfirmReplacePhotoOpen, setIsConfirmReplacePhotoOpen] = useState(false);
  const [isCopiedFactCheck, setIsCopiedFactCheck] = useState(false);
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [editorialRevisionNotes, setEditorialRevisionNotes] = useState<string>('');
  const [sources, setSources] = useState<ArticleSource[]>([
    { name: '', url: '', date: '', notes: '' }
  ]);
  const [correctionStatus, setCorrectionStatus] = useState<CorrectionType>('none');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [isHero, setIsHero] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDailyBrief, setIsDailyBrief] = useState(false);

  // AI Assistance and Fact-Checking State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isProcessingWireId, setIsProcessingWireId] = useState<string | null>(null);
  const [isFactChecking, setIsFactChecking] = useState(false);
  const [isAiGeneratedDraft, setIsAiGeneratedDraft] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);
  const [factCheckWarning, setFactCheckWarning] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [draftReadyBanner, setDraftReadyBanner] = useState<{
    title: string;
    sourceName: string;
    isDuplicate?: boolean;
    duplicateMsg?: string;
  } | null>(null);

  // Radar Berita Sumber Primer State
  const [radarItems, setRadarItems] = useState<RadarNewsItem[]>([]);
  const [isLoadingRadar, setIsLoadingRadar] = useState(false);
  const [selectedVerificationItem, setSelectedVerificationItem] = useState<RadarNewsItem | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isAddPrimaryModalOpen, setIsAddPrimaryModalOpen] = useState(false);
  const [processingRadarDraftId, setProcessingRadarDraftId] = useState<string | null>(null);

  // Load Radar Items
  const loadRadarItems = useCallback(async () => {
    setIsLoadingRadar(true);
    try {
      const items = await radarService.getRadarItems(referenceFeeds);
      setRadarItems(items);
    } catch (e) {
      console.warn('Failed to load radar items:', e);
    } finally {
      setIsLoadingRadar(false);
    }
  }, [referenceFeeds]);

  useEffect(() => {
    if (isOpen) {
      loadRadarItems();
    }
  }, [isOpen, loadRadarItems]);

  // Revert Review to Draft Confirmation State
  const [isRevertConfirmOpen, setIsRevertConfirmOpen] = useState(false);
  const [revertTargetArticle, setRevertTargetArticle] = useState<NewsItem | null>(null);

  // Revision Needed Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionTargetArticle, setRevisionTargetArticle] = useState<NewsItem | null>(null);
  const [revisionNoteInput, setRevisionNoteInput] = useState('');

  // SEO: Set robots to noindex, nofollow when EditorModal is open so Ruang Redaksi is never indexed by search engines
  useEffect(() => {
    if (!isOpen) return;

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let createdRobotsMeta = false;

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
      createdRobotsMeta = true;
    }

    const previousRobotsContent = robotsMeta.getAttribute('content');
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (createdRobotsMeta && robotsMeta && robotsMeta.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta);
      } else if (robotsMeta) {
        if (previousRobotsContent !== null) {
          robotsMeta.setAttribute('content', previousRobotsContent);
        } else {
          robotsMeta.removeAttribute('content');
        }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('dunia');
    setLocation('');
    setAuthor('Redaksi DenyutGlobal');
    setFacts('');
    setRoughNotes('');
    setSummary('');
    setWhyItMatters('');
    setContent('');
    setImage('');
    setCaptionGambar('');
    setImageType('none');
    setImageCredit('');
    setIllustrationMessage(null);
    setStatus('draft');
    setEditorialRevisionNotes('');
    setSources([{ name: '', url: '', date: '', notes: '' }]);
    setCorrectionStatus('none');
    setCorrectionNotes('');
    setIsHero(false);
    setIsFeatured(false);
    setIsDailyBrief(false);
    setIsAiGeneratedDraft(false);
    setFactCheckResult(null);
    setFactCheckWarning(null);
    setFormError(null);
    setFormSuccess(null);
    setAiNotice(null);
  };

  const loadArticleIntoForm = (article: NewsItem) => {
    setEditingId(article.id);
    setTitle(article.title || article.judul || '');
    setCategory((article.category || article.kategori || 'dunia') as Exclude<CategoryId, 'semua'>);
    setLocation(article.location || article.negaraLokasi || '');
    setAuthor(article.author || 'Redaksi DenyutGlobal');
    setFacts(article.facts ? article.facts.join('\n') : '');
    setRoughNotes('');
    setSummary(article.summary || article.ringkasan || '');
    setWhyItMatters(article.whyItMatters || '');
    setContent(
      Array.isArray(article.content || article.isiLengkap) 
        ? (article.content || article.isiLengkap)!.join('\n\n') 
        : ''
    );
    setImage(article.image || article.gambar || '');
    setCaptionGambar(article.captionGambar || '');
    setImageType(article.imageType || (article.image?.startsWith('data:') ? 'ai_illustration' : article.image ? 'photo' : 'none'));
    setImageCredit(article.imageCredit || (article.imageType === 'ai_illustration' ? 'Ilustrasi AI — DenyutGlobal' : ''));
    setIllustrationMessage(null);
    setStatus(article.status || 'draft');
    setEditorialRevisionNotes(article.editorialRevisionNotes || '');
    setSources(
      article.sources && article.sources.length > 0 
        ? article.sources 
        : [{ name: article.namaSumber || '', url: article.urlSumber || '', date: article.tanggal || '', notes: '' }]
    );
    setCorrectionStatus(article.correctionStatus || (article.correctionNotes || article.correctionNote ? 'corrected' : 'none'));
    setCorrectionNotes(article.correctionNote || article.correctionNotes || '');
    setIsHero(!!article.isHero);
    setIsFeatured(!!article.isFeatured);
    setIsDailyBrief(!!article.isDailyBrief);
    setIsAiGeneratedDraft(!!article.isAiGeneratedDraft);
    setFactCheckResult(article.factCheckResult || null);
    setFactCheckWarning(null);
    setActiveTab('form');
    setFormError(null);
    setFormSuccess(`Memuat naskah "${article.title || article.judul}" untuk ditinjau.`);
  };

  const useReferenceAsDraft = async (wireItem: NewsItem) => {
    setIsProcessingWireId(wireItem.id);
    setFormError(null);
    setFormSuccess(null);
    setDraftReadyBanner(null);

    try {
      // Build complete original draft adhering to strict facts, category, location, and non-fabrication principles
      const result = await buildCompleteDraftFromReference(wireItem, articles);
      const { draft, isDuplicate, duplicateMessage } = result;

      // Populate all fields into working editorial state
      setEditingId(null);
      setTitle(draft.title);
      setCategory(draft.category);
      setLocation(draft.location);
      setAuthor(draft.author);
      setFacts(draft.facts.join('\n'));
      setRoughNotes(draft.roughNotes);
      setSummary(draft.summary);
      setWhyItMatters(draft.whyItMatters);
      setContent(draft.content.join('\n\n'));
      setImage(draft.image || '');
      setCaptionGambar(draft.captionGambar || '');
      setImageType(draft.image ? 'ai_illustration' : 'none');
      setImageCredit(draft.image ? 'Ilustrasi AI — DenyutGlobal' : '');
      setIllustrationMessage(null);
      setStatus('draft'); // STRICT: always draft
      setEditorialRevisionNotes('');
      setSources(draft.sources);
      setCorrectionStatus('none');
      setCorrectionNotes('');
      setIsHero(false);
      setIsFeatured(false);
      setIsDailyBrief(false);
      setIsAiGeneratedDraft(true);
      setFactCheckResult(null);
      setFactCheckWarning(null);

      // Trigger automatic fact check audit in background to highlight verifiable points
      const validSources = draft.sources.filter(s => s.name.trim() || s.url.trim());
      try {
        fetch('/api/ai/fact-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: draft.title,
            summary: draft.summary,
            content: draft.content,
            facts: draft.facts.join('\n'),
            roughNotes: draft.roughNotes,
            sources: validSources,
            whyItMatters: draft.whyItMatters
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.result) {
              setFactCheckResult(data.result);
              if (data.result.hasUnverifiedClaims) {
                setFactCheckWarning(data.result.summary);
              }
            }
          })
          .catch(() => {});
      } catch (_) {}

      // Set Banner Notification
      setDraftReadyBanner({
        title: draft.title,
        sourceName: wireItem.namaSumber || 'Kawat Berita',
        isDuplicate,
        duplicateMsg: duplicateMessage
      });

      // Switch to form tab directly
      setActiveTab('form');
      setFormSuccess(`Draft original DenyutGlobal berhasil disusun berdasarkan bahan ${wireItem.namaSumber}. Silakan periksa fakta, lalu simpan atau kirim untuk review editorial.`);
    } catch (err: any) {
      console.error('Error auto-generating draft from reference:', err);
      // Fallback manual load if error
      resetForm();
      setTitle(wireItem.judul || '');
      setCategory((wireItem.kategori as any) || 'dunia');
      setLocation(wireItem.negaraLokasi || 'Internasional');
      setFacts(`- Peristiwa: ${wireItem.ringkasan}\n- Waktu Pelaporan: ${wireItem.tanggal} • ${wireItem.waktu}`);
      setSources([
        {
          name: wireItem.namaSumber || 'Kawat Berita',
          url: wireItem.urlSumber || '',
          date: wireItem.tanggal || '',
          notes: 'Referensi awal kawat berita eksternal'
        }
      ]);
      setActiveTab('form');
      setFormError('Penyusunan otomatis mengalami kendala. Bahan referensi telah dimuat ke lembar kerja untuk disusun manual.');
    } finally {
      setIsProcessingWireId(null);
    }
  };

  // Build original DenyutGlobal draft from a Radar News Item (Primary Source workflow)
  const useRadarItemAsDraft = async (radarItem: RadarNewsItem) => {
    setProcessingRadarDraftId(radarItem.id);
    setFormError(null);
    setFormSuccess(null);
    setDraftReadyBanner(null);

    try {
      const result = await buildDraftFromRadarItem(radarItem, articles);
      const { draft, isDuplicate, duplicateMessage } = result;

      // Populate into form state
      setEditingId(null);
      setTitle(draft.title);
      setCategory(draft.category);
      setLocation(draft.location);
      setAuthor(draft.author);
      setFacts(draft.facts.join('\n'));
      setRoughNotes(draft.roughNotes);
      setSummary(draft.summary);
      setWhyItMatters(draft.whyItMatters);
      setContent(draft.content.join('\n\n'));
      setImage(draft.image || '');
      setCaptionGambar(draft.captionGambar || '');
      setImageType(draft.image ? 'ai_illustration' : 'none');
      setImageCredit(draft.image ? 'Ilustrasi AI — DenyutGlobal' : '');
      setIllustrationMessage(null);
      setStatus('draft'); // STRICT: always draft
      setEditorialRevisionNotes('');
      setSources(draft.sources);
      setCorrectionStatus('none');
      setCorrectionNotes('');
      setIsHero(false);
      setIsFeatured(false);
      setIsDailyBrief(false);
      setIsAiGeneratedDraft(true);
      setFactCheckResult(null);
      setFactCheckWarning(null);

      // Trigger fact-check audit in background
      const validSources = draft.sources.filter(s => s.name.trim() || s.url.trim());
      try {
        fetch('/api/ai/fact-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: draft.title,
            summary: draft.summary,
            content: draft.content,
            facts: draft.facts.join('\n'),
            roughNotes: draft.roughNotes,
            sources: validSources,
            whyItMatters: draft.whyItMatters
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.result) {
              setFactCheckResult(data.result);
              if (data.result.hasUnverifiedClaims) {
                setFactCheckWarning(data.result.summary);
              }
            }
          })
          .catch(() => {});
      } catch (_) {}

      // Set Banner Notification
      setDraftReadyBanner({
        title: draft.title,
        sourceName: radarItem.namaSumber,
        isDuplicate,
        duplicateMsg: duplicateMessage
      });

      // Switch to form tab directly
      setActiveTab('form');
      setFormSuccess(`Draft original DenyutGlobal berhasil disusun dari rilis resmi ${radarItem.namaSumber}. Silakan periksa fakta, lalu simpan atau kirim untuk review editorial.`);
    } catch (err: any) {
      console.error('Error auto-generating draft from radar item:', err);
      // Fallback manual load if error
      resetForm();
      setTitle(radarItem.judulTopik || '');
      setFacts(Array.isArray(radarItem.faktaUtama) ? radarItem.faktaUtama.map(f => `- ${f}`).join('\n') : '');
      setLocation(radarItem.lokasi !== 'Tidak disebutkan dalam sumber' ? radarItem.lokasi : 'Indonesia');
      setSources([
        {
          name: radarItem.namaSumber,
          url: radarItem.urlSumber || '',
          date: radarItem.waktu || '',
          notes: radarItem.jenisSumber === 'primer' ? `Rilis Primer Resmi: ${radarItem.lembagaKategori || radarItem.namaSumber}` : 'Radar Berita Topik'
        }
      ]);
      setActiveTab('form');
      setFormError('Penyusunan otomatis mengalami kendala. Bahan rilis telah dimuat ke lembar kerja untuk disusun manual.');
    } finally {
      setProcessingRadarDraftId(null);
    }
  };

  const handleOpenVerificationModal = (item: RadarNewsItem) => {
    setSelectedVerificationItem(item);
    setIsVerificationModalOpen(true);
  };

  const handleConfirmPrimarySource = (radarId: string, confirmation: {
    namaLembaga: string;
    urlKonfirmasi: string;
    dokumenResmi?: string;
  }) => {
    const updated = radarService.confirmPrimarySource(radarId, confirmation);
    if (updated) {
      setRadarItems(prev => prev.map(i => i.id === radarId ? updated : i));
      if (selectedVerificationItem?.id === radarId) {
        setSelectedVerificationItem(updated);
      }
    }
  };

  const handleAddRadarItem = (newItem: RadarNewsItem) => {
    const saved = radarService.addCustomRadarItem(newItem);
    setRadarItems(prev => [saved, ...prev]);
    setFormSuccess(`Topik rilis primer baru "${newItem.judulTopik}" berhasil ditambahkan ke Radar Berita.`);
  };

  const handleSourceChange = (index: number, field: keyof ArticleSource, value: string) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const addSourceField = () => {
    setSources([...sources, { name: '', url: '', date: '', notes: '' }]);
  };

  const removeSourceField = (index: number) => {
    if (sources.length > 1) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security & format validation
    if (!file.type.startsWith('image/')) {
      setFormError('Format file tidak valid. Hanya file gambar (JPEG, PNG, WebP) yang diizinkan.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Size check (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFormError('Ukuran file foto terlalu besar (maksimal 10MB).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // High-quality canvas compression to max 1600px for optimal speed & storage
        const maxDim = 1600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setImage(compressedDataUrl);
        } else {
          setImage(rawDataUrl);
        }
        setImageType('photo');
        if (imageCredit === 'Ilustrasi AI — DenyutGlobal') {
          setImageCredit('');
        }
        if (!captionGambar || captionGambar.startsWith('Ilustrasi editorial')) {
          setCaptionGambar(title.trim() ? title.trim() : '');
        }
        setIllustrationMessage('Foto editor berhasil dimuat sebagai gambar utama artikel.');
        setTimeout(() => setIllustrationMessage(null), 4000);
      };
      img.onerror = () => {
        setImage(rawDataUrl);
        setImageType('photo');
        if (imageCredit === 'Ilustrasi AI — DenyutGlobal') {
          setImageCredit('');
        }
        if (!captionGambar || captionGambar.startsWith('Ilustrasi editorial')) {
          setCaptionGambar(title.trim() ? title.trim() : '');
        }
        setIllustrationMessage('Foto editor berhasil dimuat.');
        setTimeout(() => setIllustrationMessage(null), 4000);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRequestGenerateIllustration = (isRegenerate: boolean = false) => {
    if (image && imageType === 'photo' && !isRegenerate) {
      setIsConfirmReplacePhotoOpen(true);
      return;
    }
    handleGenerateIllustration(isRegenerate);
  };

  const handleGenerateIllustration = async (isRegenerate: boolean = false) => {
    if (!title.trim() && !facts.trim() && !summary.trim()) {
      setFormError('Mohon isi Judul atau Fakta Utama terlebih dahulu sebelum membuat Ilustrasi AI.');
      return;
    }

    setIsGeneratingIllustration(true);
    setIllustrationMessage(null);
    setFormError(null);

    try {
      const res = await fetch('/api/ai/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          facts: facts.trim(),
          location: location.trim() || 'Internasional',
          category,
          summary: summary.trim(),
          seed: Date.now() + (isRegenerate ? Math.floor(Math.random() * 100000) : 0)
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setImage(data.imageUrl);
        setImageType('ai_illustration');
        setImageCredit(data.imageCredit || 'Ilustrasi AI — DenyutGlobal');
        setCaptionGambar(data.captionGambar || `Ilustrasi editorial DenyutGlobal: ${title.trim()}`);
        setIllustrationMessage(isRegenerate ? 'Ilustrasi AI berhasil di-generate ulang.' : 'Ilustrasi AI berhasil dibuat.');
        setTimeout(() => setIllustrationMessage(null), 4000);
      } else {
        setFormError(data.error || 'Layanan AI Ilustrasi tidak dapat membuat gambar saat ini. Anda dapat mengunggah foto editor langsung melalui tombol Upload Foto.');
        setIllustrationMessage(null);
      }
    } catch (err: any) {
      console.error('Illustration generation network error:', err);
      setFormError('Gagal menghubungi layanan AI Ilustrasi. Silakan coba lagi atau gunakan tombol Upload Foto editor.');
      setIllustrationMessage(null);
    } finally {
      setIsGeneratingIllustration(false);
    }
  };

  const handleDeleteIllustration = () => {
    setImage('');
    setCaptionGambar('');
    setImageType('none');
    setImageCredit('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIllustrationMessage('Gambar berhasil dihapus. Naskah tetap utuh dan dapat diproses tanpa gambar.');
    setTimeout(() => setIllustrationMessage(null), 3000);
  };

  const handleCopyFactCheckResult = () => {
    const currentStatusLabel = 
      status === 'published' ? 'Published (Publik)' :
      status === 'approved' ? 'Disetujui (Siap Publikasi)' :
      status === 'review' ? 'Dalam Review Editorial' : 'Draft';

    const categoryLabel = CATEGORIES.find(c => c.id === category)?.label || category;

    const illustrationStatus = image ? 'Tersedia' : 'Tidak tersedia';
    const imageTypeLabel = imageType === 'ai_illustration' ? 'AI Illustration' : (image ? 'Visual / Foto Legal' : '-');
    const imageCreditLabel = image ? (imageCredit || 'Ilustrasi AI — DenyutGlobal') : '-';

    const factsList = facts.trim() 
      ? facts.split('\n').filter(f => f.trim()).map(f => f.trim().startsWith('-') ? f : `- ${f}`).join('\n') 
      : '- Belum ada poin fakta spesifik';

    const sourcesList = sources.filter(s => s.name || s.url).map(s => `- ${s.name || 'Sumber'} (${s.url || 'URL belum ada'})`).join('\n') || '- Belum ada sumber tercatat';

    const claimsBreakdown = factCheckResult?.claims && factCheckResult.claims.length > 0
      ? factCheckResult.claims.map(c => `• [${c.type.toUpperCase()}] "${c.claim}" -> ${c.supported ? 'DIDUKUNG' : 'PERLU VERIFIKASI'} (Rujukan: ${c.sourceTrace})`).join('\n')
      : '• Belum ada rincian audit klaim.';

    const auditSummaryText = factCheckResult 
      ? (factCheckResult.hasUnverifiedClaims ? '⚠️ PERLU VERIFIKASI EDITOR' : '✅ LOLOS VERIFIKASI BERSIH')
      : 'BELUM DIAUDIT';

    const textToCopy = `=== HASIL PEMERIKSAAN & AUDIT EDITORIAL DENYUTGLOBAL ===
STATUS SUMBER: ${sources.length > 0 ? (sources.some(s => (s.notes || '').toLowerCase().includes('primer') || (s.notes || '').toLowerCase().includes('resmi')) ? '🟢 SUMBER PRIMER RESMI TERKONFIRMASI' : '🔵 SUMBER RUJUKAN TERDAFTAR') : '🟡 PERLU VERIFIKASI SUMBER'}
SUMBER & URL:
${sourcesList}

HASIL VERIFIKASI 9-POIN: ${auditSummaryText} (Pemeriksaan Integritas & Sumber Terbuka)

JUDUL: ${title || '(Belum ada judul)'}
LOKASI: ${location || 'Internasional'}
RUBRIK: ${categoryLabel}

RINGKASAN:
${summary || '(Belum ada ringkasan)'}

FAKTA UTAMA:
${factsList}

ISI NASKAH:
${content ? (content.length > 300 ? content.slice(0, 300) + '...' : content) : '(Belum ada isi naskah)'}

HASIL AUDIT FAKTA:
- Ringkasan Audit: ${factCheckResult?.summary || 'Naskah belum diaudit atau sedang dalam penyusunan draft.'}
- Rincian Klaim:
${claimsBreakdown}
- Catatan / Temuan: ${factCheckResult?.unsupportedClaims && factCheckResult.unsupportedClaims.length > 0 ? factCheckResult.unsupportedClaims.map(u => `  * ${u}`).join('\n') : 'Tidak ada temuan pelanggaran fakta.'}

STATUS REVIEW EDITORIAL: ${currentStatusLabel}
${editorialRevisionNotes ? `Catatan Redaksi: ${editorialRevisionNotes}` : ''}

STATUS ILUSTRASI AI: ${illustrationStatus} (${imageTypeLabel})
- Kredit: ${imageCreditLabel}
- Keterangan: ${captionGambar || '-'}
======================================================`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopiedFactCheck(true);
    setTimeout(() => setIsCopiedFactCheck(false), 3000);
  };

  // Run Real Fact-Check Engine against inputs
  const runFactCheck = async (interactive: boolean = true): Promise<FactCheckResult | null> => {
    setIsFactChecking(true);
    setFactCheckWarning(null);

    const validSources = sources.filter(s => s.name.trim() || s.url.trim());
    const contentParagraphs = content.split('\n\n').filter(p => p.trim().length > 0);

    try {
      const res = await fetch('/api/ai/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          content: contentParagraphs,
          facts,
          roughNotes,
          sources: validSources,
          whyItMatters
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          setFactCheckResult(data.result);
          if (data.result.hasUnverifiedClaims) {
            setFactCheckWarning(data.result.summary || 'Terdapat klaim atau data yang belum didukung oleh sumber rujukan terverifikasi.');
          } else if (interactive) {
            setFormSuccess('Audit Fakta Selesai: Naskah bersih, seluruh klaim terverifikasi terhadap rujukan terdaftar.');
          }
          return data.result;
        }
      }
    } catch (e) {
      console.warn('Fact check API failed, generating offline validation rule-set:', e);
    } finally {
      setIsFactChecking(false);
    }

    // Local deterministic fact checking fallback
    const forbiddenSuperlatives = ['terbukti', 'pasti', 'terbesar', 'bersejarah', 'spektakuler', 'menghebohkan'];
    const lowerContent = `${title} ${summary} ${content}`.toLowerCase();
    const foundBadWords = forbiddenSuperlatives.filter(word => lowerContent.includes(word));

    const forbiddenPhrases = [
      'sedang dalam penelaahan redaksi',
      'saat ini sedang dalam penelaahan',
      'bahan liputan dihimpun dari feed kawat',
      'feed kawat resmi',
      'transformasi naskah',
      'pemisahan tegas antara fakta, konteks, dan analisis',
      'denyutglobal menerapkan prinsip transparansi',
      'editor mencatat',
      'berdasarkan catatan dan data awal yang dihimpun',
      'untuk memperbarui perkembangan isu bagi publik internasional',
      'poin fakta yang tercatat mencakup',
      'dalam catatan konteks pendukung',
      'penjelasan ini menjadi latar belakang penelaahan isu',
      'isu ini dipantau untuk memberikan gambaran proporsional'
    ];
    const foundTemplates = forbiddenPhrases.filter(phrase => lowerContent.includes(phrase));
    const hasPlaceholders = /\.\.\.|\[\.\.\.\]|\[isi\]|\[nama\]|\[tanggal\]|\[lokasi\]|\[placeholder\]/i.test(lowerContent);

    const hasIssues = validSources.length === 0 || foundBadWords.length > 0 || foundTemplates.length > 0 || hasPlaceholders;
    const fallbackResult: FactCheckResult = {
      passed: !hasIssues,
      canPublish: !hasIssues,
      hasUnverifiedClaims: hasIssues,
      unsupportedClaims: [
        ...(validSources.length === 0 ? ['Sumber rujukan belum dicantumkan secara lengkap.'] : []),
        ...(foundBadWords.length > 0 ? [`Ditemukan kata berpotensi hiperbola: "${foundBadWords.join(', ')}"`] : []),
        ...(foundTemplates.length > 0 ? [`Memuat kalimat template internal yang dilarang: "${foundTemplates.join('", "')}"`] : []),
        ...(hasPlaceholders ? ['Memuat tanda placeholder atau "..." yang dilarang dalam naskah.'] : [])
      ],
      missingSourceClaims: validSources.length === 0 ? ['Semua klaim memerlukan rujukan sumber valid'] : [],
      forbiddenKeywordsFound: foundBadWords,
      claims: [
        {
          id: 'claim-1',
          claim: summary.slice(0, 120) || title,
          type: 'fakta',
          supported: validSources.length > 0 && !hasIssues,
          sourceTrace: validSources.length > 0 ? validSources[0].name : 'Sumber belum tersedia — perlu verifikasi editor.',
          status: validSources.length > 0 && !hasIssues ? 'verified' : 'needs_verification'
        }
      ],
      checkedAt: new Date().toISOString(),
      checkedBy: 'Redaksi DenyutGlobal (Audit Lokal)',
      sourceAudit: {
        totalSources: validSources.length,
        sourcesProvided: validSources.length > 0,
        sourcesTraceable: validSources.length > 0,
        note: validSources.length > 0 ? 'Sumber rujukan terdaftar dan dapat ditelusuri.' : 'Sumber rujukan belum dicantumkan.'
      },
      summary: validSources.length === 0
        ? 'Sumber rujukan belum diisi. Setiap fakta penting harus dapat ditelusuri ke sumber rujukan.'
        : hasPlaceholders
        ? 'Terdapat placeholder atau tanda "..." yang harus dilengkapi terlebih dahulu.'
        : foundTemplates.length > 0
        ? `Naskah memuat kalimat template internal (${foundTemplates.join(', ')}) yang dilarang.`
        : foundBadWords.length > 0
        ? `Naskah memuat kata sensitif (${foundBadWords.join(', ')}) yang memerlukan kehati-hatian redaksi.`
        : 'Audit lokal: Naskah mematuhi kaidah penulisan dan integritas fakta.'
    };

    setFactCheckResult(fallbackResult);
    if (fallbackResult.hasUnverifiedClaims) {
      setFactCheckWarning(fallbackResult.summary);
    }
    return fallbackResult;
  };

  // Handle applying revised draft from AI / editor refinement
  const handleApplyRevision = (revised: ArticleRevisionResult) => {
    setTitle(revised.title);
    setSummary(revised.summary);
    if (revised.content && Array.isArray(revised.content)) {
      setContent(revised.content.join('\n\n'));
    }
    if (revised.facts && Array.isArray(revised.facts)) {
      setFacts(revised.facts.join('\n'));
    }
    if (revised.whyItMatters) {
      setWhyItMatters(revised.whyItMatters);
    }
    // Strict rules: Retain sources & images untouched, set status strictly to 'draft'
    setStatus('draft');
    // Reset fact check result so editor can run fresh validation
    setFactCheckResult(null);
    setFactCheckWarning(null);
    setFormSuccess('Hasil perbaikan naskah berhasil diterapkan ke draft. Status tetap Draft. Silakan periksa kembali dan jalankan Audit Fakta.');
    setActiveTab('form');
  };

  // Submit handler with strict editorial workflow and pre-publish validations
  const handleSubmit = async (targetStatus: ArticleStatus) => {
    setFormError(null);
    setFormSuccess(null);
    setFactCheckWarning(null);

    if (!title.trim()) {
      setFormError('Judul artikel wajib diisi.');
      return;
    }

    if (!summary.trim()) {
      setFormError('Ringkasan artikel wajib diisi.');
      return;
    }

    if (!content.trim()) {
      setFormError('Isi berita artikel wajib diisi.');
      return;
    }

    const validSources = sources.filter(s => s.name.trim() || s.url.trim());

    // STRICT PRE-REVIEW VALIDATOR (Checks 1 to 10):
    // Block review if placeholders, internal templates, empty sources/facts exist
    if (targetStatus === 'review') {
      const existingArticle = editingId ? articles.find(a => a.id === editingId) : null;
      const validation = validateDraftForReview({
        title,
        summary,
        content,
        facts,
        sources,
        sourceTitle: existingArticle?.title || existingArticle?.judul
      });

      if (!validation.isValid) {
        setFormError(`Draft belum siap untuk Review. Periksa bagian yang ditandai: ${validation.errors.join(' ')}`);
        return;
      }
    }

    // STRICT WORKFLOW GATEKEEPING:
    // 1. Direct "draft -> published" is strictly forbidden.
    // 2. Direct "review -> published" is strictly forbidden (must go through editorial decision -> "approved").
    if (targetStatus === 'published') {
      if (status !== 'approved') {
        if (status === 'draft') {
          setFormError('Alur Redaksi Wajib: Naskah berstatus Draft tidak dapat langsung dipublikasikan. Kirimkan naskah untuk Review Redaksi terlebih dahulu.');
          return;
        }
        if (status === 'review') {
          setFormError('Alur Redaksi Wajib: Naskah masih Dalam Review. Editor Redaksi harus menyetujui artikel terlebih dahulu ("Setujui & Siap Publikasi") sebelum publikasi.');
          return;
        }
      }

      // Mandatory source check: if no sources are entered, block publish
      if (validSources.length === 0) {
        setFactCheckWarning('⚠️ Perlu Verifikasi: Sumber rujukan belum diisi. Setiap fakta penting harus dapat ditelusuri ke sumber rujukan.');
        setFormError('Artikel tidak dapat dipublikasikan tanpa sumber rujukan yang jelas. Lengkapi sumber rujukan sebelum mempublikasikan.');
        return;
      }

      // Mandatory live fact-check validation before publishing
      const checkRes = await runFactCheck(false);
      if (checkRes && checkRes.hasUnverifiedClaims) {
        setFactCheckWarning(checkRes.summary || '⚠️ Perlu Verifikasi');
        setFormError('⚠️ Perlu Verifikasi: Ditemukan klaim yang belum didukung fakta/sumber atau memuat kata hiperbola. Harap periksa rincian klaim di tab Audit Fakta.');
        return;
      }
    }

    // Editorial validation: reviewed true only for approved or published
    const isReviewed = targetStatus === 'approved' || targetStatus === 'published';

    // Parse facts
    const factsArray = facts
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    // Parse content paragraphs
    const contentParagraphs = content
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const now = new Date();
    const id = editingId || `art-${Date.now()}`;
    const existingArticle = editingId ? articles.find(a => a.id === editingId) : null;
    const slug = existingArticle?.slug || slugify(title) || id;
    const isExistingPublished = !!(existingArticle && (existingArticle.status === 'published' || existingArticle.publishedAt));

    const initialTanggal = isExistingPublished && existingArticle?.tanggal 
      ? existingArticle.tanggal 
      : `${now.getDate()} ${now.toLocaleDateString('id-ID', { month: 'long' })} ${now.getFullYear()}`;
    
    const initialWaktu = isExistingPublished && existingArticle?.waktu 
      ? existingArticle.waktu 
      : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const initialPublishedAt = isExistingPublished && existingArticle?.publishedAt
      ? existingArticle.publishedAt
      : (targetStatus === 'published' ? now.toISOString() : undefined);

    const hasCorrectionOrUpdate = correctionStatus !== 'none' || Boolean(correctionNotes.trim());
    const isBeingUpdated = (isExistingPublished && targetStatus === 'published') || hasCorrectionOrUpdate;

    const formattedUpdatedAt = isBeingUpdated
      ? `${now.getDate()} ${now.toLocaleDateString('id-ID', { month: 'long' })} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`
      : existingArticle?.updatedAt;

    const defaultImages: Record<string, string> = {
      dunia: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
      politik: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      ekonomi: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
      teknologi: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      sains: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
      olahraga: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      bencana: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      indonesia: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'
    };

    const articleToSave: NewsItem = {
      id,
      title: title.trim(),
      judul: title.trim(),
      slug,
      category,
      kategori: category,
      categoryLabel: CATEGORIES.find(c => c.id === category)?.label || 'Dunia',
      kategoriLabel: CATEGORIES.find(c => c.id === category)?.label || 'Dunia',
      location: location.trim() || 'Internasional',
      negaraLokasi: location.trim() || 'Internasional',
      author: author.trim() || 'Redaksi DenyutGlobal',
      summary: summary.trim(),
      ringkasan: summary.trim(),
      facts: factsArray,
      content: contentParagraphs,
      isiLengkap: contentParagraphs,
      whyItMatters: whyItMatters.trim() || 'Peristiwa ini mencerminkan dinamika penting yang mempengaruhi kebijakan publik dan tata kelola kawasan.',
      sources: validSources.length > 0 ? validSources : [{ name: 'Sumber belum tersedia — perlu verifikasi editor.', url: '', date: '', notes: '' }],
      sourceUrls: validSources.map(s => s.url).filter(Boolean),
      namaSumber: validSources.length > 0 ? validSources.map(s => s.name).join(', ') : 'Sumber belum tersedia — perlu verifikasi editor.',
      urlSumber: validSources.length > 0 ? validSources[0].url : '',
      image: image.trim(),
      gambar: image.trim(),
      captionGambar: captionGambar.trim() || (image.trim() ? `Ilustrasi editorial DenyutGlobal: ${title.trim()}` : ''),
      imageType: image.trim() ? (imageType === 'none' ? 'ai_illustration' : imageType) : 'none',
      imageCredit: image.trim() ? (imageCredit || (imageType === 'ai_illustration' ? 'Ilustrasi AI — DenyutGlobal' : 'Redaksi DenyutGlobal')) : '',
      status: targetStatus,
      reviewed: isReviewed,
      editorialRevisionNotes: targetStatus === 'draft' ? editorialRevisionNotes : undefined,
      approvedAt: targetStatus === 'approved' ? (existingArticle?.approvedAt || now.toISOString()) : existingArticle?.approvedAt,
      correctionStatus: correctionStatus !== 'none' ? correctionStatus : (hasCorrectionOrUpdate ? 'updated' : undefined),
      correctionNote: correctionNotes.trim() || undefined,
      correctionNotes: correctionNotes.trim() || undefined,
      updatedAt: formattedUpdatedAt,
      isUpdated: isBeingUpdated,
      factCheckResult: factCheckResult || undefined,
      isAiGeneratedDraft: isAiGeneratedDraft && targetStatus !== 'published',
      isHero,
      isFeatured,
      isDailyBrief,
      isEditorial: true,
      readTimeMinutes: Math.max(2, Math.ceil(contentParagraphs.join(' ').split(' ').length / 150)),
      tanggal: initialTanggal,
      waktu: initialWaktu,
      publishedAt: initialPublishedAt
    };

    onSaveArticle(articleToSave);

    let statusMsg = 'Draft naskah berhasil disimpan.';
    if (targetStatus === 'review') statusMsg = 'Naskah berhasil dikirim untuk proses Review Editorial redaksi.';
    if (targetStatus === 'approved') statusMsg = 'Artikel disetujui dan siap dipublikasikan.';
    if (targetStatus === 'published') statusMsg = 'Artikel resmi DIPUBLIKASIKAN ke portal publik DenyutGlobal!';

    setFormSuccess(statusMsg);
    setEditingId(id);
    setStatus(targetStatus);
  };

  // Editorial Action 1: Approve Article (Review -> Approved)
  const handleApproveArticle = (targetArt?: NewsItem) => {
    const art = targetArt || (editingId ? articles.find(a => a.id === editingId) : null);
    if (!art && !targetArt && status !== 'review') return;

    const now = new Date();

    if (targetArt) {
      const updated: NewsItem = {
        ...targetArt,
        status: 'approved',
        reviewed: true,
        approvedAt: now.toISOString(),
        editorialRevisionNotes: undefined
      };
      onSaveArticle(updated);
      if (editingId === targetArt.id) {
        setStatus('approved');
        setEditorialRevisionNotes('');
      }
    } else {
      // Approve current working form
      handleSubmit('approved');
      return;
    }

    setFormSuccess('Artikel disetujui dan siap dipublikasikan.');
    setFormError(null);
  };

  // Editorial Action 2: Request Revision / Needs Fixes (Review -> Draft with Notes)
  const handleOpenRevisionModal = (targetArt?: NewsItem) => {
    if (targetArt) {
      setRevisionTargetArticle(targetArt);
      setRevisionNoteInput(targetArt.editorialRevisionNotes || '');
    } else {
      setRevisionTargetArticle(null);
      setRevisionNoteInput(editorialRevisionNotes || '');
    }
    setIsRevisionModalOpen(true);
  };

  const handleConfirmRevision = () => {
    const note = revisionNoteInput.trim() || 'Perlu perbaikan redaksional dan verifikasi lanjutan.';

    if (revisionTargetArticle) {
      const updated: NewsItem = {
        ...revisionTargetArticle,
        status: 'draft',
        reviewed: false,
        editorialRevisionNotes: note
      };
      onSaveArticle(updated);
      if (editingId === revisionTargetArticle.id) {
        setStatus('draft');
        setEditorialRevisionNotes(note);
      }
    } else {
      // In active form
      setEditorialRevisionNotes(note);
      setStatus('draft');

      const existingArticle = editingId ? articles.find(a => a.id === editingId) : null;
      if (existingArticle) {
        const updated: NewsItem = {
          ...existingArticle,
          status: 'draft',
          reviewed: false,
          editorialRevisionNotes: note
        };
        onSaveArticle(updated);
      }
    }

    setIsRevisionModalOpen(false);
    setRevisionTargetArticle(null);
    setFormSuccess(`Artikel dikembalikan ke status Draft dengan catatan perbaikan redaksi: "${note}"`);
    setFormError(null);
  };

  // Editorial Action 3: Revert Review to Draft (Review -> Draft without notes)
  const handleRequestRevert = (targetArt?: NewsItem) => {
    if (targetArt) {
      if (targetArt.status !== 'review' && targetArt.status !== 'approved') return;
      setRevertTargetArticle(targetArt);
    } else {
      if (status !== 'review' && status !== 'approved') return;
      setRevertTargetArticle(null);
    }
    setIsRevertConfirmOpen(true);
  };

  const handleConfirmRevert = () => {
    if (revertTargetArticle) {
      const reverted: NewsItem = {
        ...revertTargetArticle,
        status: 'draft',
        reviewed: false,
        publishedAt: undefined
      };
      onSaveArticle(reverted);

      if (editingId === revertTargetArticle.id) {
        setStatus('draft');
      }
    } else {
      // Current form
      setStatus('draft');
      const existingArticle = editingId ? articles.find(a => a.id === editingId) : null;
      if (existingArticle) {
        const updated: NewsItem = {
          ...existingArticle,
          status: 'draft',
          reviewed: false,
          publishedAt: undefined
        };
        onSaveArticle(updated);
      }
    }

    setIsRevertConfirmOpen(false);
    setRevertTargetArticle(null);
    setFormError(null);
    setFormSuccess('Artikel berhasil dikembalikan ke Draft.');
  };

  const filteredArticles = articles.filter(a => {
    if (listFilter === 'all') return true;
    return a.status === listFilter;
  });

  // Preset revision notes for quick redaksional feedback
  const revisionPresets = [
    'Periksa kembali angka dan statistik.',
    'Judul terlalu mirip dengan sumber rujukan.',
    'Tambahkan konteks latar belakang peristiwa.',
    'Sumber gambar belum jelas hak penggunaannya.',
    'Lengkapi kutipan dan atribusi sumber resmi.',
    'Periksa struktur 6-bagian naskah.'
  ];

  return (
    <div 
      id="editorial-desk-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-serif-headline">
                  Ruang Redaksi DenyutGlobal
                </h2>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Sistem Editorial & Verifikasi Fakta
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Penyusunan naskah original, audit integritas fakta, dan review redaksional berjenjang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Keluar dari sesi redaksi"
              >
                Keluar Sesi
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Tutup Ruang Redaksi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{editingId ? 'Edit Naskah' : 'Tulis Berita Baru'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('factcheck');
                if (!factCheckResult && (content || facts)) {
                  runFactCheck(false);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'factcheck'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit Fakta {factCheckResult ? (factCheckResult.hasUnverifiedClaims ? '⚠️' : '✅') : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Manajemen Artikel ({articles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wire')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wire'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-500" />
              <span>📡 Radar Berita ({radarItems.length})</span>
            </button>
          </div>

          {activeTab === 'form' && editingId && (
            <button
              onClick={resetForm}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
            >
              + Buat Naskah Baru
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: FORM EDITOR */}
          {activeTab === 'form' && (
            <div className="space-y-6">
              
              {/* 1. REVIEW EDITORIAL PANEL (Saat status === 'review') */}
              {status === 'review' && (
                <div 
                  id="editorial-review-panel"
                  className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-md bg-amber-500 text-white font-bold uppercase text-[11px] tracking-wider shadow-2xs">
                        DALAM REVIEW EDITORIAL
                      </span>
                      <h3 className="font-bold text-sm text-amber-950 font-serif-headline">
                        Panel Keputusan Redaksi
                      </h3>
                    </div>
                    <span className="text-xs text-amber-800 font-medium">
                      Naskah belum tampil di portal publik. Tinjau fakta & putuskan status:
                    </span>
                  </div>

                  <p className="text-xs text-amber-900 leading-relaxed">
                    Sebagai editor, pastikan naskah DenyutGlobal ditulis secara original (struktur 6-bagian), sumber rujukan terdaftar transparan, serta seluruh angka dan data telah terverifikasi sebelum memberikan persetujuan.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      id="editor-btn-approve-article"
                      type="button"
                      onClick={() => handleApproveArticle()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
                      title="Setujui artikel dan ubah status menjadi Siap Publikasi"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ Setujui & Siap Publikasi</span>
                    </button>

                    <button
                      id="editor-btn-request-revision"
                      type="button"
                      onClick={() => handleOpenRevisionModal()}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                      title="Kembalikan ke Draft dengan catatan perbaikan untuk editor"
                    >
                      <BadgeAlert className="w-4 h-4" />
                      <span>⚠️ Perlu Perbaikan</span>
                    </button>

                    <button
                      id="editor-btn-revert-draft"
                      type="button"
                      onClick={() => handleRequestRevert()}
                      className="px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-400 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
                      title="Batalkan review dan kembalikan naskah ke Draft"
                    >
                      <Undo2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>↩️ Kembalikan ke Draft</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. APPROVED STATUS BANNER (Saat status === 'approved') */}
              {status === 'approved' && (
                <div 
                  id="editorial-approved-panel"
                  className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-wider">
                          DISETUJUI REDAKSI
                        </span>
                        <h4 className="font-bold text-sm text-emerald-950">
                          Naskah Siap Dipublikasikan
                        </h4>
                      </div>
                      <p className="text-xs text-emerald-800 mt-1">
                        Artikel telah disetujui dalam Review Editorial. Naskah <strong>BELUM</strong> tayang di publik hingga tombol "Publikasikan Artikel" ditekan.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRequestRevert()}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Kembalikan ke Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmit('published')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Publikasikan Sekarang</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. EDITORIAL REVISION NOTES BANNER (Saat status === 'draft' && memiliki catatan perbaikan) */}
              {status === 'draft' && editorialRevisionNotes && (
                <div 
                  id="editorial-revision-note-banner"
                  className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-xs text-amber-900 shadow-2xs space-y-2 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                      <MessageSquareQuote className="w-4 h-4 text-amber-600" />
                      <span>Catatan Perbaikan dari Review Redaksi:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditorialRevisionNotes('')}
                      className="text-[11px] text-amber-700 hover:text-amber-900 underline font-semibold cursor-pointer"
                      title="Hapus catatan setelah naskah diperbaiki"
                    >
                      Tandai Perbaikan Selesai
                    </button>
                  </div>
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200 text-slate-800 font-medium leading-relaxed">
                    "{editorialRevisionNotes}"
                  </div>
                  <p className="text-[11px] text-amber-700">
                    Silakan sesuaikan isi naskah sesuai catatan di atas, lalu simpan atau kirim ulang ke Review Redaksi.
                  </p>
                </div>
              )}

              {/* Alert notices */}
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{formError}</div>
                </div>
              )}

              {factCheckWarning && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                      <span>⚠️ Perlu Verifikasi Editor</span>
                    </div>
                    <p className="leading-relaxed">{factCheckWarning}</p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('factcheck')}
                        className="text-xs font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                      >
                        Buka Tab Audit Fakta untuk melihat rincian klaim →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {formSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{formSuccess}</div>
                  {draftReadyBanner && (
                    <button
                      type="button"
                      onClick={() => setDraftReadyBanner(null)}
                      className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline cursor-pointer"
                    >
                      Tutup
                    </button>
                  )}
                </div>
              )}

              {draftReadyBanner?.duplicateMsg && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Peringatan Duplikasi:</span> {draftReadyBanner.duplicateMsg}
                  </div>
                </div>
              )}

              {/* Status Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Naskah:</span>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    status === 'published'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : status === 'approved'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-400 font-black'
                      : status === 'review'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                      : 'bg-slate-200 text-slate-800 border border-slate-300'
                  }`}>
                    {status === 'published' ? 'Published (Publik)' : status === 'approved' ? 'Disetujui (Siap Publikasi)' : status === 'review' ? 'Dalam Review' : 'Draft'}
                  </span>
                  {isAiGeneratedDraft && status === 'draft' && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200">
                      Draft Asisten AI
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{editingId ? `ID: ${editingId}` : 'Naskah Baru'}</span>
                </div>
              </div>

              {/* Row: Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rubrik Kategori <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  >
                    {CATEGORIES.filter(c => c.id !== 'semua').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Wilayah / Lokasi Peristiwa <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Jakarta, Indonesia atau Jenewa, Swiss"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Penulis / Editor Naskah
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Redaksi DenyutGlobal"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Article Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Judul Naskah Original <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Wajib original, substantif, tidak clickbait, dan akurat
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Aktivitas Anak Krakatau Terpantau Delapan Kali Erupsi dalam Sehari"
                  className="w-full text-sm font-serif-headline font-bold bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              {/* Poin Fakta Terverifikasi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Poin-Poin Fakta Utama Terverifikasi</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Satu poin per baris</span>
                </div>
                <textarea
                  value={facts}
                  onChange={(e) => setFacts(e.target.value)}
                  rows={3}
                  placeholder="- Poin 1: Data kejadian terkonfirmasi&#10;- Poin 2: Waktu dan lokasi peristiwa&#10;- Poin 3: Otoritas pelapor resmi"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white leading-relaxed font-mono"
                />
              </div>

              {/* Summary / Ringkasan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ringkasan Berita (Lead Summary) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Ringkasan 2-3 kalimat lugas dengan struktur kalimat baru, bukan menyalin kalimat sumber..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Mengapa Ini Penting / Why It Matters */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Konteks Signifikansi / Mengapa Ini Penting (Why It Matters)
                </label>
                <textarea
                  value={whyItMatters}
                  onChange={(e) => setWhyItMatters(e.target.value)}
                  rows={2}
                  placeholder="Penjelasan latar belakang dan signifikansi peristiwa bagi kebijakan publik atau tata kelola kawasan..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Isi Lengkap Berita (Struktur 6-Bagian) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Isi Lengkap Berita (Struktur 6-Bagian Original) <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Pisahkan paragraf dengan baris ganda (Enter dua kali)</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Paragraf 1: Lead original DenyutGlobal...&#10;&#10;Paragraf 2: Fakta utama terverifikasi...&#10;&#10;Paragraf 3: Data pendukung dan kronologi...&#10;&#10;Paragraf 4: Konteks kebijakan dan latar belakang...&#10;&#10;Paragraf 5: Informasi keselamatan / implikasi publik...&#10;&#10;Paragraf 6: Penutup pemantauan redaksi..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white leading-relaxed font-sans"
                />
              </div>

              {/* Sumber Rujukan Terdaftar (Mandatory Transparency) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sumber Rujukan Terdaftar & Keterlacakan Data</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSourceField}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sumber</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Prinsip Transparansi DenyutGlobal: Naskah ditulis original dengan bahasa sendiri, tetapi sumber rujukan wajib dicantumkan secara transparan.
                </p>

                <div className="space-y-2">
                  {sources.map((src, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={src.name}
                          onChange={(e) => handleSourceChange(idx, 'name', e.target.value)}
                          placeholder="Nama Sumber (mis. ANTARA News, BBC, Badan Geologi)"
                          className="w-full text-xs border border-slate-300 rounded p-1.5 text-slate-800"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <input
                          type="url"
                          value={src.url}
                          onChange={(e) => handleSourceChange(idx, 'url', e.target.value)}
                          placeholder="URL Rujukan (https://...)"
                          className="w-full text-xs border border-slate-300 rounded p-1.5 text-slate-800"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={src.date || ''}
                          onChange={(e) => handleSourceChange(idx, 'date', e.target.value)}
                          placeholder="Tanggal"
                          className="w-full text-xs border border-slate-300 rounded p-1.5 text-slate-800"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        {sources.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSourceField(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden file input for uploading photo from device / Android gallery */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="hidden"
              />

              {/* Modul Gambar Artikel & Integrasi Foto */}
              <div id="editor-image-module" className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-rose-600" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Gambar Utama Artikel & Visual Editorial
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pilih salah satu metode: buat Ilustrasi AI sesuai fakta naskah atau unggah Foto Editor langsung dari perangkat.
                    </p>
                  </div>

                  {image && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        imageType === 'photo' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}>
                        {imageType === 'photo' ? (
                          <>
                            <Camera className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Jenis Gambar: Foto Editor</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Jenis Gambar: Ilustrasi AI</span>
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Feedback Notification if any */}
                {illustrationMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{illustrationMessage}</span>
                  </div>
                )}

                {/* Active Image Preview or Empty State */}
                {image ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 group aspect-video max-h-[360px] flex items-center justify-center">
                      <img
                        src={image}
                        alt={captionGambar || title || 'Gambar Artikel'}
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />

                      {/* Top Floating Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-md backdrop-blur-md ${
                          imageType === 'photo'
                            ? 'bg-emerald-900/90 text-white border border-emerald-400/30'
                            : 'bg-slate-900/90 text-white border border-white/20'
                        }`}>
                          {imageType === 'photo' ? '📷 Foto Editor' : '🎨 Ilustrasi AI'}
                        </span>
                      </div>

                      {/* Bottom Attribution Overlay */}
                      <div className="absolute bottom-3 left-3 max-w-[80%] flex items-center gap-1.5 px-3 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-medium rounded-lg border border-white/20 shadow-md">
                        <span>Kredit: <strong>{imageCredit || (imageType === 'photo' ? 'Dok. Editor' : 'Ilustrasi AI — DenyutGlobal')}</strong></span>
                      </div>

                      {/* Action Overlay */}
                      <div className="absolute top-3 right-3 flex flex-wrap items-center gap-2">
                        {imageType === 'ai_illustration' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleGenerateIllustration(true)}
                              disabled={isGeneratingIllustration}
                              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold rounded-lg border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                              title="Generate ulang variasi ilustrasi AI baru"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingIllustration ? 'animate-spin' : ''}`} />
                              <span>🔄 Generate Ulang</span>
                            </button>

                            <button
                              type="button"
                              onClick={triggerPhotoUpload}
                              className="px-3 py-1.5 bg-emerald-700/85 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg border border-emerald-400/30 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                              title="Ganti gambar ini dengan mengunggah foto editor"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>📷 Ganti dengan Foto</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={triggerPhotoUpload}
                              className="px-3 py-1.5 bg-emerald-700/90 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg border border-emerald-400/30 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                              title="Pilih foto lain dari galeri atau perangkat"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>📷 Ganti Foto</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRequestGenerateIllustration(false)}
                              disabled={isGeneratingIllustration}
                              className="px-3 py-1.5 bg-indigo-700/85 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg border border-indigo-400/30 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                              title="Ganti foto ini dengan generate Ilustrasi AI"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>🖼️ Ganti dengan Ilustrasi AI</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={handleDeleteIllustration}
                          className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                          title="Hapus gambar artikel ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>🗑️ Hapus Gambar</span>
                        </button>
                      </div>
                    </div>

                    {/* Form Fields: Caption, Credit, Image Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {imageType === 'photo' ? 'Keterangan Foto' : 'Keterangan Gambar'} <span className="text-slate-400 font-normal">(Caption)</span>
                        </label>
                        <input
                          type="text"
                          value={captionGambar}
                          onChange={(e) => setCaptionGambar(e.target.value)}
                          placeholder={
                            imageType === 'photo'
                              ? 'Contoh: Gunung Lewotobi Laki-laki saat erupsi pada dini hari...'
                              : 'Ilustrasi editorial DenyutGlobal: [deskripsi singkat sesuai isi berita]'
                          }
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          {imageType === 'photo'
                            ? 'Tulis keterangan faktual mengenai subjek atau momen dalam foto.'
                            : 'Keterangan otomatis menandai gambar sebagai representasi ilustrasi editorial.'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {imageType === 'photo' ? 'Kredit / Atribusi Foto' : 'Kredit / Atribusi Gambar'}
                        </label>
                        <input
                          type="text"
                          value={imageCredit}
                          onChange={(e) => setImageCredit(e.target.value)}
                          placeholder={
                            imageType === 'photo'
                              ? 'Contoh: PVMBG / Antara / Reuters / Dok. Redaksi'
                              : 'Ilustrasi AI — DenyutGlobal'
                          }
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          {imageType === 'photo'
                            ? 'Wajib cantumkan pemegang hak cipta, lembaga resmi, atau nama fotografer.'
                            : 'Kredit baku terstandarisasi untuk karya ilustrasi AI DenyutGlobal.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State with Two Primary Clean Options */
                  <div className="p-6 sm:p-8 text-center border-2 border-dashed border-slate-300 bg-white rounded-2xl space-y-4">
                    <div className="max-w-md mx-auto space-y-1.5">
                      <h5 className="text-sm font-bold text-slate-800">
                        Belum ada gambar yang dipilih untuk artikel ini
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Pilih salah satu metode di bawah ini untuk menambahkan visual utama artikel:
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
                      <button
                        type="button"
                        onClick={() => handleGenerateIllustration(false)}
                        disabled={isGeneratingIllustration}
                        className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {isGeneratingIllustration ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Membuat Ilustrasi AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>🖼️ Generate Ilustrasi AI</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={triggerPhotoUpload}
                        className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Camera className="w-4 h-4 text-emerald-400" />
                        <span>📷 Upload Foto</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 max-w-md mx-auto">
                      Format foto: JPEG, PNG, WebP (maks. 10MB). Artikel tetap dapat disimpan dan diterbitkan tanpa gambar.
                    </p>
                  </div>
                )}
              </div>

              {/* Editorial Placement Highlights */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHero}
                    onChange={(e) => setIsHero(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Jadikan Berita Utama (Hero)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Pilihan Redaksi (Featured)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDailyBrief}
                    onChange={(e) => setIsDailyBrief(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Masukkan ke Daily Brief</span>
                </label>
              </div>

              {/* Pembaruan & Koreksi Berita */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pembaruan & Kebijakan Koreksi Redaksi</span>
                  </label>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                    Standar Transparansi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectionStatus('none')}
                    className={`p-2 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                      correctionStatus === 'none'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">Standar / Baru</div>
                    <div className="text-[10px] opacity-80">Bukan ralat/koreksi</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCorrectionStatus('corrected')}
                    className={`p-2 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                      correctionStatus === 'corrected'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <div className="font-bold">Koreksi Faktual</div>
                    <div className="text-[10px] opacity-80">Memperbaiki data salah</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCorrectionStatus('updated')}
                    className={`p-2 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                      correctionStatus === 'updated'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-bold">Pembaruan Berita</div>
                    <div className="text-[10px] opacity-80">Informasi baru lanjutan</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCorrectionStatus('editorial_fix')}
                    className={`p-2 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                      correctionStatus === 'editorial_fix'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <div className="font-bold">Ralat Redaksional</div>
                    <div className="text-[10px] opacity-80">Ejaan/tata bahasa minor</div>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Catatan Koreksi / Penjelasan Pembaruan untuk Pembaca:
                  </label>
                  <input
                    type="text"
                    value={correctionNotes}
                    onChange={(e) => {
                      setCorrectionNotes(e.target.value);
                      if (correctionStatus === 'none' && e.target.value.trim()) {
                        setCorrectionStatus('corrected');
                      }
                    }}
                    placeholder="Contoh: Mengoreksi penyebutan lokasi dari Jakarta Barat menjadi Jakarta Timur..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sesuai kebijakan redaksi: Tanggal publikasi awal akan dipertahankan, waktu pembaruan (updatedAt) akan dicatat, dan catatan koreksi ditampilkan transparan di badan artikel.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS (STRICT GATEKEEPING) */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Reset Formulir
                  </button>

                  <button
                    type="button"
                    onClick={() => runFactCheck(true)}
                    disabled={isFactChecking}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isFactChecking ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memeriksa Fakta...</span>
                      </>
                    ) : (
                      <>
                        <SearchCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Periksa Fakta</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyFactCheckResult}
                    className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Salin hasil pemeriksaan dan status ilustrasi"
                  >
                    {isCopiedFactCheck ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Salin Hasil Audit</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('factcheck')}
                    className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Buka panel audit dan instruksi perbaikan naskah"
                  >
                    <span>🔧 Instruksi Perbaikan Naskah</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Draft State Actions */}
                  {status === 'draft' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSubmit('draft')}
                        className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5 text-slate-600" />
                        <span>Simpan Draft</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmit('review')}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim untuk Review</span>
                      </button>
                    </>
                  )}

                  {/* Review State Actions */}
                  {status === 'review' && (
                    <>
                      <button
                        id="editor-form-revert-draft-btn"
                        type="button"
                        onClick={() => handleRequestRevert()}
                        className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Kembalikan artikel ini ke status Draft"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>↩️ Kembalikan ke Draft</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenRevisionModal()}
                        className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <BadgeAlert className="w-3.5 h-3.5" />
                        <span>⚠️ Perlu Perbaikan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveArticle()}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✅ Setujui & Siap Publikasi</span>
                      </button>
                    </>
                  )}

                  {/* Approved State Actions */}
                  {status === 'approved' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRequestRevert()}
                        className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        ↩️ Kembalikan ke Draft
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmit('approved')}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-slate-300" />
                        <span>Simpan Perubahan</span>
                      </button>
                    </>
                  )}

                  {/* Published State Actions */}
                  {status === 'published' && (
                    <button
                      type="button"
                      onClick={() => handleSubmit('published')}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Simpan Pembaruan / Koreksi</span>
                    </button>
                  )}

                  {/* Publish Button (Only Active When Status === 'approved') */}
                  <div className="relative group">
                    <button
                      id="editor-btn-publish-article"
                      type="button"
                      onClick={() => handleSubmit('published')}
                      disabled={status !== 'approved'}
                      className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md ${
                        status === 'approved'
                          ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer animate-pulse-subtle'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publikasikan Artikel</span>
                    </button>

                    {status !== 'approved' && (
                      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-30 pointer-events-none">
                        {status === 'draft' && 'Artikel harus melalui proses review editorial ("Kirim untuk Review") dan disetujui sebelum dapat dipublikasikan.'}
                        {status === 'review' && 'Artikel masih Dalam Review. Berikan keputusan "Setujui & Siap Publikasi" pada panel Review Editorial.'}
                        {status === 'published' && 'Artikel sudah berstatus Terbit / Publik.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT FAKTA (FACT-CHECKING AUDIT VIEW) */}
          {activeTab === 'factcheck' && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-base">Modul Audit Fakta & Integritas Editorial</h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Memeriksa keselarasan klaim, mendeteksi angka tanpa rujukan, kata superlatif terlarang, serta status hak cipta ilustrasi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
                  <button
                    id="copy-fact-check-top-btn"
                    type="button"
                    onClick={handleCopyFactCheckResult}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-2xs"
                    title="Salin ringkasan hasil pemeriksaan dan audit editorial ke clipboard"
                  >
                    {isCopiedFactCheck ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Hasil Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>📋 Salin Hasil Pemeriksaan</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => runFactCheck(true)}
                    disabled={isFactChecking}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isFactChecking ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengaudit Naskah...</span>
                      </>
                    ) : (
                      <>
                        <SearchCheck className="w-4 h-4" />
                        <span>Jalankan Ulang Audit Fakta</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Fact Check Results Card */}
              {factCheckResult ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    factCheckResult.hasUnverifiedClaims
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}>
                    {factCheckResult.hasUnverifiedClaims ? (
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">
                          {factCheckResult.hasUnverifiedClaims ? '⚠️ Perlu Verifikasi Editor' : '✅ Naskah Terverifikasi Bersih'}
                        </h4>
                        <button
                          type="button"
                          onClick={handleCopyFactCheckResult}
                          className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{isCopiedFactCheck ? 'Tersalin!' : 'Salin Laporan'}</span>
                        </button>
                      </div>
                      <p className="text-xs">{factCheckResult.summary}</p>
                    </div>
                  </div>

                  {/* Source Access & Verification Audit Box */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-blue-600" />
                        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Audit Akses Sumber Rujukan & Integritas Dokumen
                        </h5>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        factCheckResult.sourceAudit?.sourceContentFetched
                          ? 'bg-emerald-100 text-emerald-800'
                          : (factCheckResult.sourceAudit?.sourcesTraceable
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800')
                      }`}>
                        {factCheckResult.sourceAudit?.sourceContentFetched
                          ? 'ISI SUMBER BERHASIL DIAMBIL'
                          : (factCheckResult.sourceAudit?.sourcesTraceable
                              ? 'SUMBER TIDAK DAPAT DIAKSES (TEKNIS)'
                              : 'SUMBER BELUM TERDAFTAR')}
                      </span>
                    </div>

                    <div className="text-xs space-y-2 text-slate-700">
                      <p className="text-slate-600 leading-relaxed">
                        {factCheckResult.sourceAudit?.note || 'Pemeriksaan integritas tautan sumber rujukan naskah.'}
                      </p>

                      {/* Source items detail list */}
                      {factCheckResult.sourceAudit?.sourceStatuses && factCheckResult.sourceAudit.sourceStatuses.length > 0 && (
                        <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Status Tiap Sumber:</span>
                          {factCheckResult.sourceAudit.sourceStatuses.map((srcItem, sIdx) => (
                            <div key={sIdx} className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-start justify-between gap-2 text-[11px]">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800">{srcItem.name}</span>
                                {srcItem.url && (
                                  <div className="text-slate-500 truncate max-w-sm font-mono text-[10px]">
                                    {srcItem.url}
                                  </div>
                                )}
                                {srcItem.technicalError && (
                                  <div className="text-amber-800 text-[10px] font-medium">
                                    Kendala Teknis: {srcItem.technicalError}
                                  </div>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                srcItem.status === 'terverifikasi_mendukung'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : srcItem.status === 'sumber_tidak_dapat_diakses'
                                  ? 'bg-amber-100 text-amber-900'
                                  : srcItem.status === 'tidak_mendukung'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {srcItem.status === 'sumber_tidak_dapat_diakses'
                                  ? 'SUMBER TIDAK DAPAT DIAKSES'
                                  : (srcItem.statusLabel || srcItem.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Explicit editorial notice on technical 404 */}
                      {factCheckResult.sourceAudit?.sourceFetchFailures && factCheckResult.sourceAudit.sourceFetchFailures.length > 0 && (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-600" />
                            <span>Kaidah Penilaian Teknis DenyutGlobal:</span>
                          </div>
                          <p className="text-blue-800 text-[10.5px] leading-relaxed">
                            Kegagalan akses web (seperti HTTP 404, batas bot, atau waktu koneksi habis) <strong>TIDAK dianggap sebagai bukti bahwa fakta naskah salah atau bohong</strong>. Status ditetapkan sebagai "Menunggu Verifikasi Sumber" agar editor dapat melakukan konfirmasi secara manual atau memperbarui URL rujukan.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual / Illustration Audit Status Box (BAGIAN 14) */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-600" />
                        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Status Ilustrasi & Hak Cipta Visual
                        </h5>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        image ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {image ? 'ILUSTRASI TERSEDIA' : 'TANPA ILUSTRASI (LEGAL)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">ILUSTRASI</span>
                        <span className="font-bold text-slate-800">{image ? 'Tersedia' : 'Tidak tersedia'}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">JENIS GAMBAR</span>
                        <span className="font-bold text-slate-800">
                          {imageType === 'ai_illustration' ? 'AI Illustration' : (image ? 'Visual / Dokumen Rujukan' : '-')}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">KREDIT GAMBAR</span>
                        <span className="font-bold text-slate-800">
                          {image ? (imageCredit || 'Ilustrasi AI — DenyutGlobal') : '-'}
                        </span>
                      </div>
                    </div>

                    {image && (
                      <div className="flex items-center gap-3 pt-1">
                        <img
                          src={image}
                          alt="Thumbnail Ilustrasi"
                          className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="text-[11px] text-slate-600">
                          <p className="font-medium truncate max-w-md">{captionGambar || `Ilustrasi editorial: ${title}`}</p>
                          <p className="text-slate-400">{imageCredit || 'Ilustrasi AI — DenyutGlobal'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Issues List if any */}
                  {factCheckResult.unsupportedClaims && factCheckResult.unsupportedClaims.length > 0 && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Klaim / Poin yang Memerlukan Pemeriksaan:</span>
                      </h5>
                      <ul className="space-y-1 text-xs text-rose-800 list-disc list-inside">
                        {factCheckResult.unsupportedClaims.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Forbidden words check */}
                  {factCheckResult.forbiddenKeywordsFound && factCheckResult.forbiddenKeywordsFound.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <strong>Kata Superlatif Tanpa Landasan Eksplisit:</strong> "{factCheckResult.forbiddenKeywordsFound.join('", "')}". Harap ganti dengan bahasa yang lebih netral atau sertakan data rujukan.
                    </div>
                  )}

                  {/* Claims breakdown */}
                  {factCheckResult.claims && factCheckResult.claims.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Rincian Audit Klaim Naskah ({factCheckResult.claims.length} Kalimat Ditelaah)
                      </h5>
                      <div className="divide-y divide-slate-100">
                        {factCheckResult.claims.map((claim, idx) => {
                          const isInaccessible = claim.status === 'pending_source_verification' || claim.sourceStatus === 'sumber_tidak_dapat_diakses';
                          const isVerified = claim.supported && claim.status === 'verified';
                          const isMissingSource = claim.status === 'missing_source';

                          return (
                            <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <p className="text-slate-800">{claim.claim}</p>
                                <div className="flex items-center flex-wrap gap-2 text-[11px]">
                                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                    claim.type === 'fakta' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : claim.type === 'konteks'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {claim.type}
                                  </span>
                                  <span className="text-slate-500">Rujukan: {claim.sourceTrace || 'Sumber terdaftar'}</span>
                                  {claim.issue && (
                                    <span className="text-amber-800 font-medium block w-full text-[10.5px]">
                                      • {claim.issue}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 text-center ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isInaccessible
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : isMissingSource
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {isVerified
                                  ? 'Terverifikasi Didukung'
                                  : isInaccessible
                                  ? 'Menunggu Verifikasi Sumber'
                                  : isMissingSource
                                  ? 'Sumber Belum Ada'
                                  : 'Perlu Verifikasi Data'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-700">Audit Fakta Belum Dijalankan</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Klik tombol di atas untuk memeriksa keselarasan naskah terhadap kaidah integritas fakta DenyutGlobal.
                  </p>
                </div>
              )}

              {/* PANEL INSTRUKSI PERBAIKAN NASKAH (AI REVISION PANEL) */}
              <div className="pt-2">
                <ArticleRevisionPanel
                  currentTitle={title}
                  currentSummary={summary}
                  currentContent={content}
                  currentFacts={facts}
                  currentRoughNotes={roughNotes}
                  currentWhyItMatters={whyItMatters}
                  currentCategory={category}
                  currentLocation={location}
                  sources={sources}
                  factCheckResult={factCheckResult}
                  onApplyRevision={handleApplyRevision}
                />
              </div>
            </div>
          )}

          {/* TAB 3: LIST MANAGEMENT (MANAJEMEN ARTIKEL) */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Filter Status:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'draft', label: 'Draft' },
                      { id: 'review', label: 'Dalam Review' },
                      { id: 'approved', label: 'Siap Publikasi' },
                      { id: 'published', label: 'Published' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setListFilter(tab.id as any)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                          listFilter === tab.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  Menampilkan {filteredArticles.length} artikel redaksi
                </span>
              </div>

              <div className="space-y-3">
                {filteredArticles.map(art => (
                  <div 
                    key={art.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          art.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : art.status === 'approved'
                            ? 'bg-blue-100 text-blue-900 font-black'
                            : art.status === 'review'
                            ? 'bg-amber-100 text-amber-800 font-black'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {art.status === 'published' ? 'Published' : art.status === 'approved' ? 'Siap Publikasi' : art.status === 'review' ? 'Dalam Review' : 'Draft'}
                        </span>

                        {art.editorialRevisionNotes && art.status === 'draft' && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1">
                            <MessageSquareQuote className="w-3 h-3" />
                            <span>Ada Catatan Perbaikan</span>
                          </span>
                        )}

                        {art.isAiGeneratedDraft && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            AI Draft
                          </span>
                        )}

                        <span className="font-bold text-slate-700">{art.kategoriLabel}</span>
                        <span>•</span>
                        <span className="text-slate-500">{art.negaraLokasi}</span>
                        <span>•</span>
                        <span className="text-slate-500">{art.tanggal}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 font-serif-headline">
                        {art.title || art.judul}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {art.summary || art.ringkasan}
                      </p>

                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-0.5">
                        <span>Penulis: {art.author || 'Redaksi'}</span>
                        {art.updatedAt && (
                          <span className="text-amber-600 font-medium">• Diperbarui: {art.updatedAt}</span>
                        )}
                        {art.editorialRevisionNotes && art.status === 'draft' && (
                          <span className="text-amber-700 font-semibold italic">
                            Catatan: "{art.editorialRevisionNotes}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => loadArticleIntoForm(art)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        Edit Naskah
                      </button>

                      {art.status === 'review' && (
                        <>
                          <button
                            onClick={() => handleApproveArticle(art)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Setujui artikel dan jadikan Siap Publikasi"
                          >
                            <Check className="w-3 h-3" />
                            <span>Setujui</span>
                          </button>

                          <button
                            onClick={() => handleOpenRevisionModal(art)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                            title="Minta perbaikan naskah"
                          >
                            <BadgeAlert className="w-3 h-3" />
                            <span>Revisi</span>
                          </button>

                          <button
                            onClick={() => handleRequestRevert(art)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Kembalikan artikel ini ke status Draft"
                          >
                            <Undo2 className="w-3 h-3 text-amber-700" />
                            <span>Draft</span>
                          </button>
                        </>
                      )}

                      {art.status === 'approved' && (
                        <button
                          onClick={() => {
                            loadArticleIntoForm(art);
                            setActiveTab('form');
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Publikasikan</span>
                        </button>
                      )}

                      {onSelectArticlePreview && art.status === 'published' && (
                        <button
                          onClick={() => {
                            onSelectArticlePreview(art);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                        >
                          Lihat Publik
                        </button>
                      )}

                      {onDeleteArticle && (
                        <button
                          onClick={() => onDeleteArticle(art.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Hapus Naskah"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RADAR BERITA SUMBER PRIMER */}
          {activeTab === 'wire' && (
            <RadarBeritaView
              radarItems={radarItems}
              isLoading={isLoadingRadar}
              onRefresh={loadRadarItems}
              onOpenVerification={handleOpenVerificationModal}
              onUseRadarAsDraft={useRadarItemAsDraft}
              onOpenAddModal={() => setIsAddPrimaryModalOpen(true)}
              processingDraftId={processingRadarDraftId}
            />
          )}
        </div>
      </div>

      {/* Confirmation Modal: Kembalikan ke Draft */}
      {isRevertConfirmOpen && (
        <div 
          id="revert-draft-confirm-modal"
          className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            setIsRevertConfirmOpen(false);
            setRevertTargetArticle(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Undo2 className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-serif-headline">
                  Kembalikan Naskah ke Draft?
                </h3>
                <p className="text-xs text-slate-500">
                  Konfirmasi pengembalian status artikel
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <p className="font-medium">
                “Kembalikan artikel ini ke Draft? Artikel tidak akan tampil di portal publik.”
              </p>
              <ul className="text-[11px] text-amber-800 list-disc list-inside space-y-0.5">
                <li>Seluruh isi artikel, ringkasan, dan konteks tetap utuh.</li>
                <li>Tidak menghapus artikel atau mengosongkan formulir.</li>
                <li>Slug, tanggal, dan sumber rujukan tetap dipertahankan.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRevertConfirmOpen(false);
                  setRevertTargetArticle(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="revert-draft-confirm-submit-btn"
                type="button"
                onClick={handleConfirmRevert}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Ya, Kembalikan ke Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Perlu Perbaikan / Revision Needed with Note */}
      {isRevisionModalOpen && (
        <div 
          id="revision-needed-modal"
          className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            setIsRevisionModalOpen(false);
            setRevisionTargetArticle(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <BadgeAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-serif-headline">
                  Catatan Perbaikan Redaksi
                </h3>
                <p className="text-xs text-slate-500">
                  Kembalikan ke Draft dengan instruksi revisi
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Tuliskan poin-poin yang perlu disesuaikan oleh editor sebelum naskah dapat disetujui:
            </p>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saran Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {revisionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (revisionNoteInput.trim()) {
                        setRevisionNoteInput(`${revisionNoteInput}; ${preset}`);
                      } else {
                        setRevisionNoteInput(preset);
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 text-[11px] rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={revisionNoteInput}
                onChange={(e) => setRevisionNoteInput(e.target.value)}
                rows={3}
                placeholder="Contoh: Periksa kembali angka statistik ekspor pada paragraf 2 dan tambahkan konteks kebijakan regional..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRevisionModalOpen(false);
                  setRevisionTargetArticle(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="revision-confirm-submit-btn"
                type="button"
                onClick={handleConfirmRevision}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <BadgeAlert className="w-3.5 h-3.5" />
                <span>Simpan Catatan & Kembalikan ke Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Ganti Foto dengan Ilustrasi AI */}
      {isConfirmReplacePhotoOpen && (
        <div 
          id="confirm-replace-photo-modal"
          className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-serif-headline">
                  Ganti Foto dengan Ilustrasi AI?
                </h3>
                <p className="text-xs text-slate-500">
                  Konfirmasi Penggantian Visual Artikel
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Gunakan ilustrasi AI sebagai pengganti foto yang dipilih? Foto editor yang saat ini dimuat akan digantikan oleh ilustrasi berbasis fakta naskah.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmReplacePhotoOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmReplacePhotoOpen(false);
                  handleGenerateIllustration(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ganti dengan Ilustrasi AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Radar 9-Point Verification Inspector Modal */}
      <RadarVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setSelectedVerificationItem(null);
        }}
        radarItem={selectedVerificationItem}
        onConfirmPrimarySource={handleConfirmPrimarySource}
        onProceedToDraft={useRadarItemAsDraft}
        isProcessingDraft={processingRadarDraftId === selectedVerificationItem?.id}
      />

      {/* Add Custom Primary Topic Modal */}
      <AddPrimaryTopicModal
        isOpen={isAddPrimaryModalOpen}
        onClose={() => setIsAddPrimaryModalOpen(false)}
        onAddRadarItem={handleAddRadarItem}
      />
    </div>
  );
};
