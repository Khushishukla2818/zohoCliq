import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-4 w-4 mt-0.5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-4" />
      </div>
    </Card>
  );
}

export function DocumentSkeleton() {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>
    </Card>
  );
}

export function ActivitySkeleton() {
  return (
    <Card className="p-3">
      <div className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </Card>
  );
}

export function LoadingGrid({ type = 'task', count = 3 }: { type?: 'task' | 'doc' | 'activity'; count?: number }) {
  const SkeletonComponent = type === 'task' ? TaskSkeleton : type === 'doc' ? DocumentSkeleton : ActivitySkeleton;
  
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}
