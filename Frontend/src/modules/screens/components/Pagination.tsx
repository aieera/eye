export default function Pagination({ page, setPage, totalPages }) {

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const goPrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const goNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">

      {/* Prev */}
      <button
        onClick={goPrev}
        disabled={page === 1}
        className="px-3 py-2 text-sm border rounded-xl shadow bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`w-8 h-9 text-sm rounded-xl shadow border flex items-center justify-center
          ${
            page === p
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={goNext}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm border rounded-xl shadow bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
      >
        Next
      </button>

    </div>
  );
}