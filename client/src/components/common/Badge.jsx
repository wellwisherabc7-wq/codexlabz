const styles = {
  DONE: 'bg-emerald-50 text-emerald-700',
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  TODO: 'bg-slate-100 text-slate-600',
  HIGH: 'bg-red-50 text-red-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  LOW: 'bg-slate-100 text-slate-600',
};

export default function Badge({ value }) {
  const cls = styles[value] || 'bg-red-50 text-red-700';
  const label = String(value || '').replaceAll('_', ' ');
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
