
export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">

      <div className="flex flex-col items-center gap-8">

        {/* Glow Spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white animate-spin"></div>

          {/* glow effect */}
          <div className="absolute inset-0 rounded-full blur-xl bg-white/20 animate-pulse"></div>
        </div>

        {/* Text */}
        <h2 className="text-white text-xl font-bold tracking-widest animate-pulse">
          LOADING
        </h2>

      </div>
    </div>
  );
}
