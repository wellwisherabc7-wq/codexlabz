import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getAdminDashboard } from '../../services/dashboardService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setData(await getAdminDashboard());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-600">{error}</p>;

  const counts = data.taskCounts || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <p className="text-sm text-slate-500">Overview of clients, projects and tasks</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Clients</p>
          <p className="mt-2 text-3xl font-semibold">{data.totalClients}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active projects</p>
          <p className="mt-2 text-3xl font-semibold">{data.totalActiveProjects}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Task counts</p>
          <p className="mt-2 text-sm text-slate-700">
            Todo {counts.TODO || 0} · In progress {counts.IN_PROGRESS || 0} · Done {counts.DONE || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Due soon</p>
          <p className="mt-2 text-3xl font-semibold">{data.dueSoonProjects?.length || 0}</p>
          <p className="text-xs text-slate-400">Nearest active deadlines</p>
        </Card>
      </div>
      <Card title="Due soon">
        {data.dueSoonProjects?.length ? (
          <ul className="divide-y divide-slate-100">
            {data.dueSoonProjects.map((p) => (
              <li key={p._id} className="flex items-center justify-between py-3">
                <div>
                  <Link to={`/admin/projects/${p._id}`} className="font-medium text-primary hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-500">{p.clientId?.companyName}</p>
                </div>
                <span className="text-sm text-slate-500">{formatDate(p.deadline)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No upcoming deadlines" />
        )}
      </Card>
      <Card title="Recent projects">
        {data.recentProjects?.length ? (
          <ul className="divide-y divide-slate-100">
            {data.recentProjects.map((p) => (
              <li key={p._id} className="flex items-center justify-between py-3">
                <div>
                  <Link to={`/admin/projects/${p._id}`} className="font-medium text-primary hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-500">{p.clientId?.companyName}</p>
                </div>
                <Badge value={p.status} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No projects yet" description="Create a client, then add a project." />
        )}
      </Card>
    </div>
  );
}
