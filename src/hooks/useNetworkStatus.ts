import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
  });

  useEffect(() => {
    // Check connection type if available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      
      // Determine if connection is slow
      let isSlowConnection = false;
      let effectiveType: string | undefined;
      let downlink: number | undefined;
      let rtt: number | undefined;

      if (connection) {
        effectiveType = connection.effectiveType;
        downlink = connection.downlink;
        rtt = connection.rtt;

        // Consider 2g, slow-2g, or low downlink as slow connection
        isSlowConnection = 
          effectiveType === '2g' || 
          effectiveType === 'slow-2g' ||
          (downlink !== undefined && downlink < 1.5) || // Less than 1.5 Mbps
          (rtt !== undefined && rtt > 1000); // More than 1 second RTT
      } else {
        // Fallback: assume slow if offline or unknown
        isSlowConnection = !isOnline;
      }

      setNetworkStatus({
        isOnline,
        isSlowConnection,
        effectiveType,
        downlink,
        rtt,
      });
    };

    // Initial check
    updateNetworkStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Listen for connection changes if available
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}
