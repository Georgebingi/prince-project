import { Skeleton } from './Skeleton';

interface SkeletonLayoutProps {
  type?: 'dashboard' | 'table' | 'card' | 'form' | 'page';
}

export function SkeletonLayout({ type = 'page' }: SkeletonLayoutProps) {
  if (type === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton height={32} width="200px" />
          <Skeleton height={16} width="400px" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <Skeleton height={16} width="60%" />
              <Skeleton height={32} width="40%" />
              <Skeleton height={12} width="80%" />
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton height={24} width="150px" />
            <Skeleton height={200} />
          </div>
          <div className="space-y-4">
            <Skeleton height={24} width="150px" />
            <Skeleton height={200} />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Skeleton height={32} width="200px" />
          <Skeleton height={40} width="120px" />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Skeleton height={40} width="200px" />
          <Skeleton height={40} width="150px" />
          <Skeleton height={40} width="100px" />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={20} />
            ))}
          </div>
          {/* Table Rows */}
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="grid grid-cols-5 gap-4 p-4 border-t">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={20} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="p-6 border rounded-lg space-y-4">
        <Skeleton height={24} width="60%" />
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="90%" />
        <div className="flex gap-2 pt-4">
          <Skeleton height={40} width="100px" />
          <Skeleton height={40} width="100px" />
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="p-6 space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Skeleton height={24} width="200px" />
          <Skeleton height={16} width="400px" />
        </div>

        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton height={16} width="100px" />
            <Skeleton height={40} width="100%" />
          </div>
        ))}

        <div className="flex gap-4 pt-4">
          <Skeleton height={40} width="120px" />
          <Skeleton height={40} width="120px" />
        </div>
      </div>
    );
  }

  // Default page layout
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton height={32} width="250px" />
        <Skeleton height={16} width="500px" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton height={200} width="100%" />
        <Skeleton height={200} width="100%" />
      </div>
    </div>
  );
}
