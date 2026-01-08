import { LoadingSpinner } from './ui/LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
}

export function LoadingOverlay({ isLoading, text = 'Loading...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}
