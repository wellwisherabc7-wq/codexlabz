export default function Card({ children, className = '', title, actions }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h3 className="text-base font-semibold text-slate-800">{title}</h3> : <span />}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
