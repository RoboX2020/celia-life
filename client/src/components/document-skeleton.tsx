import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DocumentSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="pt-2 border-t">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </Card>
  );
}
