/**
 * VirtualizedList Component
 * Efficiently renders large lists by only showing visible items
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  keyExtractor?: (item: T, index: number) => string;
  emptyComponent?: React.ReactNode;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

/**
 * VirtualizedList - Renders only visible items for performance
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className = '',
  onEndReached,
  endReachedThreshold = 100,
  keyExtractor,
  emptyComponent,
  headerComponent,
  footerComponent,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate visible range
  const { virtualItems, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    
    const virtualItems = items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));

    return { virtualItems, totalHeight };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  // Handle scroll with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newScrollTop = target.scrollTop;
    setScrollTop(newScrollTop);
    
    // Set scrolling state for performance optimization
    if (!isScrolling) {
      setIsScrolling(true);
    }
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Reset scrolling state after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Check if end is reached
    if (onEndReached) {
      const scrollBottom = newScrollTop + containerHeight;
      const threshold = totalHeight - endReachedThreshold;
      
      if (scrollBottom >= threshold) {
        onEndReached();
      }
    }
  }, [containerHeight, totalHeight, endReachedThreshold, onEndReached, isScrolling]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (items.length === 0 && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {headerComponent}
      
      <div style={{ position: 'relative', height: totalHeight }}>
        {virtualItems.map(({ item, index, style }) => (
          <div
            key={keyExtractor ? keyExtractor(item, index) : `item-${index}`}
            style={style}
            className={isScrolling ? 'will-change-transform' : ''}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {footerComponent}
    </div>
  );
}

/**
 * WindowVirtualizedList - Virtualized list using window as scroll container
 */
interface WindowVirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  keyExtractor?: (item: T, index: number) => string;
}

export function WindowVirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  className = '',
  keyExtractor,
}: WindowVirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleScroll = () => setScrollTop(window.scrollY);
    const handleResize = () => setWindowHeight(window.innerHeight);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { virtualItems, totalHeight, paddingTop, paddingBottom } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(windowHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    
    const virtualItems = items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));

    const paddingTop = startIndex * itemHeight;
    const paddingBottom = (items.length - endIndex) * itemHeight;

    return { virtualItems, totalHeight, paddingTop, paddingBottom };
  }, [items, itemHeight, scrollTop, windowHeight, overscan]);

  return (
    <div className={className} style={{ height: totalHeight }}>
      <div style={{ paddingTop, paddingBottom }}>
        {virtualItems.map(({ item, index }) => (
          <div
            key={keyExtractor ? keyExtractor(item, index) : `item-${index}`}
            style={{ height: itemHeight }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * GridVirtualizedList - Virtualized grid layout
 */
interface GridVirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  overscan?: number;
  className?: string;
  keyExtractor?: (item: T, index: number) => string;
}

export function GridVirtualizedList<T>({
  items,
  renderItem,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 0,
  overscan = 2,
  className = '',
  keyExtractor,
}: GridVirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Calculate grid dimensions
  const { columns, rows, totalWidth, totalHeight } = useMemo(() => {
    const columns = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const rows = Math.ceil(items.length / columns);
    const totalWidth = columns * (itemWidth + gap) - gap;
    const totalHeight = rows * (itemHeight + gap) - gap;
    return { columns, rows, totalWidth, totalHeight };
  }, [containerWidth, itemWidth, itemHeight, gap, items.length]);

  // Calculate visible range
  const virtualItems = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const endRow = Math.min(
      rows,
      startRow + Math.ceil(containerHeight / (itemHeight + gap)) + overscan * 2
    );
    
    const startCol = Math.max(0, Math.floor(scrollLeft / (itemWidth + gap)) - overscan);
    const endCol = Math.min(
      columns,
      startCol + Math.ceil(containerWidth / (itemWidth + gap)) + overscan * 2
    );

    const visibleItems: { item: T; index: number; style: React.CSSProperties }[] = [];

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const index = row * columns + col;
        if (index >= items.length) continue;

        visibleItems.push({
          item: items[index],
          index,
          style: {
            position: 'absolute',
            top: row * (itemHeight + gap),
            left: col * (itemWidth + gap),
            width: itemWidth,
            height: itemHeight,
          },
        });
      }
    }

    return visibleItems;
  }, [items, columns, rows, scrollTop, scrollLeft, containerHeight, containerWidth, itemHeight, itemWidth, gap, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ position: 'relative', width: totalWidth, height: totalHeight }}>
        {virtualItems.map(({ item, index, style }) => (
          <div
            key={keyExtractor ? keyExtractor(item, index) : `item-${index}`}
            style={style}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
