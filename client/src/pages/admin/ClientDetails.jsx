import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getClient, getClientProjects } from '../../services/clientService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

export default function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [c, p] = await Promise.all([getClient(id), getClientProjects(id)]);
        setClient(c);
        setProjects(p);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!client) return <EmptyState title="Client not found" />;

  return (
    <div className="space-y-6">
      <Link to="/admin/clients" className="text-sm text-primary hover:underline">
        Back to clients
      </Link>
      <Card title={client.companyName}>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500">Contact</dt>
            <dd>{client.contactName || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd>{client.contactEmail || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd>{client.contactPhone || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd>{formatDate(client.createdAt)}</dd>
          </div>
        </dl>
      </Card>
      <Card title="Projects">
        {projects.length ? (
          <ul className="divide-y divide-slate-100">
            {projects.map((p) => (
              <li key={p._id} className="flex items-center justify-between py-3">
                <Link to={`/admin/projects/${p._id}`} className="font-medium text-primary hover:underline">
                  {p.name}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{formatDate(p.deadline)}</span>
                  <Badge value={p.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No projects for this client" />
        )}
      </Card>
    </div>
  );
}
