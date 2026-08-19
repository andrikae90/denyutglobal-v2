import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CategoryId, NewsItem } from './types';
import { editorialStore } from './data/editorialStore';
import { newsService } from './services/newsService';
import { getArticleUrl, getArticleSlug, findPublishedArticleBySlugOrId } from './utils/slug';
import { Navbar } from './components/Navbar';
import { BreakingTicker } from './components/BreakingTicker';
import { SampleDataBanner } from './components/SampleDataBanner';
import { HeroNews } from './components/HeroNews';
import { DailyBrief } from './components/DailyBrief';
import { IndonesiaSection } from './components/IndonesiaSection';
import { FeaturedNews } from './components/FeaturedNews';
import { CategorySection } from './components/CategorySection';
import { LatestNews } from './components/LatestNews';
import { ArticleModal } from './components/ArticleModal';
import { EditorModal } from './components/EditorModal';
import { EditorialAuthModal } from './components/EditorialAuthModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { SearchModal } from './components/SearchModal';
import { LegalModal, LegalModalType } from './components/LegalModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { Footer } from './components/Footer';
import { Check, ArrowUp } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  // Editorial articles state
  const [allEditorialArticles, setAllEditorialArticles] = useState<NewsItem[]>(() => {
    return editorialStore.getAllArticles();
  });

  // Public published articles (reviewed = true && status = 'published')
  const publishedArticles = useMemo(() => {
    return allEditorialArticles.filter(
      (item) => item.status === 'published' && item.reviewed === true
    );
  }, [allEditorialArticles]);

  // Synchronous resolution of article from URL on initial load
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const all = editorialStore.getAllArticles();
      const published = all.filter((a) => a.status === 'published' && a.reviewed === true);

      // 1. Direct path check /berita/:slug
      const pathname = window.location.pathname || '';
      const match = pathname.match(/^\/berita\/([^/?#]+)/i);
      if (match && match[1]) {
        const slugOrId = decodeURIComponent(match[1]);
        return findPublishedArticleBySlugOrId(published, slugOrId) || null;
      }

      // 2. Query parameter check ?article=:id
      const searchParams = new URLSearchParams(window.location.search);
      const queryArticle = searchParams.get('article');
      if (queryArticle) {
        return findPublishedArticleBySlugOrId(published, decodeURIComponent(queryArticle)) || null;
      }
    } catch (e) {
      console.warn('Initial URL resolution error:', e);
    }
    return null;
  });

  // 404 slug tracking if /berita/:slug is accessed directly but not found
  const [notFoundSlug, setNotFoundSlug] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const pathname = window.location.pathname || '';
      const match = pathname.match(/^\/berita\/([^/?#]+)/i);
      if (match && match[1]) {
        const slugOrId = decodeURIComponent(match[1]);
        const all = editorialStore.getAllArticles();
        const published = all.filter((a) => a.status === 'published' && a.reviewed === true);
        const found = findPublishedArticleBySlugOrId(published, slugOrId);
        if (!found) {
          return slugOrId;
        }
      }
    } catch (e) {
      console.warn('Initial 404 URL check error:', e);
    }
    return null;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditorialAuthenticated, setIsEditorialAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return false;
    try {
      return sessionStorage.getItem('denyutglobal_editorial_session') === 'active';
    } catch {
      return false;
    }
  });
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Wire reference feeds (BBC, DW, ANTARA) for editor reference
  const [wireFeeds, setWireFeeds] = useState<NewsItem[]>([]);
  const [feedStatus, setFeedStatus] = useState<'live' | 'demo' | 'loading'>('loading');
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(false);
  const [lastFeedUpdate, setLastFeedUpdate] = useState<string>('');

  const loadWireFeeds = useCallback(async (force = false) => {
    setIsLoadingFeed(true);
    try {
      const result = await newsService.getAggregatedNews({ forceRefresh: force });
      if (result.items && result.items.length > 0) {
        setWireFeeds(result.items);
        setFeedStatus(result.status);
        setLastFeedUpdate(result.lastUpdated);
      }
    } catch (err) {
      console.warn('Failed to fetch wire reference feeds', err);
      setFeedStatus('demo');
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  // Fetch articles from API on mount and sync
  const loadArticlesFromApi = useCallback(async () => {
    try {
      if (isEditorialAuthenticated) {
        const fullEditorial = await editorialStore.fetchEditorialArticlesFromApi();
        setAllEditorialArticles(fullEditorial);
      } else {
        const publishedFromApi = await editorialStore.fetchPublishedArticlesFromApi();
        const currentAll = editorialStore.getAllArticles();
        setAllEditorialArticles(currentAll);
      }
    } catch (e) {
      console.warn('Error loading articles from API on mount:', e);
    }
  }, [isEditorialAuthenticated]);

  useEffect(() => {
    loadWireFeeds(false);
    loadArticlesFromApi();
  }, [loadWireFeeds, loadArticlesFromApi]);

  // Handle direct navigation to /berita/:slug if not yet present in initial memory
  useEffect(() => {
    if (notFoundSlug && !selectedArticle) {
      editorialStore.fetchArticleBySlugFromApi(notFoundSlug).then((fetched) => {
        if (fetched && fetched.status === 'published' && fetched.reviewed) {
          setSelectedArticle(fetched);
          setNotFoundSlug(null);
          const currentAll = editorialStore.getAllArticles();
          setAllEditorialArticles(currentAll);
        }
      }).catch((e) => {
        console.warn('Async article slug fetch error:', e);
      });
    }
  }, [notFoundSlug, selectedArticle]);

  // Handle saving an editorial article (API-first with localStorage fallback)
  const handleSaveEditorialArticle = async (articleToSave: NewsItem) => {
    // 1. Instant local update
    const saved = await editorialStore.saveArticleToApi(articleToSave);
    const updatedAll = editorialStore.getAllArticles();
    setAllEditorialArticles(updatedAll);
    
    if (articleToSave.status === 'published') {
      showToast('Artikel berhasil disimpan dan dipublikasikan ke portal');
    } else if (articleToSave.status === 'review') {
      showToast('Artikel dikirim untuk review redaksi');
    } else {
      showToast('Draft naskah artikel berhasil disimpan');
    }
  };

  // Handle deleting an editorial article (API-first with localStorage fallback)
  const handleDeleteEditorialArticle = async (id: string) => {
    await editorialStore.deleteArticleFromApi(id);
    const updatedAll = editorialStore.getAllArticles();
    setAllEditorialArticles(updatedAll);
    showToast('Naskah artikel berhasil dihapus dari database');
  };

  // Open Editorial Desk (Checks authentication first)
  const handleOpenEditorialDesk = useCallback(() => {
    if (isEditorialAuthenticated) {
      setIsEditorOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  }, [isEditorialAuthenticated]);

  // Authentication success handler & auto sync to D1
  const handleAuthenticateEditorial = async () => {
    try {
      sessionStorage.setItem('denyutglobal_editorial_session', 'active');
    } catch (e) {
      console.error('Failed to set editorial session in sessionStorage', e);
    }
    setIsEditorialAuthenticated(true);
    setIsAuthModalOpen(false);
    setIsEditorOpen(true);
    showToast('Akses Ruang Redaksi berhasil dibuka');

    // Trigger background sync from localStorage to server D1
    try {
      const syncResult = await editorialStore.syncLocalToApi();
      if (syncResult.success) {
        const fullEditorial = await editorialStore.fetchEditorialArticlesFromApi();
        setAllEditorialArticles(fullEditorial);
      }
    } catch (syncErr) {
      console.warn('Initial editorial sync warning:', syncErr);
    }
  };

  // Logout / Lock Editorial session
  const handleLogoutEditorial = useCallback(() => {
    try {
      sessionStorage.removeItem('denyutglobal_editorial_session');
    } catch (e) {
      console.error('Failed to remove editorial session from sessionStorage', e);
    }
    setIsEditorialAuthenticated(false);
    setIsEditorOpen(false);
    showToast('Sesi Ruang Redaksi telah dikunci');
  }, []);

  // LocalStorage bookmarks initialization
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return ['art-001'];
    }
    try {
      const saved = localStorage.getItem('denyutglobal_bookmarks');
      return saved ? JSON.parse(saved) : ['art-001'];
    } catch {
      return ['art-001'];
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
    try {
      localStorage.setItem('denyutglobal_bookmarks', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarkedIds]);

  // Scroll listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check URL pathname for /redaksi or query ?redaksi / ?editorial
  useEffect(() => {
    try {
      const pathname = window.location.pathname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      if (
        pathname === '/redaksi' || 
        pathname === '/redaksi/' || 
        pathname === '/editorial' || 
        pathname === '/editorial/' ||
        searchParams.has('redaksi') ||
        searchParams.has('editorial')
      ) {
        if (isEditorialAuthenticated) {
          setIsEditorOpen(true);
        } else {
          setIsAuthModalOpen(true);
        }
      }
    } catch (e) {
      console.warn('URL redaksi route check error:', e);
    }
  }, [isEditorialAuthenticated]);

  // Global keyboard shortcuts (Ctrl+K or / for search, Ctrl+Shift+R for Ruang Redaksi secret shortcut)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Editor Shortcut: Ctrl + Shift + R or Cmd + Shift + R
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        handleOpenEditorialDesk();
        return;
      }

      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenEditorialDesk]);

  // Helper to open an article and update history with /berita/[slug]
  const handleOpenArticle = useCallback((article: NewsItem) => {
    setSelectedArticle(article);
    setNotFoundSlug(null);
    const slug = getArticleSlug(article);
    const targetPath = `/berita/${slug}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ articleId: article.id, slug }, '', targetPath);
    }
  }, []);

  // Helper to close the article modal and return history to /
  const handleCloseArticle = useCallback(() => {
    setSelectedArticle(null);
    setNotFoundSlug(null);
    const currentPath = window.location.pathname;
    const hasArticleQuery = window.location.search.includes('article=');
    if (currentPath.startsWith('/berita') || hasArticleQuery) {
      window.history.pushState(null, '', '/');
    }
  }, []);

  // Handle browser back/forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const pathname = window.location.pathname || '';
        let articleIdentifier: string | null = null;
        let isBeritaPath = false;

        // 1. Check if URL is in /berita/:slug format
        const beritaMatch = pathname.match(/^\/berita\/([^/?#]+)/i);
        if (beritaMatch && beritaMatch[1]) {
          articleIdentifier = decodeURIComponent(beritaMatch[1]);
          isBeritaPath = true;
        }

        // 2. Backward compatibility: check ?article=:idOrSlug query parameter
        if (!articleIdentifier) {
          const params = new URLSearchParams(window.location.search);
          const queryArticle = params.get('article');
          if (queryArticle) {
            articleIdentifier = decodeURIComponent(queryArticle);
          }
        }

        if (articleIdentifier) {
          // Strictly look up published articles for public reader view
          const found = findPublishedArticleBySlugOrId(publishedArticles, articleIdentifier) ||
                        findPublishedArticleBySlugOrId(allEditorialArticles, articleIdentifier);
          if (found) {
            setSelectedArticle(found);
            setNotFoundSlug(null);
          } else {
            setSelectedArticle(null);
            if (isBeritaPath) {
              setNotFoundSlug(articleIdentifier);
            } else {
              setNotFoundSlug(null);
            }
          }
        } else {
          setSelectedArticle(null);
          setNotFoundSlug(null);
        }
      } catch (e) {
        console.warn('Error reading URL article parameter on popstate:', e);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [publishedArticles, allEditorialArticles]);

  // Synchronize canonical URL for active article (e.g. converting ID or old query param to SEO slug)
  useEffect(() => {
    try {
      if (selectedArticle && selectedArticle.status === 'published' && selectedArticle.reviewed) {
        const slug = getArticleSlug(selectedArticle);
        const targetPath = `/berita/${slug}`;
        const currentPath = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        
        if (currentPath !== targetPath || searchParams.has('article')) {
          searchParams.delete('article');
          const remainingSearch = searchParams.toString();
          const newUrl = remainingSearch ? `${targetPath}?${remainingSearch}` : targetPath;
          window.history.replaceState({ articleId: selectedArticle.id, slug }, '', newUrl);
        }
      }
    } catch (e) {
      console.warn('URL synchronization failed:', e);
    }
  }, [selectedArticle]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  const toggleBookmark = (article: NewsItem) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(article.id);
      if (exists) {
        showToast('Dihapus dari artikel tersimpan');
        return prev.filter((id) => id !== article.id);
      } else {
        showToast('Berita berhasil disimpan');
        return [...prev, article.id];
      }
    });
  };

  const handleShare = async (article: NewsItem) => {
    const articleTitle = article.title || article.judul || 'Berita DenyutGlobal';
    const articleSummary = article.summary || article.ringkasan || '';
    const shareUrl = getArticleUrl(article);

    // 1. Check if Web Share API is available on the device/browser
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: articleTitle,
          text: articleSummary ? `${articleTitle}\n\n${articleSummary}` : articleTitle,
          url: shareUrl
        });
        return;
      } catch (err: any) {
        // Handle user cancellation / abort silently without showing disruptive errors
        if (
          err?.name === 'AbortError' || 
          err?.name === 'NotAllowedError' || 
          err?.message?.toLowerCase().includes('abort') || 
          err?.message?.toLowerCase().includes('cancel')
        ) {
          return;
        }
        console.warn('Web Share API error, falling back to clipboard:', err);
      }
    }

    // 2. Fallback: Copy unique article URL to clipboard
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Tautan artikel berhasil disalin ke clipboard');
      } else {
        // Fallback for restricted/legacy environments
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) {
          showToast('Tautan artikel berhasil disalin ke clipboard');
        } else {
          showToast('Gagal menyalin tautan');
        }
      }
    } catch (clipErr) {
      console.warn('Clipboard copy error:', clipErr);
      showToast('Gagal menyalin tautan');
    }
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setActiveCategory(catId);
    if (catId !== 'semua') {
      const section = document.getElementById('latest-news-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectBreaking = (tickerText: string) => {
    const found = publishedArticles.find((n) =>
      tickerText.toLowerCase().includes(n.kategoriLabel.toLowerCase()) ||
      n.judul.toLowerCase().includes(tickerText.slice(0, 15).toLowerCase())
    );
    if (found) {
      handleOpenArticle(found);
    } else if (publishedArticles.length > 0) {
      handleOpenArticle(publishedArticles[0]);
    }
  };

  // Derived datasets from published editorial articles
  const heroItem = useMemo(() => {
    return publishedArticles.find((n) => n.isHero) || publishedArticles[0];
  }, [publishedArticles]);

  const secondaryHeroItems = useMemo(() => {
    const list = publishedArticles.filter((n) => !n.isHero && n.isFeatured);
    if (list.length >= 2) return list.slice(0, 2);
    return publishedArticles.slice(1, 3);
  }, [publishedArticles]);

  const dailyBriefItems = useMemo(() => {
    const brief = publishedArticles.filter((n) => n.isDailyBrief);
    if (brief.length >= 2) {
      return brief.sort((a, b) => (a.briefOrder || 0) - (b.briefOrder || 0));
    }
    return publishedArticles.slice(1, 4);
  }, [publishedArticles]);

  const featuredItems = useMemo(() => {
    const list = publishedArticles.filter((n) => n.isFeatured && !n.isHero);
    if (list.length >= 2) return list.slice(0, 3);
    return publishedArticles.slice(1, 4);
  }, [publishedArticles]);

  const indonesiaItems = useMemo(() => {
    const list = publishedArticles.filter((n) => 
      n.kategori === 'indonesia' || 
      (n.negaraLokasi && n.negaraLokasi.toLowerCase().includes('indonesia')) ||
      (n.location && n.location.toLowerCase().includes('indonesia'))
    );
    if (list.length > 0) return list;
    return publishedArticles.filter((n) => n.kategori === 'indonesia');
  }, [publishedArticles]);

  const savedArticlesList = useMemo(() => {
    return publishedArticles.filter((n) => bookmarkedIds.includes(n.id));
  }, [publishedArticles, bookmarkedIds]);

  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    return publishedArticles.filter(
      (n) => n.id !== selectedArticle.id && n.kategori === selectedArticle.kategori
    ).slice(0, 2);
  }, [publishedArticles, selectedArticle]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    publishedArticles.forEach((item) => {
      counts[item.kategori] = (counts[item.kategori] || 0) + 1;
    });
    return counts;
  }, [publishedArticles]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="denyutglobal-app" className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Editorial System & Integrity Banner */}
      <SampleDataBanner 
        status={feedStatus}
        totalLive={wireFeeds.length}
        lastUpdated={lastFeedUpdate}
        onRefresh={() => loadWireFeeds(true)}
        isLoading={isLoadingFeed}
        publishedCount={publishedArticles.length}
      />

      {/* Breaking News Ticker */}
      <BreakingTicker onSelectBreakingText={handleSelectBreaking} />

      {/* Navbar with Header Branding, Categories, Search, and Bookmarks */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarkCount={bookmarkedIds.length}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If category is 'semua' (Beranda), show the rich editorial portal layout */}
        {activeCategory === 'semua' && !searchQuery ? (
          <>
            {/* 1. Hero / Berita Utama */}
            {heroItem && (
              <HeroNews
                heroItem={heroItem}
                secondaryItems={secondaryHeroItems}
                onSelectArticle={handleOpenArticle}
                isBookmarked={isBookmarked}
                onToggleBookmark={toggleBookmark}
                onShare={handleShare}
              />
            )}

            {/* 2. 5 Berita Dunia yang Perlu Kamu Tahu Hari Ini (Daily Brief) */}
            {dailyBriefItems.length > 0 && (
              <DailyBrief
                briefItems={dailyBriefItems}
                onSelectArticle={handleOpenArticle}
                onOpenSubscription={() => setIsSubscriptionOpen(true)}
              />
            )}

            {/* 3. 🇮🇩 Berita Indonesia Hari Ini */}
            <IndonesiaSection
              indonesiaItems={indonesiaItems}
              onSelectArticle={handleOpenArticle}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
              onViewAllIndonesia={() => handleSelectCategory('indonesia')}
            />

            {/* 4. Berita Pilihan Redaksi (Featured News) */}
            {featuredItems.length > 0 && (
              <FeaturedNews
                featuredItems={featuredItems}
                onSelectArticle={handleOpenArticle}
                isBookmarked={isBookmarked}
                onToggleBookmark={toggleBookmark}
              />
            )}

            {/* 5. Kategori Berita (Interactive Category Cards) */}
            <CategorySection
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              newsCountPerCategory={categoryCounts}
            />

            {/* 6. Berita Terbaru (Latest News Stream) */}
            <LatestNews
              articles={publishedArticles}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectArticle={handleOpenArticle}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
              onShare={handleShare}
            />
          </>
        ) : (
          /* When filtered by category or active search query, display the focused stream view */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  {activeCategory !== 'semua' ? 'Rubrik Terpilih' : 'Hasil Pencarian'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-headline capitalize mt-1">
                  {activeCategory !== 'semua' ? `Berita ${activeCategory}` : 'Semua Berita'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Menampilkan arsip dan laporan editorial terkait topik {activeCategory}.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveCategory('semua');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer self-start sm:self-auto"
              >
                ← Kembali ke Beranda Utama
              </button>
            </div>

            <LatestNews
              articles={publishedArticles}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectArticle={handleOpenArticle}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
              onShare={handleShare}
            />
          </div>
        )}
      </main>

      {/* Floating Back to Top button */}
      {showScrollTop && (
        <button
          id="scroll-to-top-button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 p-3 bg-slate-900 hover:bg-rose-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
          title="Kembali ke atas"
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="global-toast-notification"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 404 Not Found Modal for unknown /berita/[slug] */}
      {notFoundSlug && (
        <div 
          id="article-not-found-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <span className="text-xl font-black font-mono">404</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-headline">
              Artikel Tidak Ditemukan
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Tautan artikel <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md break-all">/berita/{notFoundSlug}</span> tidak ditemukan atau belum dipublikasikan oleh Redaksi DenyutGlobal.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCloseArticle}
                className="w-full px-5 py-2.5 bg-slate-900 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition duration-150 cursor-pointer shadow-xs"
              >
                Kembali ke Beranda Utama
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Authentication Gate Modal */}
      <EditorialAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticateEditorial}
      />

      {/* Editorial Desk / Admin Editor Modal (Mounted ONLY when authenticated) */}
      {isEditorialAuthenticated && (
        <EditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          articles={allEditorialArticles}
          onSaveArticle={handleSaveEditorialArticle}
          onDeleteArticle={handleDeleteEditorialArticle}
          referenceFeeds={wireFeeds}
          onSelectArticlePreview={(art) => handleOpenArticle(art)}
          onLogout={handleLogoutEditorial}
        />
      )}

      {/* Full Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={handleCloseArticle}
        onSelectArticle={handleOpenArticle}
        relatedArticles={relatedArticles}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        onShare={handleShare}
        onOpenLegalModal={setLegalModalType}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedArticles={savedArticlesList}
        onSelectArticle={handleOpenArticle}
        onRemoveBookmark={toggleBookmark}
        onClearAll={() => {
          setBookmarkedIds([]);
          showToast('Seluruh artikel tersimpan telah dibersihkan');
        }}
      />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={publishedArticles}
        onSelectArticle={handleOpenArticle}
      />

      {/* Subscription / Newsletter Daily Brief Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        onOpenLegalModal={setLegalModalType}
      />

      {/* Legal & About Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
        onSelectModal={setLegalModalType}
      />

      {/* Comprehensive Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenLegalModal={setLegalModalType}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
      />
    </div>
  );
}
