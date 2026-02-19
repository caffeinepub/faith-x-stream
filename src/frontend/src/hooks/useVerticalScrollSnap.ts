import { useEffect, RefObject } from 'react';

interface UseVerticalScrollSnapOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  onScrollEnd?: (index: number) => void;
}

export function useVerticalScrollSnap({ containerRef, onScrollEnd }: UseVerticalScrollSnapOptions) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        if (!container) return;
        
        const scrollTop = container.scrollTop;
        const itemHeight = container.clientHeight;
        const currentIndex = Math.round(scrollTop / itemHeight);
        
        if (onScrollEnd) {
          onScrollEnd(currentIndex);
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [containerRef, onScrollEnd]);
}
