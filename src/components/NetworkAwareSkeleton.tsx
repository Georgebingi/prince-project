import { useEffect, useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SkeletonLayout } from './ui/SkeletonLayout';
import { WifiOff, Wifi } from 'lucide-react';

interface NetworkAwareSkeletonProps {
  isLoading: boolean;
  type?: 'dashboard' | 'table' | 'card' | 'form' | 'page';
  children: React.ReactNode;
  minLoadingTime?: number; // Minimum time to show skeleton (ms)
}

export function NetworkAwareSkeleton({ 
  isLoading, 
  type = 'page',
  children,
  minLoadingTime = 500 
}: NetworkAwareSkeletonProps) {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (loadingStartTime === null) {
        setLoadingStartTime(Date.now());
      }
      
      // Show skeleton if slow connection or if loading for more than minLoadingTime
      const shouldShow = isSlowConnection || !isOnline;
      setShowSkeleton(shouldShow);
      
      // If not slow connection, check if we've been loading long enough
      if (!shouldShow && loadingStartTime !== null) {
        const elapsed = Date.now() - loadingStartTime;
        if (elapsed >= minLoadingTime) {
          setShowSkeleton(true);
        }
      }
    } else {
      setLoadingStartTime(null);
      setShowSkeleton(false);
    }
  }, [isLoading, isSlowConnection, isOnline, loadingStartTime, minLoadingTime]);

  if (showSkeleton && isLoading) {
    return (
      <div className="relative">
        {/* Network Status Indicator */}
        {(!isOnline || isSlowConnection) && (
          <div className={`fixed top-4 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
            !isOnline 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {!isOnline ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">No Internet Connection</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Slow Connection Detected</span>
              </>
            )}
          </div>
        )}
        
        <SkeletonLayout type={type} />
      </div>
    );
  }

  return <>{children}</>;
}
