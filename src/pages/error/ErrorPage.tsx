import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isChunkError =
    error instanceof TypeError &&
    error.message.toLowerCase().includes("failed to fetch dynamically imported module");

  const title = isChunkError ? "Page failed to load" : "Something went wrong";
  const description = isChunkError
    ? "A network hiccup prevented the page from loading. This usually fixes itself with a refresh."
    : isRouteErrorResponse(error)
      ? `${error.status} — ${error.statusText}`
      : error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-white text-2xl font-semibold">{title}</h1>
      <p className="text-text-secondary text-sm max-w-sm">{description}</p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            sessionStorage.removeItem("chunk_reload_attempted");
            window.location.reload();
          }}
          className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-sm hover:opacity-90 transition-opacity"
        >
          Refresh page
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 border border-[#444] text-white text-sm font-bold rounded-sm hover:border-text-secondary transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
