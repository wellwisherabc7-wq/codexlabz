import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import { createClient, deleteClient, getClients } from '../../services/clientService';

const emptyForm = {
  companyName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  portalPassword: '',
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setClients(await getClients());
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
      await createClient(form);
      setForm(emptyForm);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this client, their portal login, projects and tasks?')) return;
    try {
      await deleteClient(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;

  const columns = [
    { key: 'companyName', header: 'Company' },
    { key: 'contactName', header: 'Contact' },
    { key: 'contactEmail', header: 'Email' },
    { key: 'contactPhone', header: 'Phone' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Link to={`/admin/clients/${row._id}`} className="text-sm font-medium text-primary hover:underline">
            Details
          </Link>
          <button type="button" className="text-sm text-red-600" onClick={() => onDelete(row._id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-slate-500">Each client gets a portal login using their contact email</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add client</Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Card>
        <Table
          columns={columns}
          rows={clients}
          empty={<EmptyState title="No clients yet" description="Add a client to get started." />}
        />
      </Card>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">New client</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm sm:col-span-2">
                Company name
                <input
                  name="companyName"
                  required
                  value={form.companyName}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Contact name
                <input
                  name="contactName"
                  value={form.contactName}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Phone
                <input
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Contact email (portal login)
                <input
                  type="email"
                  name="contactEmail"
                  required
                  value={form.contactEmail}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Portal password
                <input
                  type="password"
                  name="portalPassword"
                  required
                  value={form.portalPassword}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Create client'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
