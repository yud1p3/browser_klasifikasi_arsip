import { useCallback, useRef, useState, useEffect } from 'react';
import { MEILISEARCH_CONFIG, SEARCH_DEFAULTS } from '../utils/constants';

let meiliClient = null;

async function getClient() {
  if (meiliClient) return meiliClient;
  const module = await import('meilisearch');
  const Meilisearch = module.Meilisearch || module.default || module;
  meiliClient = new Meilisearch({
    host: MEILISEARCH_CONFIG.host,
    apiKey: MEILISEARCH_CONFIG.apiKey,
  });
  return meiliClient;
}

export function useMeilisearch() {
  const [client, setClient] = useState(null);
  const [isClientReady, setIsClientReady] = useState(false);

  // Initialize client
  useEffect(() => {
    let cancelled = false;
    getClient().then((c) => {
      if (!cancelled) {
        setClient(c);
        setIsClientReady(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Core search function
  const search = useCallback(async ({
    q = '',
    filter = '',
    limit = SEARCH_DEFAULTS.limit,
    offset = 0,
    semanticRatio = 0,
    embedder = 'miniLM',
    attributesToRetrieve = SEARCH_DEFAULTS.attributesToRetrieve,
  } = {}) => {
    if (!client) return { hits: [], estimatedTotalHits: 0 };
    
    const index = client.index(MEILISEARCH_CONFIG.indexName);
    const searchOptions = {
      limit,
      offset,
      attributesToRetrieve,
      filter: filter || undefined,
    };

    if (semanticRatio > 0) {
      searchOptions.hybrid = { semanticRatio, embedder };
    }

    // Meilisearch client v0.58+ expects: index.search(query, options)
    const result = await index.search(q, searchOptions);
    return {
      hits: result.hits || [],
      estimatedTotalHits: result.estimatedTotalHits || 0,
    };
  }, [client]);

  // Get root nodes (parent_id = 0)
  const getRoots = useCallback(async (offset = 0, limit = SEARCH_DEFAULTS.limit) => {
    return search({
      q: '',
      filter: 'parent_id = 0',
      limit,
      offset,
      semanticRatio: 0,
    });
  }, [search]);

  // Get children by parent_id
  const getChildren = useCallback(async (parentId, offset = 0, limit = SEARCH_DEFAULTS.limit) => {
    return search({
      q: '',
      filter: `parent_id = ${parentId}`,
      limit,
      offset,
      semanticRatio: 0,
    });
  }, [search]);

  // Get single document by id
  const getDocument = useCallback(async (id) => {
    if (!client) return null;
    const index = client.index(MEILISEARCH_CONFIG.indexName);
    return index.getDocument(id);
  }, [client]);

  // Search with text query (for search bar)
  const textSearch = useCallback(async (query, options = {}) => {
    const {
      semanticRatio = 0,
      embedder = 'miniLM',
      filter = '',
      limit = SEARCH_DEFAULTS.limit,
      offset = 0,
    } = options;

    return search({
      q: query,
      filter,
      semanticRatio,
      embedder,
      limit,
      offset,
    });
  }, [search]);

  return {
    client,
    isClientReady,
    search,
    getRoots,
    getChildren,
    getDocument,
    textSearch,
  };
}