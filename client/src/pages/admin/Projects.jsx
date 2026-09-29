import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getClients } from '../../services/clientService';
import { createProject, getProjects } from '../../services/projectService';

const emptyForm = {
  clientId: '',
  name: '',
  description: '',
  status: 'ACTIVE',
  deadline: '',
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProjects(), getClients()]);
      setProjects(p);
      setClients(c);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProject({
        ...form,
        deadline: form.deadline || undefined,
      });
      setForm(emptyForm);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-slate-500">All client engagements</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add project</Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {projects.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={`/admin/projects/${p._id}`} className="text-lg font-semibold text-primary hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-sm text-slate-500">{p.clientId?.companyName}</p>
                </div>
                <Badge value={p.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{p.description || 'No description'}</p>
              <p className="mt-3 text-xs text-slate-400">Deadline {formatDate(p.deadline)}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No projects yet" description="Create a project for one of your clients." />
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">New project</h2>
            <div className="space-y-3">
              <label className="block text-sm">
                Client
                <select
                  name="clientId"
                  required
                  value={form.clientId}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Name
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </label>
                <label className="text-sm">
                  Deadline
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={onChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Create project'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
