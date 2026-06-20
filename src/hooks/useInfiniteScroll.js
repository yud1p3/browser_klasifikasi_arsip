import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll({
  onLoadMore,
  hasMore = true,
  isLoading = false,
  threshold = 200,
  rootMargin = '200px',
}) {
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const setSentinel = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    sentinelRef.current = node;
    if (node && hasMore && !isLoading) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        { rootMargin, threshold: 0 }
      );
      observerRef.current.observe(node);
    }
  }, [onLoadMore, hasMore, isLoading, rootMargin]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { setSentinel, sentinelRef };
}