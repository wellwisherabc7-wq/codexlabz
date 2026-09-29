import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { getClientDashboard } from '../../services/dashboardService';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setData(await getClientDashboard(user.clientId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.clientId) load();
    else setLoading(false);
  }, [user]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-600">{error}</p>;

  const company = data?.client?.companyName || 'there';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user?.name || company}</h1>
        <p className="text-sm text-slate-500">Track progress on your {company} projects</p>
      </div>
      {data?.projects?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.projects.map((p) => (
            <Card key={p._id}>
              <div className="flex items-start justify-between gap-3">
                <Link to={`/client/projects/${p._id}`} className="text-lg font-semibold text-primary hover:underline">
                  {p.name}
                </Link>
                <Badge value={p.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.description || 'No description'}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>
                    {p.progress}% ({p.taskDone}/{p.taskTotal} tasks)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No projects yet" description="Your consulting team will add projects here." />
      )}
    </div>
  );
}
