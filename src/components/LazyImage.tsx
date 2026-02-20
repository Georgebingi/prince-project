/**
 * LazyImage Component
 * Optimized image loading with blur-up effect and responsive support
 */

import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
  sizes?: string;
  srcSet?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  priority?: boolean;
  blur?: boolean;
}

/**
 * LazyImage - Optimized image component with lazy loading
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc,
  className = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  sizes,
  srcSet,
  objectFit = 'cover',
  onLoad,
  onError,
  priority = false,
  blur = true,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Load image when in viewport
  useEffect(() => {
    if (!isInViewport) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      onError?.(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
    
    if (img.complete) {
      setImageSrc(src);
      setIsLoaded(true);
    }
  }, [isInViewport, src, onLoad, onError]);

  // Generate blur placeholder style
  const blurStyle = blur && !isLoaded ? {
    filter: 'blur(10px)',
    transform: 'scale(1.1)',
  } : {
    filter: 'blur(0px)',
    transform: 'scale(1)',
  };

  const transitionStyle = {
    transition: 'filter 0.3s ease-out, transform 0.3s ease-out, opacity 0.3s ease-out',
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {hasError && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={{ width, height }}
        >
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc || placeholderSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        sizes={sizes}
        srcSet={srcSet}
        className={`w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          objectFit,
          ...blurStyle,
          ...transitionStyle,
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

interface ResponsiveImageProps extends Omit<LazyImageProps, 'srcSet' | 'sizes'> {
  src: string;
  widths?: number[];
  sizes?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  widths = [320, 640, 960, 1280, 1920],
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props
}) => {
  const srcSet = React.useMemo(() => {
    return widths
      .map((width) => {
        const url = src.includes('?') 
          ? `${src}&w=${width}` 
          : `${src}?w=${width}`;
        return `${url} ${width}w`;
      })
      .join(', ');
  }, [src, widths]);

  return (
    <LazyImage
      {...props}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
    />
  );
};

interface BackgroundImageProps {
  src: string;
  placeholderSrc?: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayClassName?: string;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  placeholderSrc,
  className = '',
  children,
  overlay = false,
  overlayClassName = 'bg-black/50',
}) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
          };
          img.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'opacity 0.3s ease-out',
        opacity: isLoaded ? 1 : 0.5,
      }}
    >
      {overlay && (
        <div className={`absolute inset-0 ${overlayClassName}`} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
