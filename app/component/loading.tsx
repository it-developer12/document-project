export default function Loading() {
  return (
    <div
      className="flex min-h-[200px] w-full items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
