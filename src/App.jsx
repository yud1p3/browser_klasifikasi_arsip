import { useState, useEffect, useCallback, useRef } from 'react';
import { useMeilisearch } from './hooks/useMeilisearch';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import { useDebounce } from './hooks/useDebounce';
import { Breadcrumb } from './components/Breadcrumb';
import { SearchBar } from './components/SearchBar';
import { ClassificationCard } from './components/ClassificationCard';
import { LoadingSkeleton, LoadingOverlay } from './components/LoadingSkeleton';
import { InitialState, NoResultsState, ErrorState, EmptyState } from './components/EmptyState';
import { SEARCH_DEFAULTS } from './utils/constants';

function App() {
  // Meilisearch
  const { 
    isClientReady, 
    getRoots, 
    getChildren, 
    getDocument,
    textSearch 
  } = useMeilisearch();

  // Navigation state
  const [currentPath, setCurrentPath] = useState([]);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Data state
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [totalHits, setTotalHits] = useState(0);
  const offsetRef = useRef(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('simple');
  const [semanticRatio, setSemanticRatio] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchTotalHits, setSearchTotalHits] = useState(0);
  const searchOffsetRef = useRef(0);

  const isSearchView = searchQuery.trim().length >= 2;

  const clearSearchState = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchHasMore(false);
    setSearchTotalHits(0);
    setIsSearching(false);
    searchOffsetRef.current = 0;
  }, []);

  // UI state
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Load root nodes or children
  const loadItems = useCallback(async (parentId = null, offset = 0, append = false) => {
    if (!isClientReady) return;
    
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      let result;
      if (parentId === null) {
        result = await getRoots(offset, SEARCH_DEFAULTS.limit);
      } else {
        result = await getChildren(parentId, offset, SEARCH_DEFAULTS.limit);
      }

      const newItems = result.hits || [];
      const estimatedTotal = result.estimatedTotalHits || 0;

      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
        offsetRef.current = 0;
      }
      offsetRef.current = offset + newItems.length;
      setHasMore(offsetRef.current < estimatedTotal);
      setTotalHits(estimatedTotal);
    } catch (err) {
      console.error('Load items error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [isClientReady, getRoots, getChildren]);

  // Load more for navigation
  const loadMoreItems = useCallback(() => {
    if (isLoadingMore || !hasMore || isSearchView) return;
    loadItems(currentParentId, offsetRef.current, true);
  }, [isLoadingMore, hasMore, isSearchView, loadItems, currentParentId]);

  // Search handler
  const handleSearch = useCallback(async (query, { mode, semanticRatio: ratio }) => {
    if (!isClientReady || !query.trim()) {
      setSearchResults([]);
      setSearchHasMore(false);
      setSearchTotalHits(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchMode(mode);
    setSemanticRatio(ratio);
    searchOffsetRef.current = 0;

    try {
      const filter = currentParentId ? `parent_id = ${currentParentId}` : '';
      const result = await textSearch(query, {
        semanticRatio: ratio,
        filter,
        limit: SEARCH_DEFAULTS.limit,
        offset: 0,
      });

      const hits = result.hits || [];
      setSearchResults(hits);
      setSearchTotalHits(result.estimatedTotalHits || 0);
      searchOffsetRef.current = hits.length;
      setSearchHasMore(hits.length >= SEARCH_DEFAULTS.limit && result.estimatedTotalHits > SEARCH_DEFAULTS.limit);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  }, [isClientReady, textSearch, currentParentId]);

  // Load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (!isClientReady || !searchHasMore || isSearching || !debouncedQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const filter = currentParentId ? `parent_id = ${currentParentId}` : '';
      const result = await textSearch(debouncedQuery, {
        semanticRatio: semanticRatio,
        filter,
        limit: SEARCH_DEFAULTS.limit,
        offset: searchOffsetRef.current,
      });

      const newHits = result.hits || [];
      setSearchResults(prev => [...prev, ...newHits]);
      searchOffsetRef.current += newHits.length;
      const latestTotal = result.estimatedTotalHits || 0;
      setSearchTotalHits(prev => Math.max(prev, latestTotal));
      setSearchHasMore(searchOffsetRef.current < latestTotal);
    } catch (err) {
      console.error('Load more search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [isClientReady, textSearch, searchHasMore, isSearching, debouncedQuery, semanticRatio, currentParentId]);

  // Infinite scroll for navigation (MUST be after loadMoreItems is defined)
  const { setSentinel } = useInfiniteScroll({
    onLoadMore: loadMoreItems,
    hasMore: isSearchView ? false : hasMore,
    isLoading: isSearchView ? false : isLoadingMore,
  });

  // Infinite scroll for search (MUST be after loadMoreSearchResults is defined)
  const { setSentinel: setSearchSentinel } = useInfiniteScroll({
    onLoadMore: loadMoreSearchResults,
    hasMore: searchHasMore,
    isLoading: false,
  });

  // Handle breadcrumb click
  const handleBreadcrumbClick = useCallback((item, index) => {
    if (item.disabled) return;
    
    if (index === 0) {
      setCurrentPath([]);
      setCurrentParentId(null);
      setCurrentLevel(1);
      clearSearchState();
      loadItems(null);
    } else {
      const newPath = currentPath.slice(0, index);
      setCurrentPath(newPath);
      const targetNode = currentPath[index - 1];
      setCurrentParentId(targetNode.id);
      setCurrentLevel(index + 1);
      clearSearchState();
      loadItems(targetNode.id);
    }
  }, [currentPath, loadItems, clearSearchState]);
  // Handle Induk click (go to parent)
  const handleIndukClick = useCallback(async (hit) => {
    if (!hit.parent_id || hit.parent_id === '0') {
      setCurrentPath([]);
      setCurrentParentId(null);
      setCurrentLevel(1);
      clearSearchState();
      loadItems(null);
      return;
    }

    const parentId = hit.parent_id;

    // Try to find parent in currentPath (works for navigation)
    const parentIndex = currentPath.findIndex(n => n.id === parentId);
    if (parentIndex >= 0) {
      const newPath = currentPath.slice(0, parentIndex + 1);
      setCurrentPath(newPath);
      setCurrentLevel(parentIndex + 2);
      setCurrentParentId(parentId);
      clearSearchState();
      loadItems(parentId);
      return;
    }

    // Parent not in currentPath (e.g., from search results) - fetch parent to build path
    try {
      const parentDoc = await getDocument(parentId);
      if (parentDoc) {
        // Build path by fetching ancestors up to root
        const newPath = [];
        let current = parentDoc;
        while (current && current.parent_id && current.parent_id !== '0') {
          newPath.unshift({ id: current.id, kode: current.kode, deskripsi: current.deskripsi });
          current = await getDocument(current.parent_id);
        }
        if (current) {
          newPath.unshift({ id: current.id, kode: current.kode, deskripsi: current.deskripsi });
        }
        // Add the parent itself at the end
        newPath.push({ id: parentDoc.id, kode: parentDoc.kode, deskripsi: parentDoc.deskripsi });

        setCurrentPath(newPath);
        setCurrentLevel(newPath.length + 1);
        setCurrentParentId(parentId);
      } else {
        // Fallback: just go up one level from current path
        if (currentPath.length > 0) {
          const newPath = currentPath.slice(0, -1);
          setCurrentPath(newPath);
          setCurrentLevel(newPath.length + 1);
          if (newPath.length > 0) {
            setCurrentParentId(newPath[newPath.length - 1].id);
          } else {
            setCurrentParentId(null);
          }
        } else {
          setCurrentPath([]);
          setCurrentParentId(null);
          setCurrentLevel(1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch parent for breadcrumb:', err);
      // Fallback to simple parent load
      setCurrentParentId(parentId);
    }
    clearSearchState();
    loadItems(parentId);
  }, [currentPath, loadItems, clearSearchState, getDocument]);

  // Handle Sub Klas click
  const handleSubKlasClick = useCallback(async (hit) => {
    setCurrentPath(prev => [...prev, { id: hit.id, kode: hit.kode, deskripsi: hit.deskripsi }]);
    setCurrentParentId(hit.id);
    setCurrentLevel(prev => prev + 1);
    clearSearchState();
    await loadItems(hit.id);
  }, [loadItems, clearSearchState]);

  // Toggle detail expansion
  const handleDetailToggle = useCallback((id, expanded) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  // Check children cache
  const [childrenCache, setChildrenCache] = useState({});
  
  const getHasChildren = (hit) => {
    if (childrenCache[hit.id] !== undefined) return childrenCache[hit.id];
    const klaster = Number(hit.klaster) || 1;
    return klaster < 7;
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', query: '', disabled: false },
    ...currentPath.map((node, idx) => ({
      label: node.kode,
      query: `nav:${node.id}`,
      disabled: idx === currentPath.length - 1,
    })),
  ];

  // Initial load - roots
  useEffect(() => {
    if (isClientReady && currentParentId === null && !isSearchView) {
      loadItems(null);
    }
  }, [isClientReady, currentParentId, loadItems, isSearchView]);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      handleSearch(debouncedQuery, { mode: searchMode, semanticRatio: semanticRatio });
    } else if (!debouncedQuery) {
      setSearchResults([]);
      setSearchHasMore(false);
      setSearchTotalHits(0);
      setIsSearching(false);
    }
  }, [debouncedQuery, searchMode, semanticRatio, handleSearch]);

  // Current display items
  const displayItems = isSearchView ? searchResults : items;
  const displayHasMore = isSearchView ? searchHasMore : hasMore;
  const displayTotalHits = isSearchView ? searchTotalHits : totalHits;
  const displaySetSentinel = isSearchView ? setSearchSentinel : setSentinel;

  // Determine level for each item (for styling)
  const getItemLevel = (hit) => {
    if (hit.klaster) return Number(hit.klaster);
    return currentLevel;
  };

  if (!isClientReady) {
    return (
      <LoadingOverlay message="Menghubungkan ke Meilisearch..." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - sticky with breadcrumb & search */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3">
          {/* Logo & Institusi */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/lambang-blitar.webp"
              alt="Lambang Kabupaten Blitar"
              className="h-12 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide leading-tight">
                Pemerintah Kabupaten Blitar
              </span>
              <span className="text-base font-bold text-blue-900 leading-tight">
                Dinas Perpustakaan dan Kearsipan
              </span>
            </div>
            <div className="hidden sm:flex items-center ml-auto text-xs text-gray-400">
              {displayTotalHits > 0 && (
                <>
                  <span className="font-mono text-blue-600 font-semibold">{displayTotalHits.toLocaleString()}</span>
                  <span className="ml-1">klasifikasi</span>
                </>
              )}
            </div>
          </div>

          {/* Judul Aplikasi */}
          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-800">
              Browser Klasifikasi Arsip
            </h1>
          </div>

          {/* Breadcrumb */}
          <div className="mb-4">
            <Breadcrumb items={breadcrumbItems} onItemClick={handleBreadcrumbClick} />
          </div>

          {/* Search Bar */}
          <div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder={currentParentId
                ? `Cari di dalam ${currentPath[currentPath.length - 1]?.kode}...`
                : 'Cari kode klasifikasi (min. 2 karakter)...'}
              isLoading={isLoading || isSearching}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Content Area */}
        <div className="space-y-4">
          {/* Loading State */}
          {(isLoading || isSearching) && displayItems.length === 0 && (
            <LoadingSkeleton count={5} />
          )}

          {/* Error State */}
          {error && !isLoading && !isSearching && displayItems.length === 0 && (
            <ErrorState 
              message={error} 
              onRetry={() => loadItems(currentParentId)} 
            />
          )}

          {/* Initial State */}
          {!isLoading && !isSearching && displayItems.length === 0 && !error && !searchQuery && currentParentId === null && (
            <InitialState onNavigateRoot={() => loadItems(null)} />
          )}

          {/* No Results */}
          {!isLoading && !isSearching && displayItems.length === 0 && searchQuery && !error && (
            <NoResultsState 
              query={searchQuery} 
              onClear={() => setSearchQuery('')} 
            />
          )}

          {/* Results Grid */}
          {displayItems.length > 0 && (
            <>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label={isSearchView ? `Hasil pencarian: ${searchQuery}` : 'Daftar klasifikasi'}>
                {displayItems.map((hit, index) => (
                  <ClassificationCard
                    key={hit.id}
                    hit={hit}
                    onIndukClick={handleIndukClick}
                    onSubKlasClick={handleSubKlasClick}
                    isSelected={expandedItems.has(hit.id)}
                    onSelectToggle={handleDetailToggle}
                    hasChildren={getHasChildren(hit)}
                    level={getItemLevel(hit)}
                  />
                ))}
              </div>

              {/* Load More Sentinel */}
              <div ref={displaySetSentinel} className="h-4" aria-hidden="true">
                {displayHasMore && !isLoadingMore && !isSearching && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={() => displayHasMore && (isSearchView ? loadMoreSearchResults() : loadMoreItems())}
                      disabled={isLoadingMore || isSearching}
                      className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoadingMore || isSearching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          Memuat...
                        </>
                      ) : (
                        'Muat Lebih Banyak'
                      )}
                    </button>
                  </div>
                )}
                {!displayHasMore && displayItems.length > 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">
                    {isSearchView 
                      ? `Menampilkan ${displayItems.length} dari ${displayTotalHits} hasil` 
                      : 'Semua data telah dimuat'}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Empty state when navigating but no children */}
          {!isLoading && !isSearching && displayItems.length === 0 && currentParentId && !searchQuery && !error && (
            <div className="text-center py-12">
              <EmptyState
                title="Tidak ada sub-klasifikasi"
                description={`Klasifikasi ${currentPath[currentPath.length - 1]?.kode} tidak memiliki anak.`}
                icon={
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;