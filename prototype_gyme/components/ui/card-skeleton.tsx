
import SkeletonCustom from "@/components/ui/skeleton-custom";

export function CardSkeleton() {
  return (
    <div className="relative p-6  border border-white/10 rounded-xl space-y-4 overflow-hidden">

      {/* 🔥 Spinner Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        
        <div className="relative">
          {/* spinner */}
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>

          {/* glow */}
          <div className="absolute inset-0 rounded-full blur-lg bg-white/20 animate-pulse"></div>
        </div>

      </div>

      {/* 🔥 Skeleton Content */}
      <div className="opacity-40">
        <SkeletonCustom className="h-6 w-1/2 mx-auto" />
        <SkeletonCustom className="h-10 w-1/3 mx-auto" />

        <div className="space-y-2">
          <SkeletonCustom className="h-4 w-full" />
          <SkeletonCustom className="h-4 w-[80%]" />
          <SkeletonCustom className="h-4 w-[60%]" />
        </div>

        <SkeletonCustom className="h-10 w-full mt-4" />
      </div>

    </div>
  );
}

