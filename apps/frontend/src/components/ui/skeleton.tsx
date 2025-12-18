import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

function PostCardSkeleton() {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      {/* Image */}
      <Skeleton className="aspect-square" />
      {/* Actions */}
      <div className="p-3 space-y-3">
        <div className="flex gap-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="flex gap-20 mb-12 pt-8">
      <Skeleton className="w-36 h-36 rounded-full" />
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex gap-10">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}

function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-6 py-3">
      <Skeleton className="h-11 w-11 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  PostCardSkeleton,
  ProfileHeaderSkeleton,
  PostGridSkeleton,
  ConversationSkeleton,
  NotificationSkeleton,
};


