import { useEffect, RefObject } from 'react';

interface UseIntersectionAutoplayOptions {
  itemRefs: RefObject<(HTMLDivElement | null)[]>;
  onVisibilityChange?: (index: number, isVisible: boolean) => void;
  threshold?: number;
}

export function useIntersectionAutoplay({
  itemRefs,
  onVisibilityChange,
  threshold = 0.7,
}: UseIntersectionAutoplayOptions) {
  useEffect(() => {
    const items = itemRefs.current;
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = items.findIndex((item) => item === entry.target);
          if (index !== -1 && onVisibilityChange) {
            onVisibilityChange(index, entry.isIntersecting && entry.intersectionRatio >= threshold);
          }
        });
      },
      {
        threshold: [0, threshold, 1],
        rootMargin: '0px',
      }
    );

    items.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => {
      observer.disconnect();
    };
  }, [itemRefs, onVisibilityChange, threshold]);
}
