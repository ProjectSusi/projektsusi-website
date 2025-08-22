/*
React Frontend Optimization for Phase 2 RAG System
UI Performance improvements for smoother interactions and better UX
*/

import React, { 
  useState, 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect, 
  Suspense,
  lazy,
  memo,
  startTransition,
  useDeferredValue
} from 'react';

// Performance monitoring hook
interface PerformanceMetrics {
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    bundleSize: 0
  });

  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({ ...prev, renderTime }));
      
      // Report to monitoring system
      if (renderTime > 16.67) { // Over 60fps threshold
        console.warn(`${componentName} render took ${renderTime}ms - consider optimization`);
      }
    };
  }, []);

  const measureInteraction = useCallback((interactionType: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      setMetrics(prev => ({ ...prev, interactionTime }));
      
      // Track interaction performance
      if (interactionTime > 100) { // INP threshold
        console.warn(`${interactionType} interaction took ${interactionTime}ms`);
      }
    };
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }, []);

  return {
    metrics,
    measureRenderTime,
    measureInteraction,
    getMemoryUsage
  };
};

// Optimized Search Component with Virtual Scrolling
interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

interface VirtualScrollProps {
  items: SearchResult[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: SearchResult, index: number) => React.ReactNode;
}

const VirtualScroll = memo<VirtualScrollProps>(({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={item.id} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Optimized RAG Interface with Concurrent Features
interface RAGInterfaceProps {
  apiEndpoint: string;
  enableCache?: boolean;
  maxResults?: number;
  debounceMs?: number;
}

export const OptimizedRAGInterface: React.FC<RAGInterfaceProps> = memo(({
  apiEndpoint,
  enableCache = true,
  maxResults = 100,
  debounceMs = 300
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use deferred value for non-urgent updates
  const deferredQuery = useDeferredValue(query);
  
  // Cache for search results
  const cache = useRef(new Map<string, SearchResult[]>());
  const abortController = useRef<AbortController | null>(null);
  
  const { measureRenderTime, measureInteraction } = usePerformanceMonitoring();

  // Debounced search function with caching
  const debouncedSearch = useMemo(
    () => {
      const timeouts = new Map<string, NodeJS.Timeout>();
      
      return (searchQuery: string) => {
        // Cancel previous timeout
        const existingTimeout = timeouts.get(searchQuery);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        // Set new timeout
        const timeout = setTimeout(async () => {
          if (!searchQuery.trim()) {
            setResults([]);
            return;
          }

          // Check cache first
          if (enableCache && cache.current.has(searchQuery)) {
            setResults(cache.current.get(searchQuery)!);
            return;
          }

          setLoading(true);
          setError(null);

          // Cancel previous request
          if (abortController.current) {
            abortController.current.abort();
          }
          abortController.current = new AbortController();

          try {
            const response = await fetch(`${apiEndpoint}/search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: searchQuery,
                max_results: maxResults,
                include_metadata: true
              }),
              signal: abortController.current.signal
            });

            if (!response.ok) {
              throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            const searchResults: SearchResult[] = data.results || [];

            // Cache results
            if (enableCache) {
              cache.current.set(searchQuery, searchResults);
              
              // Limit cache size
              if (cache.current.size > 100) {
                const firstKey = cache.current.keys().next().value;
                if (firstKey) {
                  cache.current.delete(firstKey);
                }
              }
            }

            setResults(searchResults);
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              setError(err.message || 'Search failed');
              setResults([]);
            }
          } finally {
            setLoading(false);
          }

          timeouts.delete(searchQuery);
        }, debounceMs);

        timeouts.set(searchQuery, timeout);
      };
    },
    [apiEndpoint, maxResults, debounceMs, enableCache]
  );

  // Handle query changes with concurrent features
  const handleQueryChange = useCallback((newQuery: string) => {
    const endMeasurement = measureInteraction('query-input');
    
    startTransition(() => {
      setQuery(newQuery);
    });
    
    endMeasurement();
  }, [measureInteraction]);

  // Effect for deferred search
  useEffect(() => {
    debouncedSearch(deferredQuery);
  }, [deferredQuery, debouncedSearch]);

  // Memoized result renderer
  const renderResult = useCallback((result: SearchResult, index: number) => {
    return (
      <div
        key={result.id}
        className="result-item"
        style={{
          padding: '16px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white'
        }}
      >
        <div className="result-score">
          Score: {(result.score * 100).toFixed(1)}%
        </div>
        <div className="result-content">
          {result.content.substring(0, 200)}
          {result.content.length > 200 && '...'}
        </div>
        {result.metadata && (
          <div className="result-metadata">
            {Object.entries(result.metadata).map(([key, value]) => (
              <span key={key} className="metadata-tag">
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const endRenderMeasurement = measureRenderTime('OptimizedRAGInterface');
  
  useEffect(() => {
    endRenderMeasurement();
  });

  return (
    <div className="optimized-rag-interface">
      <div className="search-section">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Enter your search query..."
          className="search-input"
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
        />
        
        {loading && (
          <div className="loading-indicator">
            <div className="spinner" />
            Searching...
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ color: '#ef4444', marginTop: '8px' }}>
            {error}
          </div>
        )}
      </div>

      <div className="results-section" style={{ marginTop: '20px' }}>
        {results.length > 0 && (
          <div className="results-header">
            Found {results.length} results
          </div>
        )}
        
        <Suspense fallback={<div>Loading results...</div>}>
          <VirtualScroll
            items={results}
            itemHeight={120}
            containerHeight={600}
            renderItem={renderResult}
          />
        </Suspense>
      </div>
    </div>
  );
});

// Lazy loaded components for code splitting
// Note: These components would be imported when they exist
// const AdminDashboard = lazy(() => import('./AdminDashboard'));
// const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
// const SettingsPanel = lazy(() => import('./SettingsPanel'));

// Bundle optimization utilities
export class BundleOptimizer {
  private static loadedModules = new Set<string>();
  
  static async loadModuleOnDemand<T>(
    moduleLoader: () => Promise<{ default: T }>,
    moduleName: string
  ): Promise<T> {
    if (this.loadedModules.has(moduleName)) {
      return (await moduleLoader()).default;
    }
    
    const startTime = performance.now();
    const module = await moduleLoader();
    const loadTime = performance.now() - startTime;
    
    console.log(`Module ${moduleName} loaded in ${loadTime}ms`);
    this.loadedModules.add(moduleName);
    
    return module.default;
  }
  
  static preloadModule(moduleLoader: () => Promise<any>, moduleName: string) {
    // Preload during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadModuleOnDemand(moduleLoader, moduleName);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.loadModuleOnDemand(moduleLoader, moduleName);
      }, 0);
    }
  }
}

// Performance optimized context provider
interface PerformanceContextType {
  metrics: PerformanceMetrics;
  reportMetric: (name: string, value: number) => void;
  startMeasurement: (name: string) => () => void;
}

const PerformanceContext = React.createContext<PerformanceContextType | null>(null);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    bundleSize: 0
  });
  
  const measurements = useRef(new Map<string, number>());

  const reportMetric = useCallback((name: string, value: number) => {
    setMetrics(prev => ({ ...prev, [name]: value }));
    
    // Report to external monitoring system
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value
      });
    }
  }, []);

  const startMeasurement = useCallback((name: string) => {
    const startTime = performance.now();
    measurements.current.set(name, startTime);
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      reportMetric(name, duration);
      measurements.current.delete(name);
    };
  }, [reportMetric]);

  const contextValue = useMemo(() => ({
    metrics,
    reportMetric,
    startMeasurement
  }), [metrics, reportMetric, startMeasurement]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within PerformanceProvider');
  }
  return context;
};

// Service Worker for caching and performance
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
        
        // Update available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content available, refresh to update');
              }
            });
          }
        });
      } catch (error) {
        console.log('SW registration failed: ', error);
      }
    });
  }
};

// Web Vitals monitoring
export const initWebVitalsMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Commented out until web-vitals package is installed
    // import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    //   getCLS(console.log);
    //   getFID(console.log);
    //   getFCP(console.log);
    //   getLCP(console.log);
    //   getTTFB(console.log);
    // }).catch(() => {
    //   // web-vitals package not available, silently ignore
    //   console.warn('web-vitals package not available');
    // });
    console.log('Web Vitals monitoring would be initialized here');
  }
};

// Image optimization component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  priority = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  const handleError = useCallback(() => {
    setImageError(true);
  }, []);
  
  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [480, 768, 1024, 1440];
    return sizes.map(size => `${baseSrc}?w=${size} ${size}w`).join(', ');
  };
  
  if (imageError) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280'
        }}
      >
        Failed to load image
      </div>
    );
  }
  
  return (
    <div style={{ position: 'relative', width, height }}>
      {!imageLoaded && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="loading-skeleton" />
        </div>
      )}
      
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {priority && (
        <link rel="preload" as="image" href={src} />
      )}
    </div>
  );
});

// Export all optimizations
export {
  VirtualScroll
  // AdminDashboard,
  // AnalyticsDashboard,
  // SettingsPanel
};