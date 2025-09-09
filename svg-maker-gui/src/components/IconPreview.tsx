import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FileImage } from 'lucide-react';
import { GitHubFile } from '../services/githubService';
import { ParsedIcon } from '../services/iconRepositoryParsers';
import { iconCacheService } from '../services/iconCacheService';

// Priority loading queue for managing load order
class PriorityLoadQueue {
  private static instance: PriorityLoadQueue;
  private queue: Array<{ load: () => Promise<void>, priority: number, id: string }> = [];
  private loading = new Set<string>();
  private maxConcurrent = 3;

  static getInstance() {
    if (!PriorityLoadQueue.instance) {
      PriorityLoadQueue.instance = new PriorityLoadQueue();
    }
    return PriorityLoadQueue.instance;
  }

  addToQueue(id: string, loadFn: () => Promise<void>, priority: number) {
    if (this.loading.has(id)) return;
    
    this.queue = this.queue.filter(item => item.id !== id);
    this.queue.push({ load: loadFn, priority, id });
    this.queue.sort((a, b) => b.priority - a.priority);
    
    this.processQueue();
  }

  private async processQueue() {
    if (this.loading.size >= this.maxConcurrent || this.queue.length === 0) return;

    const next = this.queue.shift();
    if (!next) return;

    this.loading.add(next.id);
    
    try {
      await next.load();
    } catch (error) {
      console.warn(`Failed to load icon ${next.id}:`, error);
    } finally {
      this.loading.delete(next.id);
      setTimeout(() => this.processQueue(), 10);
    }
  }
}

// Shared IntersectionObserver for performance
let sharedObserver: IntersectionObserver | null = null;
const observerCallbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();

const getSharedObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = observerCallbacks.get(entry.target);
          if (callback) callback(entry);
        });
      },
      { 
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '100px'
      }
    );
  }
  return sharedObserver;
};

interface IconPreviewProps {
  file: GitHubFile;
}

export const IconPreview = React.memo<IconPreviewProps>(({ file }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [priority, setPriority] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const loadQueue = useMemo(() => PriorityLoadQueue.getInstance(), []);

  // Use shared Intersection Observer
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = getSharedObserver();
    const callback = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        const visibilityRatio = entry.intersectionRatio;
        const newPriority = Math.floor(visibilityRatio * 100);
        setPriority(newPriority);
        setShouldLoad(true);
      } else {
        setPriority(0);
      }
    };

    observerCallbacks.set(element, callback);
    observer.observe(element);

    return () => {
      observerCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    
    let isMounted = true;
    const abortController = new AbortController();
    const iconId = file.sha || file.path;
    
    const loadSvgContent = async () => {
      if (!file.download_url) {
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setError(false);
        }
        
        const iconForCache: ParsedIcon = {
          id: iconId,
          repository: 'github-file',
          downloadUrl: file.download_url || '',
          name: file.name,
          displayName: file.name.replace('.svg', ''),
          category: 'Icons',
          tags: [],
          fileName: file.name,
          path: file.path,
          size: file.size || 0,
          svgContent: ''
        };
        
        let rawSvg: string;
        try {
          rawSvg = await iconCacheService.getSvgContent(iconForCache);
        } catch {
          const response = await fetch(file.download_url, {
            signal: abortController.signal
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          rawSvg = await response.text();
        }
        
        if (isMounted) {
          const cleanedSvg = rawSvg
            .replace(/width="[^"]*"/gi, '')
            .replace(/height="[^"]*"/gi, '')
            .replace(/<svg([^>]*)>/i, '<svg$1 width="20" height="20">');
          
          setSvgContent(cleanedSvg);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          console.error('Failed to load SVG content:', err);
          setError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadQueue.addToQueue(iconId, loadSvgContent, priority);
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoad, file.download_url, priority, loadQueue]);

  if (!shouldLoad || isLoading) {
    return (
      <div ref={elementRef} className="icon-preview icon-preview-loading">
        {shouldLoad ? <div className="loading-spinner" /> : <FileImage size={20} className="icon-preview-placeholder" />}
      </div>
    );
  }

  if (error || !svgContent) {
    return (
      <div 
        ref={elementRef} 
        className="icon-preview icon-preview-error" 
        title={`Failed to load ${file.name}`}
      >
        <FileImage size={20} className="icon-preview-fallback" />
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      className="icon-preview" 
      dangerouslySetInnerHTML={{ __html: svgContent }}
      title={file.name}
    />
  );
});

IconPreview.displayName = 'IconPreview';