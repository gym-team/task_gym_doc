"use client";

export default function Pagination({
  pageIndex,
  totalPages,
  setPageIndex,
}: any) {
  return (
    <div className="flex justify-center items-center gap-4 mt-12">
      {/* 🔙 Prev */}
      <button
        disabled={pageIndex === 1}
        onClick={() => setPageIndex(pageIndex - 1)}
        className="px-4 py-2 border border-white/20 text-white rounded-lg disabled:opacity-30 hover:border-[#84FF00]"
      >
        Prev
      </button>

      {/* 🔢 Numbers */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPageIndex(i + 1)}
          className={`px-4 py-2 rounded-lg ${
            pageIndex === i + 1
              ? "bg-[#84FF00] text-black"
              : "border border-white/20 text-white hover:border-[#84FF00]"
          }`}
        >
          {i + 1}
        </button>
      ))}

      {/* 🔜 Next */}
      <button
        disabled={pageIndex === totalPages}
        onClick={() => setPageIndex(pageIndex + 1)}
        className="px-4 py-2 border border-white/20 text-white rounded-lg disabled:opacity-30 hover:border-[#84FF00]"
      >
        Next
      </button>
    </div>
  );
}
