/**
 * Performance Monitoring Utilities
 * Web Vitals and performance optimization helpers
 */

import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// Performance metrics storage
const metrics: Metric[] = [];

/**
 * Initialize performance monitoring
 * Reports Core Web Vitals to console in development
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Only run in production or when explicitly enabled
  const isDev = import.meta.env.DEV;
  const shouldMonitor = isDev || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';

  if (!shouldMonitor) return;

  // Report metrics to console in development
  const reportMetric = (metric: Metric) => {
    metrics.push(metric);
    
    if (isDev) {
      console.log(`[Performance] ${metric.name}: ${metric.value}`, metric);
    }

    // Send to analytics in production
    if (!isDev && 'gtag' in window) {
      // @ts-expect-error - gtag may not be defined
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  };

  // Core Web Vitals
  onCLS(reportMetric);
  onFCP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);

  // Log initial page load time
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        console.log('[Performance] Page Load Time:', perfData.loadEventEnd - perfData.startTime);
      }
    }, 0);
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize function for expensive calculations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number | ReturnType<typeof setTimeout> {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback to setTimeout with 1ms delay
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, 1);
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallback(id: number | ReturnType<typeof setTimeout>): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id as number);
  } else {
    clearTimeout(id);
  }
}




/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
}

/**
 * Prefetch resources for future navigation
 */
export function prefetchResource(href: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Execute function when tab becomes visible
 */
export function onTabVisible(callback: () => void): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      callback();
    }
  });
}

/**
 * Lazy execute function when browser is idle
 */
export function lazyExecute<T>(fn: () => T, timeout = 2000): Promise<T> {
  return new Promise((resolve) => {
    const id = requestIdleCallback(
      () => resolve(fn()),
      { timeout }
    );
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => cancelIdleCallback(id), { once: true });
  });
}

/**
 * Get all collected metrics
 */
export function getMetrics(): Metric[] {
  return [...metrics];
}

/**
 * Clear metrics storage
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

// Performance observer for long tasks
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('[Performance] Long task detected:', entry.duration, 'ms');
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // Long task observer not supported
  }
}
