export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
